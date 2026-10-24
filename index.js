require("dotenv").config();

const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Tasks Management API is running",
  });
});

app.get("/api/v1/tasks", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        t.id,
        t.title,
        t.description,
        t.due_date,
        t.status,
        u.username AS owner
      FROM tasks t
      INNER JOIN users u
        ON t.user_id = u.id
      ORDER BY t.id`
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/v1/tasks/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        t.id,
        t.title,
        t.description,
        t.due_date,
        t.status,
        u.username AS owner
      FROM tasks t
      INNER JOIN users u
        ON t.user_id = u.id
      WHERE t.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "ไม่พบงานที่ระบุ",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "ไม่สามารถดึงข้อมูลงานได้",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
