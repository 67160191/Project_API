const request = require("supertest");
const app = require("../index");
const pool = require("../db");

describe("Database Routes Mocked Tests (High Coverage & Deterministic)", () => {
  let querySpy;

  beforeEach(() => {
    querySpy = jest.spyOn(pool, "query");
  });

  afterEach(() => {
    querySpy.mockRestore();
  });

  test("GET /api/v1/tasks - ดึงรายการงานพร้อม tags สำเร็จ (200 OK)", async () => {
    querySpy.mockResolvedValueOnce([
      [
        {
          id: 1,
          title: "ทดสอบดึงงาน",
          description: "รายละเอียด",
          due_date: "2026-10-30",
          status: "pending",
          owner: "somchai",
          user_id: 1,
          tags: "Urgent, Work",
        },
      ],
    ]);

    const res = await request(app).get("/api/v1/tasks");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].tags).toEqual(["Urgent", "Work"]);
  });

  test("GET /api/v1/tasks/:id - พบงานที่มีอยู่จริง (200 OK)", async () => {
    querySpy
      .mockResolvedValueOnce([
        [
          {
            id: 1,
            title: "งานที่ 1",
            description: "รายละเอียดงาน",
            due_date: "2026-10-30",
            status: "pending",
            user_id: 1,
            owner: "somchai",
            owner_email: "somchai@example.com",
            created_at: "2026-10-01T00:00:00Z",
          },
        ],
      ])
      .mockResolvedValueOnce([
        [{ id: 1, name: "Urgent" }],
      ]);

    const res = await request(app).get("/api/v1/tasks/1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("งานที่ 1");
    expect(res.body.data.tags.length).toBe(1);
  });

  test("GET /api/v1/tasks/:id - ไม่พบงานในระบบ (404 Not Found)", async () => {
    querySpy.mockResolvedValueOnce([[]]);

    const res = await request(app).get("/api/v1/tasks/9999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/v1/tasks - สร้างงานใหม่สำเร็จ (201 Created)", async () => {
    querySpy
      .mockResolvedValueOnce([[{ id: 1 }]]) // check user
      .mockResolvedValueOnce([{ insertId: 10 }]) // insert task
      .mockResolvedValueOnce([{}]) // insert task_tags
      .mockResolvedValueOnce([[{ id: 10, title: "งานใหม่", status: "pending" }]]) // select created task
      .mockResolvedValueOnce([[{ id: 1, name: "Work" }]]); // select tags

    const res = await request(app)
      .post("/api/v1/tasks")
      .send({
        title: "งานใหม่",
        description: "รายละเอียด",
        due_date: "2026-12-01",
        user_id: 1,
        tag_ids: [1],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("สร้างงานใหม่สำเร็จ");
  });

  test("POST /api/v1/tasks - ระบุ user_id ที่ไม่มีในระบบ (404 Not Found)", async () => {
    querySpy.mockResolvedValueOnce([[]]); // user not found

    const res = await request(app)
      .post("/api/v1/tasks")
      .send({
        title: "งานใหม่",
        user_id: 9999,
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("USER_NOT_FOUND");
  });

  test("PUT /api/v1/tasks/:id - อัปเดตข้อมูลงานสำเร็จ (200 OK)", async () => {
    querySpy
      .mockResolvedValueOnce([[{ id: 1 }]]) // check task exists
      .mockResolvedValueOnce([[{ id: 1 }]]) // check user exists
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // update task
      .mockResolvedValueOnce([{}]) // delete old tags
      .mockResolvedValueOnce([{}]) // insert new tags
      .mockResolvedValueOnce([[{ id: 1, title: "แก้ไขแล้ว", status: "in_progress" }]]) // select updated task
      .mockResolvedValueOnce([[{ id: 2, name: "Home" }]]); // select tags

    const res = await request(app)
      .put("/api/v1/tasks/1")
      .send({
        title: "แก้ไขแล้ว",
        description: "รายละเอียดแก้ไข",
        status: "in_progress",
        due_date: "2026-12-10",
        user_id: 1,
        tag_ids: [2],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/v1/tasks/:id/status - อัปเดตสถานะงานสำเร็จ (200 OK)", async () => {
    querySpy
      .mockResolvedValueOnce([[{ id: 1 }]]) // check task exists
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // update task

    const res = await request(app)
      .patch("/api/v1/tasks/1/status")
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/v1/tasks/:id/status - ไม่พบงาน (404 Not Found)", async () => {
    querySpy.mockResolvedValueOnce([[]]); // check task exists returns empty

    const res = await request(app)
      .patch("/api/v1/tasks/999/status")
      .send({ status: "completed" });

    expect(res.status).toBe(404);
  });

  test("DELETE /api/v1/tasks/:id - ลบงานสำเร็จ (200 OK)", async () => {
    querySpy
      .mockResolvedValueOnce([[{ id: 1 }]]) // check task exists
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // delete task

    const res = await request(app).delete("/api/v1/tasks/1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/v1/tasks/:id - ไม่พบงานที่จะลบ (404 Not Found)", async () => {
    querySpy.mockResolvedValueOnce([[]]); // check task exists returns empty

    const res = await request(app).delete("/api/v1/tasks/999");
    expect(res.status).toBe(404);
  });

  test("GET /api/v1/users - ดึงรายชื่อผู้ใช้ทั้งหมด (200 OK)", async () => {
    querySpy.mockResolvedValueOnce([
      [{ id: 1, username: "somchai", email: "somchai@example.com" }],
    ]);

    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  test("GET /api/v1/tags - ดึงรายการป้ายกำกับทั้งหมด (200 OK)", async () => {
    querySpy.mockResolvedValueOnce([[{ id: 1, name: "Urgent" }]]);

    const res = await request(app).get("/api/v1/tags");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  test("POST /api/v1/tags - สร้างป้ายกำกับใหม่สำเร็จ (201 Created)", async () => {
    querySpy.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .post("/api/v1/tags")
      .send({ name: "Research" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Research");
  });

  test("POST /api/v1/tags - ชื่อแท็กซ้ำ (400 Duplicate Tag)", async () => {
    const dupErr = new Error("Duplicate entry");
    dupErr.code = "ER_DUP_ENTRY";
    querySpy.mockRejectedValueOnce(dupErr);

    const res = await request(app)
      .post("/api/v1/tags")
      .send({ name: "Urgent" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("DUPLICATE_TAG");
  });

  test("safeDbQuery - จัดการกรณี ECONNREFUSED ตอบกลับ 503", async () => {
    const connErr = new Error("Connection refused");
    connErr.code = "ECONNREFUSED";
    querySpy.mockRejectedValueOnce(connErr);

    const res = await request(app).get("/api/v1/users");
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("DB_CONNECTION_REFUSED");
  });
});
