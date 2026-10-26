/**
 * Notification Microservice (Week 13 Integration)
 * จัดการการส่งการแจ้งเตือนงาน (Task Notification & Reminders)
 * รองรับช่องทาง Email, SMS, Webhook พร้อมเก็บบันทึกประวัติการส่ง (Dispatch Log)
 */

// In-memory Log Store สำหรับบันทึกประวัติการส่งแจ้งเตือนของ Microservice
const notificationLogs = [
  {
    id: "notif-001",
    taskId: 1,
    recipient: "somchai@example.com",
    channel: "email",
    subject: "แจ้งเตือนงาน: ทำรายงานสรุปประจำเดือน",
    message: "งานของคุณมีกำหนดส่งในวันที่ 2026-08-31 กรุณาตรวจสอบความคืบหน้า",
    priority: "high",
    status: "DELIVERED",
    sentAt: "2026-08-28T09:00:00.000Z",
    deliveryDurationMs: 142,
  },
  {
    id: "notif-002",
    taskId: 3,
    recipient: "mana@example.com",
    channel: "webhook",
    subject: "แจ้งเตือนงานด่วน: เตรียมพรีเซนต์โปรเจกต์",
    message: "งานด่วนของคุณครบกำหนดส่งวันนี้ กรุณาเตรียมสไลด์",
    priority: "urgent",
    status: "DELIVERED",
    sentAt: "2026-08-25T08:30:00.000Z",
    deliveryDurationMs: 89,
  },
];

/**
 * ส่งการแจ้งเตือนสำหรับงาน
 */
async function sendNotification({ taskId, recipient, channel = "email", message, subject, priority = "normal" }) {
  const startTime = Date.now();

  // ตรวจสอบความถูกต้องของ Input
  if (!taskId || !recipient || !message) {
    throw new Error("ต้องระบุ taskId, recipient และ message");
  }

  const validChannels = ["email", "sms", "webhook"];
  if (!validChannels.includes(channel)) {
    throw new Error(`ช่องทางการแจ้งเตือนไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${validChannels.join(", ")}`);
  }

  // จำลองการประมวลผลส่งผ่าน Microservice Gateway
  await new Promise((r) => setTimeout(r, 60));

  const logEntry = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    taskId: parseInt(taskId, 10),
    recipient,
    channel,
    subject: subject || `การแจ้งเตือนเกี่ยวกับงาน #${taskId}`,
    message,
    priority,
    status: "DELIVERED",
    sentAt: new Date().toISOString(),
    deliveryDurationMs: Date.now() - startTime,
  };

  notificationLogs.unshift(logEntry);

  return logEntry;
}

/**
 * ดึงรายการบันทึกประวัติการแจ้งเตือนทั้งหมด
 */
function getNotificationLogs({ taskId, channel, limit = 50 } = {}) {
  let filtered = [...notificationLogs];

  if (taskId) {
    filtered = filtered.filter((n) => n.taskId === parseInt(taskId, 10));
  }
  if (channel) {
    filtered = filtered.filter((n) => n.channel === channel);
  }

  return filtered.slice(0, parseInt(limit, 10));
}

module.exports = {
  sendNotification,
  getNotificationLogs,
};
