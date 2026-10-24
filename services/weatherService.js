/**
 * Weather Service with Resilience Mechanisms (Retry, Timeout, Fallback)
 * เชื่อมต่อกับบริการภายนอก Open-Meteo Weather API
 * รองรับ:
 * 1. Timeout: ยกเลิกคำขอหากเกินเวลาที่กำหนด (ค่าเริ่มต้น 3,000 ms)
 * 2. Retry Logic: เรียกซ้ำอัตโนมัติ 2 ครั้ง (รวม 3 attempts) พร้อม Exponential Backoff
 * 3. Fallback: คืนค่าข้อมูลสำรองอย่างเหมาะสม ไม่ทำให้ระบบค้างหรือ Crash
 */

// รหัสสภาพอากาศตามมาตรฐาน WMO Weather Interpretation Codes
const WMO_CODE_MAP = {
  0: { description: "ท้องฟ้าแจ่มใส (Clear Sky)", advice: "สภาพอากาศดีเยี่ยม เหมาะสำหรับการเดินทางและกิจกรรมกลางแจ้ง" },
  1: { description: "ท้องฟ้าโปร่งเกือบทั้งหมด (Mainly Clear)", advice: "สภาพอากาศปลอดโปร่ง สามารถดำเนินกิจกรรมได้ตามปกติ" },
  2: { description: "มีเมฆเป็นบางส่วน (Partly Cloudy)", advice: "สภาพอากาศแจ่มใส มีเมฆบางตา เหมาะสำหรับทำงานทั่วไป" },
  3: { description: "มีเมฆมาก (Overcast)", advice: "แดดไม่แรง เหมาะสำหรับกิจกรรมนอกสถานที่ แต่อาจมีเมฆสะสม" },
  45: { description: "มีหมอกหนา (Fog)", advice: "ทัศนวิสัยลดลง ควรระมัดระวังเป็นพิเศษในการเดินทาง" },
  48: { description: "มีหมอกน้ำค้างแข็ง (Depositing Rime Fog)", advice: "ทัศนวิสัยจำกัด ควรระมัดระวังการเดินทาง" },
  51: { description: "ฝนตกปรอยๆ เบาบาง (Light Drizzle)", advice: "มีฝนปรอยเล็กน้อย แนะนำให้พกร่มพับติดตัว" },
  53: { description: "ฝนตกปรอยๆ ปานกลาง (Moderate Drizzle)", advice: "มีฝนตกปรอยๆ ควรพกร่มและระวังละอองฝน" },
  55: { description: "ฝนตกปรอยๆ หนาแน่น (Dense Drizzle)", advice: "ฝนปรอยต่อเนื่อง ควรเตรียมอุปกรณ์กันฝน" },
  61: { description: "ฝนตกเล็กน้อย (Slight Rain)", advice: "มีฝนตกระดับเบา ควรพกร่มหรือเสื้อกันฝน" },
  63: { description: "ฝนตกปานกลาง (Moderate Rain)", advice: "ฝนตกต่อเนื่อง ควรเลี่ยงงานกลางแจ้งหรือจัดกิจกรรมในร่ม" },
  65: { description: "ฝนตกหนัก (Heavy Rain)", advice: "ฝนตกหนักมาก ควรงดกิจกรรมกลางแจ้งและตรวจสอบเส้นทางจราจร" },
  80: { description: "ฝนซู่กระจายเล็กน้อย (Slight Showers)", advice: "อาจมีฝนตกลงมากะทันหัน ควรเตรียมร่ม" },
  81: { description: "ฝนซู่กระจายปานกลาง (Moderate Showers)", advice: "ฝนกระหน่ำบางช่วง ควรเตรียมพร้อมรับมือฝน" },
  82: { description: "ฝนซู่กระจายรุนแรง (Violent Showers)", advice: "ฝนกระหน่ำรุนแรง หลีกเลี่ยงการเดินทางหากไม่จำเป็น" },
  95: { description: "พายุฝนฟ้าคะนอง (Thunderstorm)", advice: "มีพายุฟ้าคะนอง ควรงดกิจกรรมกลางแจ้งและอยู่ในที่ปลอดภัย" },
  96: { description: "พายุฝนฟ้าคะนองพร้อมลูกเห็บ (Thunderstorm with Hail)", advice: "อันตรายจากพายุและลูกเห็บ กรุณาอยู่ภายในอาคาร" },
};

/**
 * แปลงสภาพอากาศจาก WMO code
 */
function interpretWeatherCode(code) {
  if (code !== undefined && code !== null && WMO_CODE_MAP[code]) {
    return WMO_CODE_MAP[code];
  }
  return {
    description: "สภาพอากาศทั่วไป (General Weather)",
    advice: "กรุณาตรวจสอบสภาพอากาศประจำวันเพื่อวางแผนการทำงาน",
  };
}

/**
 * ค่าเริ่มต้นสำหรับการทำงานของ Resilience
 */
const DEFAULT_CONFIG = {
  timeoutMs: 3000,       // Timeout: สูงสุด 3 วินาที
  maxRetries: 2,         // Retry: เรียกซ้ำสูงสุด 2 ครั้ง (รวม 3 ครั้ง)
  initialDelayMs: 500,   // Delay: 500ms และเพิ่มแบบ Exponential Backoff
  defaultLat: 13.75,     // กรุงเทพมหานคร (Default Latitude)
  defaultLon: 100.51,    // กรุงเทพมหานคร (Default Longitude)
  defaultCity: "Bangkok",
};

/**
 * สร้าง Fallback Response เมื่อเกิดความล้มเหลว
 */
function createFallbackResponse({ reason, attempts, city = DEFAULT_CONFIG.defaultCity, taskId = null }) {
  return {
    success: true,
    isFallback: true,
    message: "ไม่สามารถเชื่อมต่อบริการสภาพอากาศภายนอกได้ในขณะนี้ ระบบใช้ข้อมูลประมาณการสำรอง (Fallback Strategy)",
    taskId: taskId || undefined,
    location: {
      city: city,
      latitude: DEFAULT_CONFIG.defaultLat,
      longitude: DEFAULT_CONFIG.defaultLon,
    },
    weather: {
      status: "UNAVAILABLE",
      condition: "ข้อมูลสภาพอากาศชั่วคราว (Fallback Data)",
      temperature_celsius: null,
      windspeed_kmh: null,
      weather_code: null,
      recommendation: "ระบบไม่สามารถติดต่อ Weather API ภายนอกได้ แนะนำให้ตรวจสอบสภาพอากาศจากแอปพลิเคชันพยากรณ์อากาศก่อนเริ่มงานกลางแจ้ง",
      is_outdoor_suitable: true, // ค่า default เพื่อให้ระบบทำงานต่อไปได้
    },
    resilienceMeta: {
      provider: "Open-Meteo API",
      status: "FAILED_AFTER_RETRIES",
      attemptsMade: attempts,
      maxRetries: DEFAULT_CONFIG.maxRetries,
      timeoutMs: DEFAULT_CONFIG.timeoutMs,
      errorReason: reason,
      fallbackTimestamp: new Date().toISOString(),
    },
  };
}

/**
 * ฟังก์ชันเรียก Open-Meteo Weather API พร้อมกลไก Retry, Timeout, และ Fallback
 * 
 * @param {Object} options
 * @param {number} [options.latitude] - ละติจูด
 * @param {number} [options.longitude] - ลองจิจูด
 * @param {string} [options.city] - ชื่อเมืองสำหรับแสดงผล
 * @param {number} [options.taskId] - Task ID (ถ้ามี)
 * @param {string} [options.mockFailure] - จำลองข้อผิดพลาด: 'network' | 'timeout' | '500'
 * @param {number} [options.timeoutMs] - กำหนด timeout เอง (มิลลิวินาที)
 * @param {number} [options.maxRetries] - กำหนดจำนวน retry เอง
 */
async function getWeatherWithResilience({
  latitude = DEFAULT_CONFIG.defaultLat,
  longitude = DEFAULT_CONFIG.defaultLon,
  city = DEFAULT_CONFIG.defaultCity,
  taskId = null,
  mockFailure = null,
  timeoutMs = DEFAULT_CONFIG.timeoutMs,
  maxRetries = DEFAULT_CONFIG.maxRetries,
} = {}) {
  const totalAttempts = maxRetries + 1;
  let lastError = null;

  console.log(`\n--- [WeatherService] เริ่มต้นดึงข้อมูลสภาพอากาศ ---`);
  console.log(`พารามิเตอร์: Lat=${latitude}, Lon=${longitude}, City=${city}, MockMode=${mockFailure || "none"}`);
  console.log(`การตั้งค่า Resilience: Timeout=${timeoutMs}ms, Max Retries=${maxRetries} (Total Attempts=${totalAttempts})`);

  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    console.log(`\n[WeatherService] Attempt ${attempt}/${totalAttempts} กำลังส่งคำขอ...`);

    const controller = new AbortController();
    let timeoutHandle = null;

    try {
      // 1. ตั้ง Timeout ด้วย AbortController
      const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          controller.abort();
          reject(new Error(`Request timeout เกินเวลาที่กำหนด (${timeoutMs}ms)`));
        }, timeoutMs);
      });

      // 2. ดำเนินการเรียก API (หรือจำลอง Failure ตามที่กำหนด)
      const fetchPromise = (async () => {
        // จำลอง Failure Scenario 1: Timeout (ทำให้เกิด delay นานกว่า timeoutMs)
        if (mockFailure === "timeout") {
          console.log(`  [SIMULATION] กำลังจำลอง API ตอบสนองช้ามาก (Delay 6,000ms > Timeout ${timeoutMs}ms)...`);
          await new Promise((r) => setTimeout(r, timeoutMs + 3000));
        }

        // จำลอง Failure Scenario 2: Network Error (เรียก URL ที่ไม่มีอยู่จริงหรือ Domain ผิด)
        if (mockFailure === "network") {
          console.log(`  [SIMULATION] กำลังจำลอง Network Error (Domain Unreachable)...`);
          return await fetch("https://invalid-non-existent-weather-domain-67160191.test/fail", {
            signal: controller.signal,
          });
        }

        // จำลอง Failure Scenario 3: 500 Internal Server Error
        if (mockFailure === "500") {
          console.log(`  [SIMULATION] กำลังจำลอง External Server Error (HTTP 500)...`);
          return await fetch("https://httpbin.org/status/500", {
            signal: controller.signal,
          });
        }

        // กรณีปกติ: เรียก Open-Meteo Weather API ของจริง
        const targetUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Asia%2FBangkok`;
        return await fetch(targetUrl, { signal: controller.signal });
      })();

      // แข่งขันระหว่าง timeoutPromise กับ fetchPromise
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutHandle);

      // ตรวจสอบ HTTP Status
      if (!response.ok) {
        throw new Error(`External API ตอบกลับด้วยรหัสข้อผิดพลาด HTTP ${response.status} (${response.statusText})`);
      }

      const json = await response.json();
      const current = json.current_weather || {};
      const interpretation = interpretWeatherCode(current.weathercode);

      console.log(`[WeatherService] Attempt ${attempt} สำเร็จเรียบร้อย! HTTP Status: ${response.status}`);

      return {
        success: true,
        isFallback: false,
        message: "ดึงข้อมูลสภาพอากาศจากผู้ให้บริการภายนอกสำเร็จ",
        taskId: taskId || undefined,
        location: {
          city: city,
          latitude: latitude,
          longitude: longitude,
          timezone: json.timezone || "Asia/Bangkok",
        },
        weather: {
          status: "AVAILABLE",
          condition: interpretation.description,
          weather_code: current.weathercode,
          temperature_celsius: current.temperature,
          windspeed_kmh: current.windspeed,
          wind_direction: current.winddirection,
          is_day: current.is_day === 1,
          recommendation: interpretation.advice,
          is_outdoor_suitable: !(current.weathercode >= 61 && current.weathercode <= 99),
          observation_time: current.time,
        },
        resilienceMeta: {
          provider: "Open-Meteo API",
          status: "SUCCESS",
          attemptsMade: attempt,
          maxRetries: maxRetries,
          timeoutMs: timeoutMs,
          retried: attempt > 1,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      lastError = err;

      const isAbort = err.name === "AbortError" || err.message.includes("timeout");
      const errorMessage = isAbort ? `Timeout เกิน ${timeoutMs}ms` : err.message;

      console.warn(`[WeatherService] Attempt ${attempt} ล้มเหลว! สาเหตุ: ${errorMessage}`);

      // หากยังมีโควตา Retry ให้รอตาม Exponential Backoff แล้ววนลูปต่อ
      if (attempt < totalAttempts) {
        // Exponential Backoff: delay = initialDelay * 2^(attempt - 1)
        const delayMs = DEFAULT_CONFIG.initialDelayMs * Math.pow(2, attempt - 1);
        console.log(`[WeatherService] กลไก Retry ทำงาน: กำลังรอ ${delayMs}ms ก่อนเริ่ม Attempt ${attempt + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // 3. เมื่อ Retry ครบทุกครั้งแล้วยังล้มเหลว -> เรียกใช้ Fallback Strategy
  console.error(`\n[WeatherService] ทุก Attempt ล้มเหลวทั้งหมด (${totalAttempts}/${totalAttempts})`);
  console.log(`[WeatherService] กำลังเรียกใช้ Fallback Strategy เพื่อตอบสนองต่อผู้ใช้อย่างปลอดภัย...`);

  return createFallbackResponse({
    reason: lastError ? lastError.message : "ไม่ทราบสาเหตุ",
    attempts: totalAttempts,
    city: city,
    taskId: taskId,
  });
}

module.exports = {
  getWeatherWithResilience,
  interpretWeatherCode,
  DEFAULT_CONFIG,
};
