require("dotenv").config();

const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const pool = require("./db");
const { getWeatherWithResilience } = require("./services/weatherService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware สำหรับแปลง Request Body เป็น JSON
app.use(express.json());

// โหลดไฟล์ OpenAPI Specification สำหรับ Swagger UI
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

// -------------------------------------------------------------
// ส่วนที่ 1: Docs / DX - Swagger UI & OpenAPI Endpoints
// -------------------------------------------------------------

// ให้บริการหน้า Swagger UI ที่ /api-docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: block; }",
    customSiteTitle: "Task Management API Docs - Phase 2",
  })
);

// ให้บริการ Raw JSON ของ OpenAPI Spec ที่ /api-docs.json (สะดวกต่อการนำเข้า Postman)
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

// หน้า Root แนะนำ API และลิงก์ไปยัง Documentation
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tasks Management API (Phase 2: Docs/DX & Integration) is running",
    version: "2.0.0",
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      tasks: "/api/v1/tasks",
      users: "/api/v1/users",
      tags: "/api/v1/tags",
      weather_integration: "/api/v1/tasks/:id/weather",
      swagger_ui: "/api-docs",
      openapi_spec: "/api-docs.json",
    },
  });
});

// -------------------------------------------------------------
// Helper Function: ตรวจสอบการเชื่อมต่อ Database อย่างปลอดภัย
// -------------------------------------------------------------
async function safeDbQuery(queryFn) {
  try {
    return await queryFn();
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      const dbErr = new Error("ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL ได้ กรุณาตรวจสอบว่าเปิด MySQL Server แล้วหรือไม่");
      dbErr.statusCode = 503;
      dbErr.code = "DB_CONNECTION_REFUSED";
      throw dbErr;
    }
    throw err;
  }
}

// -------------------------------------------------------------
// ส่วนที่ 2: Tasks Resource Endpoints (CRUD)
// -------------------------------------------------------------

/**
 * 1. GET /api/v1/tasks
 * ดึงรายการงานทั้งหมด รองรับการกรองด้วย query param: status และ user_id
 */
app.get("/api/v1/tasks", async (req, res, next) => {
  try {
    const { status, user_id } = req.query;

    const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `ค่า status ไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${validStatuses.join(", ")}`,
        },
      });
    }

    let sql = `
      SELECT
        t.id,
        t.title,
        t.description,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        t.status,
        t.user_id,
        u.username AS owner,
        GROUP_CONCAT(tg.name SEPARATOR ', ') AS tags
      FROM tasks t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
    `;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("t.status = ?");
      params.push(status);
    }
    if (user_id) {
      conditions.push("t.user_id = ?");
      params.push(user_id);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " GROUP BY t.id ORDER BY t.id";

    const [rows] = await safeDbQuery(() => pool.query(sql, params));

    // แปลงสตริง tags เป็น Array
    const formattedRows = rows.map((row) => ({
      ...row,
      tags: row.tags ? row.tags.split(", ") : [],
    }));

    res.status(200).json({
      success: true,
      total: formattedRows.length,
      data: formattedRows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 2. GET /api/v1/tasks/:id
 * ดึงรายละเอียดงานตาม Task ID (รวมทั้งข้อมูล Owner และ Tags)
 */
app.get("/api/v1/tasks/:id", async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: "รหัสงาน (id) ต้องเป็นตัวเลขจำนวนเต็ม",
        },
      });
    }

    const [taskRows] = await safeDbQuery(() =>
      pool.query(
        `SELECT
          t.id,
          t.title,
          t.description,
          DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
          t.status,
          t.user_id,
          t.created_at,
          u.username AS owner,
          u.email AS owner_email
        FROM tasks t
        INNER JOIN users u ON t.user_id = u.id
        WHERE t.id = ?`,
        [taskId]
      )
    );

    if (taskRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `ไม่พบงานรหัส ${taskId} ในระบบ`,
        },
      });
    }

    // ดึง Tags ที่ผูกกับงานนี้
    const [tagRows] = await safeDbQuery(() =>
      pool.query(
        `SELECT tg.id, tg.name
         FROM tags tg
         INNER JOIN task_tags tt ON tg.id = tt.tag_id
         WHERE tt.task_id = ?`,
        [taskId]
      )
    );

    const task = {
      ...taskRows[0],
      tags: tagRows,
    };

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 3. POST /api/v1/tasks
 * สร้างงานใหม่ (Create Task)
 */
app.post("/api/v1/tasks", async (req, res, next) => {
  try {
    const { title, description, due_date, status = "pending", user_id, tag_ids = [] } = req.body;

    // ตรวจสอบ Validation เบื้องต้น
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "ต้องระบุชื่อหัวข้องาน (title)",
        },
      });
    }

    if (!user_id || isNaN(parseInt(user_id, 10))) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "ต้องระบุรหัสผู้ใช้ที่เป็นเจ้าของงาน (user_id) ให้ถูกต้อง",
        },
      });
    }

    const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `สถานะงาน (status) ต้องเป็นหนึ่งใน: ${validStatuses.join(", ")}`,
        },
      });
    }

    // ตรวจสอบว่ามีผู้ใช้งานนี้อยู่จริงหรือไม่
    const [userRows] = await safeDbQuery(() =>
      pool.query("SELECT id, username FROM users WHERE id = ?", [user_id])
    );
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: `ไม่พบผู้ใช้งานรหัส ${user_id} ในระบบ`,
        },
      });
    }

    // บันทึกลงตาราง tasks
    const [insertResult] = await safeDbQuery(() =>
      pool.query(
        "INSERT INTO tasks (title, description, due_date, status, user_id) VALUES (?, ?, ?, ?, ?)",
        [title.trim(), description || null, due_date || null, status, user_id]
      )
    );

    const newTaskId = insertResult.insertId;

    // หากมีการระบุ tag_ids ให้ผูกความสัมพันธ์ลงตาราง task_tags
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      const tagValues = tag_ids.map((tagId) => [newTaskId, tagId]);
      await safeDbQuery(() =>
        pool.query("INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES ?", [tagValues])
      );
    }

    res.status(201).json({
      success: true,
      message: "สร้างงานใหม่สำเร็จ",
      data: {
        id: newTaskId,
        title: title.trim(),
        description: description || null,
        due_date: due_date || null,
        status: status,
        user_id: user_id,
        owner: userRows[0].username,
        tag_ids: tag_ids,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 4. PUT /api/v1/tasks/:id
 * ปรับปรุงข้อมูลงานทั้งหมด (Update Task)
 */
app.put("/api/v1/tasks/:id", async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "รหัสงานต้องเป็นตัวเลข" },
      });
    }

    const { title, description, due_date, status, user_id, tag_ids } = req.body;

    if (!title || !user_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "ต้องระบุฟิลด์ title และ user_id ให้ครบถ้วน",
        },
      });
    }

    // ตรวจสอบว่ามีงานนี้อยู่หรือไม่
    const [existing] = await safeDbQuery(() =>
      pool.query("SELECT id FROM tasks WHERE id = ?", [taskId])
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `ไม่พบงานรหัส ${taskId}` },
      });
    }

    // อัปเดตข้อมูลงาน
    await safeDbQuery(() =>
      pool.query(
        "UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ?, user_id = ? WHERE id = ?",
        [title, description || null, due_date || null, status || "pending", user_id, taskId]
      )
    );

    // หากมีการส่ง tag_ids มา ให้อัปเดตตารางเชื่อม
    if (Array.isArray(tag_ids)) {
      await safeDbQuery(() => pool.query("DELETE FROM task_tags WHERE task_id = ?", [taskId]));
      if (tag_ids.length > 0) {
        const tagValues = tag_ids.map((tagId) => [taskId, tagId]);
        await safeDbQuery(() =>
          pool.query("INSERT IGNORE INTO task_tags (task_id, tag_id) VALUES ?", [tagValues])
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "แก้ไขข้อมูลงานสำเร็จ",
      data: {
        id: taskId,
        title,
        description,
        due_date,
        status,
        user_id,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 5. PATCH /api/v1/tasks/:id/status
 * อัปเดตเฉพาะสถานะของงาน (Update Task Status)
 */
app.patch("/api/v1/tasks/:id/status", async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: `ค่า status ไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${validStatuses.join(", ")}`,
        },
      });
    }

    const [existing] = await safeDbQuery(() =>
      pool.query("SELECT id FROM tasks WHERE id = ?", [taskId])
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `ไม่พบงานรหัส ${taskId}` },
      });
    }

    await safeDbQuery(() =>
      pool.query("UPDATE tasks SET status = ? WHERE id = ?", [status, taskId])
    );

    res.status(200).json({
      success: true,
      message: `อัปเดตสถานะงานเป็น '${status}' สำเร็จ`,
      data: {
        id: taskId,
        status: status,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 6. DELETE /api/v1/tasks/:id
 * ลบงานออกจากระบบ
 */
app.delete("/api/v1/tasks/:id", async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    const [existing] = await safeDbQuery(() =>
      pool.query("SELECT id FROM tasks WHERE id = ?", [taskId])
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: `ไม่พบงานรหัส ${taskId}` },
      });
    }

    await safeDbQuery(() => pool.query("DELETE FROM tasks WHERE id = ?", [taskId]));

    res.status(200).json({
      success: true,
      message: `ลบงานรหัส ${taskId} เรียบร้อยแล้ว`,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// ส่วนที่ 3: External API Integration & Resilience Endpoints
// -------------------------------------------------------------

/**
 * 7. GET /api/v1/tasks/:id/weather
 * เชื่อมต่อบริการภายนอก Open-Meteo Weather API เพื่อตรวจสอบสภาพอากาศสำหรับงาน
 * รองรับกลไก Resilience: Timeout (3s), Retry (2 ครั้ง พร้อม Exponential Backoff), Fallback
 * รองรับ Query Parameter ?mockFailure=network|timeout|500 เพื่อจำลองความผิดพลาด
 */
app.get("/api/v1/tasks/:id/weather", async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { mockFailure } = req.query;

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "รหัสงานต้องเป็นตัวเลข" },
      });
    }

    let taskTitle = `Task #${taskId}`;
    let dueDate = null;

    // พยายามค้นหาชื่องานจากฐานข้อมูล (ถ้าฐานข้อมูลพร้อมใช้งาน)
    try {
      const [rows] = await pool.query(
        "SELECT title, DATE_FORMAT(due_date, '%Y-%m-%d') as due_date FROM tasks WHERE id = ?",
        [taskId]
      );
      if (rows.length > 0) {
        taskTitle = rows[0].title;
        dueDate = rows[0].due_date;
      }
    } catch (dbErr) {
      // หากติดต่อ DB ไม่ได้ อนุโลมให้ทดสอบ Integration ต่อได้โดยไม่บล็อก
      console.warn("[Weather Route] Database offline, continuing with default task context...");
    }

    // เรียกใช้ Weather Service ที่มีระบบ Retry, Timeout และ Fallback สมบูรณ์แบบ
    const weatherResult = await getWeatherWithResilience({
      taskId: taskId,
      city: "Bangkok",
      mockFailure: mockFailure,
    });

    res.status(200).json({
      ...weatherResult,
      taskInfo: {
        taskId: taskId,
        title: taskTitle,
        due_date: dueDate,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 8. GET /api/v1/weather
 * ดึงข้อมูลสภาพอากาศทั่วไปหรือทดสอบ Failure Scenarios โดยตรง
 */
app.get("/api/v1/weather", async (req, res, next) => {
  try {
    const { city = "Bangkok", lat, lon, mockFailure } = req.query;

    const weatherResult = await getWeatherWithResilience({
      city,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lon ? parseFloat(lon) : undefined,
      mockFailure,
    });

    res.status(200).json(weatherResult);
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// ส่วนที่ 4: Users & Tags Resources Endpoints
// -------------------------------------------------------------

/**
 * 9. GET /api/v1/users
 * ดึงรายชื่อผู้ใช้งานทั้งหมด
 */
app.get("/api/v1/users", async (req, res, next) => {
  try {
    const [rows] = await safeDbQuery(() =>
      pool.query("SELECT id, username, email, created_at FROM users ORDER BY id")
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 10. GET /api/v1/tags
 * ดึงรายการป้ายกำกับทั้งหมด
 */
app.get("/api/v1/tags", async (req, res, next) => {
  try {
    const [rows] = await safeDbQuery(() =>
      pool.query("SELECT id, name FROM tags ORDER BY id")
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 11. POST /api/v1/tags
 * สร้างป้ายกำกับใหม่
 */
app.post("/api/v1/tags", async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "ต้องระบุชื่อป้ายกำกับ (name)" },
      });
    }

    const [result] = await safeDbQuery(() =>
      pool.query("INSERT INTO tags (name) VALUES (?)", [name.trim()])
    );

    res.status(201).json({
      success: true,
      message: "สร้างป้ายกำกับใหม่สำเร็จ",
      data: {
        id: result.insertId,
        name: name.trim(),
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        error: { code: "DUPLICATE_TAG", message: "มีป้ายกำกับชื่อนี้อยู่ในระบบแล้ว" },
      });
    }
    next(err);
  }
});

// -------------------------------------------------------------
// ส่วนที่ 5: 404 Route Not Found & Central Error Handler
// -------------------------------------------------------------

// จัดการกรณีเรียก Endpoint ที่ไม่มีในระบบ (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `ไม่พบ Endpoint: ${req.method} ${req.originalUrl}`,
      suggestion: `สามารถเปิดดูเอกสาร API ทั้งหมดได้ที่ http://localhost:${PORT}/api-docs`,
    },
  });
});

// Central Error Handler Middleware (จัดการ Error รวมทั้งหมด)
app.use((err, req, res, next) => {
  console.error("[ServerError]", err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    },
  });
});

// เริ่มต้นเปิด Server หากรันไฟล์นี้โดยตรง
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Task Management API Server running at http://localhost:${PORT}`);
    console.log(`📖 Swagger UI Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`📄 Raw OpenAPI Spec (JSON):  http://localhost:${PORT}/api-docs.json`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
