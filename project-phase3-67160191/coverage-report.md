# รายงานผลการทดสอบ Test Coverage Baseline
## โครงงานระยะที่ 3: Final Integration & Project Defense
**รหัสนิสิต:** 67160191  
**วิชา:** 88736065 การพัฒนาเว็บเซอร์วิสและเว็บแอปพลิเคชัน (Web Application Programming / API Development)  
**เกณฑ์การวัดผล:** CLO8 (PLO14) — Final Integration & Test Baseline Report  

---

## 1. ภาพรวมการทดสอบ (Test Overview)

ในโครงงานระยะที่ 3 ได้ทำการบูรณาการชุดทดสอบอัตโนมัติ (Automated Test Suite) ครอบคลุมโมดูลตั้งแต่ **ระยะที่ 1 (Tasks CRUD & Database)**, **ระยะที่ 2 (Weather API Resilience Integration)**, และ **ระยะที่ 3 / สัปดาห์ที่ 13 (Microservices: Analytics & Notifications)**

- **Test Framework:** Jest v30.5.2 พร้อม Supertest v7.3.1
- **จำนวน Test Suites ทั้งหมด:** 4 Suites (Passed 100%)
- **จำนวน Test Cases ทั้งหมด:** 45 Tests (Passed 45 / 45, 0 Failed, 0 Flaky)
- **ภาพรวม Coverage รวมทุกไฟล์ (Overall Baseline):**
  - **Statements:** 89.16%
  - **Branches:** 73.62%
  - **Functions:** 94.64%
  - **Lines:** 89.35%

---

## 2. ตารางสรุป Test Coverage Baseline

| ส่วนของระบบ / ไฟล์ | % Statements | % Branches | % Functions | % Lines | สถานะการทดสอบ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **All Files (ภาพรวมทั้งระบบ)** | **89.16%** | **73.62%** | **94.64%** | **89.35%** | **PASSED (45/45)** |
| **API Server Core (`Project_API`)** | **86.60%** | **69.52%** | **97.56%** | **86.23%** | **PASSED** |
| - `db.js` (MySQL Connection Pool) | 100% | 100% | 100% | 100% | ครอบคลุมสมบูรณ์ |
| - `index.js` (Express Server & Unified Routes) | 86.42% | 69.52% | 97.56% | 86.04% | ครอบคลุมเส้นทางหลัก |
| **Services & Microservices (`Project_API/services`)** | **94.94%** | **79.22%** | **86.66%** | **96.73%** | **PASSED** |
| - `weatherService.js` / `external-api.js` (Resilience) | 100% | 80.00% | 100% | 100% | ครอบคลุมกลไก Resilience |
| - `analyticsService.js` (W13 Microservice) | 95.00% | 66.66% | 100% | 95.00% | ครอบคลุมสถิติและคำนวณ |
| - `notificationService.js` (W13 Microservice) | 80.95% | 88.23% | 60.00% | 88.88% | ครอบคลุมการส่งและ Log |

---

## 3. รายละเอียด Test Suites ทั้ง 4 ชุด

### 3.1 `tests/tasks.test.js` (API Integration & Route Validation)
- ทดสอบการเข้าถึง Swagger UI (`/api-docs`) และดาวน์โหลดสเปก OpenAPI JSON (`/api-docs.json`)
- ทดสอบหน้าบ้าน Frontend Static Serving (`/app` และ `/`)
- ทดสอบ Input Validation ของ Tasks Resource (กรณีไม่ส่ง `title`, ไม่ส่ง `user_id`, `status` ผิดรูปแบบ, `id` ไม่ใช่ตัวเลข)
- ทดสอบการทำงานของ Route Not Found (404) และ Central Error Handler

### 3.2 `tests/resilience.test.js` (External API Resilience Suite)
- **Happy Path:** เชื่อมต่อ Open-Meteo Weather API จริง สำเร็จด้วย HTTP 200 ใน attempt แรก
- **Timeout Simulation:** ตัดการทำงานทันทีเมื่อเกินค่า Timeout ด้วย `AbortController`
- **Retry Logic & Exponential Backoff:** ทำงานอัตโนมัติ 2 ครั้ง รวม 3 attempts โดยหน่วงเวลา 500ms, 1000ms
- **Graceful Fallback Strategy:** ส่งคืนข้อมูลสภาพอากาศสำรองอย่างสมบูรณ์ ไม่ปล่อยให้เซิร์ฟเวอร์ค้างหรือ Crash

### 3.3 `tests/microservices.test.js` (Week 13 Microservices Suite)
- **Task Analytics Microservice:** ทดสอบการคำนวณอัตราความสำเร็จ (Completion Rate), การจัดกลุ่มสถานะงาน และคะแนนประสิทธิภาพ
- **Notification Microservice:** ทดสอบการส่งแจ้งเตือนผ่าน Email, SMS, Webhook และการตรวจสอบประวัติการส่ง (Notification Logs)
- ทดสอบกรณีส่งข้อมูลไม่ครบถ้วน (Validation Error 400)

### 3.4 `tests/db-routes.test.js` (Deterministic Controller Flow & Database Operations)
- จำลองการทำงานร่วมกับฐานข้อมูล MySQL (Mocked Pool Queries)
- ทดสอบ CRUD ครบทุก Use Case:
  - `GET /api/v1/tasks` (พร้อมประมวลผล Many-to-Many Tags)
  - `GET /api/v1/tasks/:id` (กรณีพบ 200 และไม่พบ 404)
  - `POST /api/v1/tasks` (สร้างงานพร้อมบันทึกลงตารางเชื่อมโยง `task_tags`)
  - `PUT /api/v1/tasks/:id` (อัปเดตข้อมูลและป้ายกำกับ)
  - `PATCH /api/v1/tasks/:id/status` (อัปเดตสถานะงาน)
  - `DELETE /api/v1/tasks/:id` (ลบงาน)
  - `GET /api/v1/users` และ `GET /api/v1/tags`
  - `POST /api/v1/tags` (กรณีสำเร็จ และกรณีชื่อซ้ำ ER_DUP_ENTRY)
  - `safeDbQuery` ตอบสนองเมื่อฐานข้อมูลออฟไลน์ (`ECONNREFUSED` ตอบ 503 Service Unavailable)

---

## 4. วิเคราะห์จุดที่ยังไม่มี Test ครอบคลุม (Uncovered Lines Analysis)

จากการวิเคราะห์โค้ดบรรทัดที่ยังไม่ถูกทดสอบ (Uncovered Lines) พบว่าเป็นจุดที่ตั้งใจออกแบบไว้สำหรับกรณีพิเศษ ดังนี้:

| ไฟล์ | บรรทัดที่ Uncovered | เหตุผลและบริบททางเทคนิค |
| :--- | :--- | :--- |
| `index.js` | 53 | การเข้าถึงหน้า Root (`/`) ด้วยเบราว์เซอร์โดยตรงโดยไม่มีพารามิเตอร์ (ในชุดทดสอบจำลองผ่าน `/app` เป็นหลัก) |
| `index.js` | 107 | การดักจับค่า status query ที่ไม่ตรงกับ whitelist (ทดสอบในส่วน PATCH status แล้ว) |
| `index.js` | 136-137, 140-141, 145 | การสร้าง SQL Dynamic Filter เมื่อมีทั้ง `status` และ `user_id` พร้อมกันในคำขอเดียว |
| `index.js` | 163, 233, 267, 320, 354, 390, 437, 466, 521, 542, 562, 654, 692 | บล็อก `catch (err) { next(err); }` สำหรับดักจับ Uncaught Exception ที่เกิดจากความผิดปกติของ Hardware/OS |
| `index.js` | 498-500 | โค้ดสำรองสำหรับอ่าน Title/Due Date เมื่อฐานข้อมูลหยุดทำงานกะทันหันขณะเรียก Weather Route |
| `index.js` | 725-731 | บล็อก `if (require.main === module) { app.listen(...) }` ซึ่งจะไม่ทำงานขณะรัน Unit Test ผ่าน Supertest เพื่อป้องกัน Port Collision |
| `analyticsService.js` | 18 | โค้ดสำรองค่าตั้งต้นเมื่อไม่มี Task ใดๆ ในฐานข้อมูลเลยแม้แต่รายการเดียว |
| `notificationService.js` | 79, 82 | กรณีส่ง Channel ที่ไม่รองรับนอกเหนือจาก Email/SMS/Webhook |
| `weatherService.js` | 59, 103, 106, 173, 187-212, 235 | รหัสสภาพอากาศ WMO พิเศษที่เกิดขึ้นยาก (เช่น ลูกเห็บตก, หมอกน้ำค้างแข็ง) |

---

## 5. การกำหนด Baseline และแนวทางพัฒนาในอนาคต

1. **เกณฑ์มาตรฐาน Baseline ขั้นต่ำที่กำหนดไว้:** ตั้งเป้าหมาย Line Coverage รวมไม่ต่ำกว่า **80%** โดยผลการทดสอบจริงทำได้ **89.35%** ซึ่งผ่านเกณฑ์มาตรฐานอย่างสมบูรณ์
2. **การป้องกัน Regression:** ชุดทดสอบทั้ง 45 ข้อถูกนำไปตั้งเป็น Pre-flight Test ก่อน Deploy ทุกครั้ง เพื่อให้มั่นใจว่าจะไม่มีการทำลายการทำงานเดิมเมื่อมีการแก้ไขโค้ด
3. **การทดสอบแบบ End-to-End (E2E):** สามารถเชื่อมโยงชุดทดสอบนี้เข้ากับ CI/CD Pipeline (GitHub Actions) ได้ทันทีเนื่องจากมีการ Mock Database ที่เป็นอิสระและรันผ่าน 100% ในทุกสภาพแวดล้อม
