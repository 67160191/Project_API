/**
 * Microservices Test Suite (Week 13 Tests)
 * ทดสอบ Notification Microservice และ Analytics Microservice
 */

const { sendNotification, getNotificationLogs } = require("../services/notificationService");
const { getTasksAnalytics } = require("../services/analyticsService");

describe("3. Microservices Test Suite", () => {
  describe("Notification Microservice", () => {
    test("sendNotification - ควรส่งการแจ้งเตือนและบันทึกประวัติสำเร็จ", async () => {
      const entry = await sendNotification({
        taskId: 1,
        recipient: "user@test.com",
        channel: "email",
        message: "ข้อความแจ้งเตือนทดสอบ",
        priority: "high",
      });

      expect(entry.id).toBeDefined();
      expect(entry.taskId).toBe(1);
      expect(entry.status).toBe("DELIVERED");
      expect(entry.deliveryDurationMs).toBeGreaterThanOrEqual(0);
    });

    test("sendNotification - ควรโยน Error เมื่อข้อมูลไม่ครบ", async () => {
      await expect(
        sendNotification({
          taskId: 1,
          // recipient หายไป
          message: "test",
        })
      ).rejects.toThrow("ต้องระบุ taskId, recipient และ message");
    });

    test("sendNotification - ควรโยน Error เมื่อระบุ channel ผิด", async () => {
      await expect(
        sendNotification({
          taskId: 1,
          recipient: "user@test.com",
          channel: "pigeon", // invalid
          message: "test",
        })
      ).rejects.toThrow("ช่องทางการแจ้งเตือนไม่ถูกต้อง");
    });

    test("getNotificationLogs - ควรดึงประวัติการส่งแจ้งเตือนได้", () => {
      const logs = getNotificationLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe("Analytics Microservice", () => {
    test("getTasksAnalytics - ควรคำนวณสรุปสถิติและอัตราสำเร็จได้", async () => {
      const result = await getTasksAnalytics();

      expect(result.summary).toBeDefined();
      expect(result.summary.totalTasks).toBeGreaterThanOrEqual(0);
      expect(result.summary.completionRatePercent).toBeGreaterThanOrEqual(0);
      expect(result.summary.completionRatePercent).toBeLessThanOrEqual(100);
      expect(result.performanceScore).toBeDefined();
      expect(result.microserviceVersion).toBe("1.2.0");
    });
  });
});
