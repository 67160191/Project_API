/**
 * Tasks API Test Suite (Week 9 & 13 Integration Tests)
 * ทดสอบ Endpoints หลักและ Microservices ในระบบ Express
 */

const request = require("supertest");
const app = require("../index");

describe("1. Tasks API & Unified Routes Integration Tests", () => {
  test("GET / - ควรส่งคืน HTTP 200 และสถานะระบบเมื่อขอเป็น JSON", async () => {
    const res = await request(app)
      .get("/")
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.version).toBe("3.0.0");
  });

  test("GET /app - ควรส่งคืนหน้าเว็บ HTML สำหรับ Client Frontend", async () => {
    const res = await request(app).get("/app");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
    expect(res.text).toContain("TaskFlow Pro");
  });

  test("GET /api-docs - ควรเปิดหน้า Swagger UI ได้ด้วย HTTP 200", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
  });

  test("GET /api-docs.json - ควรส่งคืนเอกสาร OpenAPI Spec รูปแบบ JSON", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toBe("Task Management System API");
  });

  test("POST /api/v1/tasks - ควรตอบกลับ 400 Validation Error เมื่อไม่มี title", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .send({
        description: "ไม่มีหัวข้องาน",
        user_id: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/v1/tasks - ควรตอบกลับ 400 Validation Error เมื่อไม่มี user_id", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .send({
        title: "งานทดสอบ",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("PATCH /api/v1/tasks/1/status - ควรตอบกลับ 400 เมื่อระบุ status ไม่ถูกต้อง", async () => {
    const res = await request(app)
      .patch("/api/v1/tasks/1/status")
      .send({
        status: "unknown_status_xyz",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INVALID_STATUS");
  });

  test("GET /api/v1/tasks/abc - ควรตอบกลับ 400 เมื่อ id ไม่ใช่ตัวเลข", async () => {
    const res = await request(app).get("/api/v1/tasks/abc");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ID");
  });

  test("PUT /api/v1/tasks/abc - ควรตอบกลับ 400 เมื่อ id ไม่ใช่ตัวเลข", async () => {
    const res = await request(app)
      .put("/api/v1/tasks/abc")
      .send({ title: "Updated", user_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ID");
  });

  test("PUT /api/v1/tasks/1 - ควรตอบกลับ 400 เมื่อข้อมูลไม่ครบ (ขาด title)", async () => {
    const res = await request(app)
      .put("/api/v1/tasks/1")
      .send({ user_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/v1/tags - ควรตอบกลับ 400 เมื่อไม่มีชื่อ tag (name)", async () => {
    const res = await request(app)
      .post("/api/v1/tags")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("GET /api/v1/analytics/summary - ควรดึงข้อมูลสรุปจาก Analytics Microservice ได้", async () => {
    const res = await request(app).get("/api/v1/analytics/summary");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary).toBeDefined();
    expect(res.body.microserviceVersion).toBe("1.2.0");
  });

  test("POST /api/v1/notifications/send - ควรส่งการแจ้งเตือนสำเร็จ (201 Created)", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/send")
      .send({
        taskId: 1,
        recipient: "somchai@test.com",
        channel: "email",
        message: "งานครบกำหนดส่งแล้ว",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  test("POST /api/v1/notifications/send - ควรตอบกลับ 400 เมื่อข้อมูลไม่ครบ", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/send")
      .send({
        taskId: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/v1/notifications/logs - ควรดึงประวัติการส่งแจ้งเตือนได้", async () => {
    const res = await request(app).get("/api/v1/notifications/logs");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/v1/weather - ควรดึงข้อมูลสภาพอากาศได้", async () => {
    const res = await request(app).get("/api/v1/weather?city=Bangkok");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.weather).toBeDefined();
  });

  test("GET /api/v1/tasks/1/weather - ควรดึงข้อมูลสภาพอากาศสำหรับงานได้", async () => {
    const res = await request(app).get("/api/v1/tasks/1/weather");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.weather).toBeDefined();
  });

  test("GET /api/v1/tasks/invalid-id/weather - ควรตอบกลับ 400 เมื่อ id ไม่ถูกต้อง", async () => {
    const res = await request(app).get("/api/v1/tasks/invalid-id/weather");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ID");
  });

  test("GET /api/v1/non-existent-route - ควรตอบกลับ 404 Route Not Found", async () => {
    const res = await request(app).get("/api/v1/non-existent-route");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
