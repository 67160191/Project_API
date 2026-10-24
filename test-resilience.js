/**
 * Automated Resilience Test Script
 * รันเพื่อทดสอบกลไก Resilience (Retry, Timeout, Fallback) ในทั้ง 4 สถานการณ์:
 * 1. Happy Path (API ทำงานปกติ)
 * 2. Network Error (DNS/URL ผิดพลาด)
 * 3. Timeout (การเชื่อมต่อเกินเวลา 3000ms)
 * 4. 5xx Server Error (External Server คืน 500)
 */

const { getWeatherWithResilience } = require("./services/weatherService");

async function runTests() {
  console.log("===============================================================");
  console.log("🚀 เริ่มต้นการทดสอบ RESILIENCE TESTING (RETRY, TIMEOUT, FALLBACK)");
  console.log("===============================================================");

  // Scenario 1: Normal Happy Path
  console.log("\n=======================================================");
  console.log("🧪 SCENARIO 1: NORMAL OPERATION (HAPPY PATH)");
  console.log("คำอธิบาย: เรียก Weather API ภายนอกของจริง คาดหวังการตอบกลับสำเร็จ");
  console.log("=======================================================");
  const res1 = await getWeatherWithResilience({
    city: "Bangkok",
    taskId: 1,
  });
  console.log("ผลลัพธ์ Scenario 1:");
  console.log(`- Success: ${res1.success}`);
  console.log(`- Is Fallback: ${res1.isFallback}`);
  console.log(`- Attempts Made: ${res1.resilienceMeta.attemptsMade}`);
  console.log(`- Condition: ${res1.weather.condition}`);
  console.log(`- Temperature: ${res1.weather.temperature_celsius}°C`);
  console.log(`- Recommendation: ${res1.weather.recommendation}`);

  // Scenario 2: Network Failure
  console.log("\n=======================================================");
  console.log("🧪 SCENARIO 2: NETWORK FAILURE (UNREACHABLE DOMAIN)");
  console.log("คำอธิบาย: จำลองข้อผิดพลาด Network Error โดยเรียกโดเมนที่ไม่มีอยู่จริง");
  console.log("คาดหวัง: ระบบ Retry อัตโนมัติ 2 ครั้ง (รวม 3 attempts) แล้วเข้าสู่ Fallback");
  console.log("=======================================================");
  const res2 = await getWeatherWithResilience({
    city: "Bangkok",
    taskId: 1,
    mockFailure: "network",
  });
  console.log("ผลลัพธ์ Scenario 2:");
  console.log(`- Success: ${res2.success}`);
  console.log(`- Is Fallback: ${res2.isFallback}`);
  console.log(`- Attempts Made: ${res2.resilienceMeta.attemptsMade}`);
  console.log(`- Status: ${res2.resilienceMeta.status}`);
  console.log(`- Error Reason: ${res2.resilienceMeta.errorReason}`);
  console.log(`- Fallback Message: ${res2.message}`);

  // Scenario 3: Timeout Failure
  console.log("\n=======================================================");
  console.log("🧪 SCENARIO 3: TIMEOUT FAILURE (SERVER HANG / LATENCY > 1500MS)");
  console.log("คำอธิบาย: จำลอง API ภายนอกค้าง โดยกำหนด timeout = 1500ms");
  console.log("คาดหวัง: แต่ละครั้งตัดการทำงานด้วย AbortController เมื่อเกิน 1500ms แล้ว Retry จนครบแล้ว Fallback");
  console.log("=======================================================");
  const res3 = await getWeatherWithResilience({
    city: "Bangkok",
    taskId: 2,
    mockFailure: "timeout",
    timeoutMs: 1000, // ปรับ timeout สำหรับการทดสอบให้เร็วขึ้น
  });
  console.log("ผลลัพธ์ Scenario 3:");
  console.log(`- Success: ${res3.success}`);
  console.log(`- Is Fallback: ${res3.isFallback}`);
  console.log(`- Attempts Made: ${res3.resilienceMeta.attemptsMade}`);
  console.log(`- Status: ${res3.resilienceMeta.status}`);
  console.log(`- Error Reason: ${res3.resilienceMeta.errorReason}`);

  // Scenario 4: HTTP 500 Error
  console.log("\n=======================================================");
  console.log("🧪 SCENARIO 4: 5xx SERVER ERROR (HTTP 500 INTERNAL SERVER ERROR)");
  console.log("คำอธิบาย: จำลองผู้ให้บริการภายนอกล่ม ส่งกลับรหัส 500");
  console.log("คาดหวัง: Retry จนครบตามรอบ แล้วส่ง Fallback กลับอย่างปลอดภัย");
  console.log("=======================================================");
  const res4 = await getWeatherWithResilience({
    city: "Bangkok",
    taskId: 3,
    mockFailure: "500",
  });
  console.log("ผลลัพธ์ Scenario 4:");
  console.log(`- Success: ${res4.success}`);
  console.log(`- Is Fallback: ${res4.isFallback}`);
  console.log(`- Attempts Made: ${res4.resilienceMeta.attemptsMade}`);
  console.log(`- Status: ${res4.resilienceMeta.status}`);
  console.log(`- Error Reason: ${res4.resilienceMeta.errorReason}`);

  console.log("\n===============================================================");
  console.log("✅ การทดสอบ RESILIENCE ทั้งหมด 4 สถานการณ์เสร็จสมบูรณ์ 100%!");
  console.log("===============================================================");
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
