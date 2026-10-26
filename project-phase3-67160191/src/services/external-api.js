/**
 * External API Service with Resilience Mechanisms (Retry, Timeout, Fallback)
 * services/external-api.js
 *
 * พัฒนาสำหรับโครงงานระยะที่ 2 และ 3 (CLO8 & CLO6)
 * เชื่อมต่อบริการภายนอก Open-Meteo Weather API พร้อมกลไกความทนทาน:
 * 1. Timeout: ควบคุมด้วย AbortController (Default 3,000ms)
 * 2. Retry Logic: เรียกซ้ำอัตโนมัติ 2 ครั้ง (รวม 3 attempts) พร้อม Exponential Backoff (500ms, 1000ms)
 * 3. Graceful Fallback Strategy: ส่งคืนข้อมูลประมาณการสำรองอย่างปลอดภัย ไม่ทำให้ระบบ Crash หรือค้าง
 */

const weatherService = require("./weatherService");

// Re-export and mirror all resilience capabilities
module.exports = {
  getWeatherWithResilience: weatherService.getWeatherWithResilience,
  interpretWeatherCode: weatherService.interpretWeatherCode,
  createFallbackResponse: weatherService.createFallbackResponse,
  DEFAULT_CONFIG: weatherService.DEFAULT_CONFIG,
};
