/**
 * Resilience Test Suite (Week 11 & Final Integration)
 * ทดสอบ Weather Service: Retry, Timeout, Fallback และ Failure Scenarios
 */

const { getWeatherWithResilience, interpretWeatherCode } = require("../services/weatherService");

describe("2. External Integration & Resilience Tests", () => {
  // เพิ่ม timeout สำหรับ Jest เนื่องจากมีการทดสอบ retry delay
  jest.setTimeout(15000);

  test("interpretWeatherCode - ควรแปลงรหัส WMO 0 เป็นท้องฟ้าแจ่มใส", () => {
    const result = interpretWeatherCode(0);
    expect(result.description).toContain("ท้องฟ้าแจ่มใส");
  });

  test("interpretWeatherCode - ควรให้คำอธิบายทั่วไปเมื่อไม่พบรหัส", () => {
    const result = interpretWeatherCode(9999);
    expect(result.description).toBe("สภาพอากาศทั่วไป (General Weather)");
  });

  test("getWeatherWithResilience - Happy Path (เรียก API จริงสำเร็จ)", async () => {
    const res = await getWeatherWithResilience({
      city: "Bangkok",
      taskId: 1,
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(false);
    expect(res.resilienceMeta.status).toBe("SUCCESS");
    expect(res.resilienceMeta.attemptsMade).toBe(1);
    expect(res.weather.temperature_celsius).not.toBeNull();
  });

  test("getWeatherWithResilience - Network Failure (Retry 2 ครั้ง แล้วเข้าสู่ Fallback)", async () => {
    const res = await getWeatherWithResilience({
      city: "Bangkok",
      mockFailure: "network",
      maxRetries: 2,
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.resilienceMeta.status).toBe("FAILED_AFTER_RETRIES");
    expect(res.resilienceMeta.attemptsMade).toBe(3); // 1 Initial + 2 Retries = 3
    expect(res.weather.status).toBe("UNAVAILABLE");
    expect(res.message).toContain("Fallback");
  });

  test("getWeatherWithResilience - Timeout Failure (เกินเวลา แล้วเข้าสู่ Fallback)", async () => {
    const res = await getWeatherWithResilience({
      city: "Bangkok",
      mockFailure: "timeout",
      timeoutMs: 300, // ตั้ง timeout ให้สั้นเพื่อให้เทสต์เร็วขึ้น
      maxRetries: 1,
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.resilienceMeta.attemptsMade).toBe(2); // 1 Initial + 1 Retry
  });

  test("getWeatherWithResilience - 500 Error Failure (Retry แล้วเข้าสู่ Fallback)", async () => {
    const res = await getWeatherWithResilience({
      city: "Bangkok",
      mockFailure: "500",
      maxRetries: 1,
    });

    expect(res.success).toBe(true);
    expect(res.isFallback).toBe(true);
    expect(res.resilienceMeta.attemptsMade).toBe(2);
  });
});
