# คู่มือเตรียมสอบ Project Defense ฉบับสมบูรณ์ (ครบจบในไฟล์เดียว)
## ระบบจัดการงานครบวงจร (TaskFlow Pro — Task Management System)

- **รหัสนิสิต:** 67160191  
- **หลักสูตร/วิชา:** 88736065 การพัฒนาเว็บเซอร์วิสและเว็บแอปพลิเคชัน (Web Application Programming / API Development)  
- **เกณฑ์การวัดผล:** สัปดาห์ที่ 15 — Project Defense (CLO7: PLO13) คะแนนเต็ม 5 คะแนน  
- **การให้คะแนน (Scoring Rubrics):**
  - **Demo ทำงานได้จริงสด ไม่ใช้สไลด์อธิบายแทนการสาธิตจริง:** 2 คะแนน
  - **อธิบายการออกแบบสถาปัตยกรรมและเหตุผลการตัดสินใจทางเทคนิคได้ชัดเจน:** 2 คะแนน
  - **ตอบคำถามได้ตรงประเด็น สะท้อนว่าเข้าใจระบบที่ตนเองพัฒนาจริง:** 1 คะแนน
  - **รวม:** 5 คะแนนเต็ม

---

## สารบัญเนื้อหา
1. [กำหนดการนำเสนอและการบริหารเวลา (Timing Schedule: 6–8 นาที)](#1-กำหนดการนำเสนอและการบริหารเวลา-timing-schedule-68-นาที)
2. [ข้อควรระวังและวิธีป้องกันปัญหาในการ Demo สด (Pre-Demo Caution & Disaster Recovery)](#2-ข้อควรระวังและวิธีป้องกันปัญหาในการ-demo-สด-pre-demo-caution--disaster-recovery)
3. [สคริปต์การนำเสนอสดทีละวินาที (Live Demo Script: 0:00 – 4:00)](#3-สคริปต์การนำเสนอสดทีละวินาที-live-demo-script-000--400)
4. [3 คำถามเชิงเทคนิคหลักที่ผู้สอนมักถาม (Core Defense Technical Questions)](#4-3-คำถามเชิงเทคนิคหลักที่ผู้สอนมักถาม-core-defense-technical-questions)
   - [ข้อที่ 1: เพราะเหตุใดจึงเลือกแบ่งบริการ (Microservices) ในจุดที่แบ่งไว้ ไม่แบ่งที่จุดอื่น?](#ข้อที่-1-เพราะเหตุใดจึงเลือกแบ่งบริการ-microservices-ในจุดที่แบ่งไว้-ไม่แบ่งที่จุดอื่น)
   - [ข้อที่ 2: หากข้อมูลเพิ่มขึ้น 10 เท่า ส่วนใดของระบบจะมีปัญหาก่อน และจะแก้ไขอย่างไร?](#ข้อที่-2-หากข้อมูลเพิ่มขึ้น-10-เท่า-ส่วนใดของระบบจะมีปัญหาก่อน-และจะแก้ไขอย่างไร)
   - [ข้อที่ 3: เหตุใด endpoint หนึ่งจึงยังไม่มี test ครอบคลุม และความเสี่ยงของการไม่มี test ในจุดนั้นคืออะไร?](#ข้อที่-3-เหตุใด-endpoint-หนึ่งจึงยังไม่มี-test-ครอบคลุม-และความเสี่ยงของการไม่มี-test-ในจุดนั้นคืออะไร)
5. [คลังคำถาม-คำตอบเจาะลึกด้านสถาปัตยกรรมและเทคนิค (Deep-Dive Q&A 8 ข้อเพิ่มเติม)](#5-คลังคำถาม-คำตอบเจาะลึกด้านสถาปัตยกรรมและเทคนิค-deep-dive-qa-8-ข้อเพิ่มเติม)
   - [ข้อที่ 4: กลไก Exponential Backoff เทียบกับ Immediate Retry](#ข้อที่-4-ทำไมต้องใช้-exponential-backoff-ในการ-retry-แทนที่จะยิงซ้ำทันที)
   - [ข้อที่ 5: การออกแบบ Fallback Strategy (ทำไมตอบ HTTP 200 แทน HTTP 500)](#ข้อที่-5-เมื่อ-api-ภายนอกล่ม-ทำไม-fallback-ถึงตอบ-http-200-แทน-http-500)
   - [ข้อที่ 6: การทำงานของ AbortController เทียบกับ setTimeout ทั่วไป](#ข้อที่-6-อธิบายการทำงานของ-abortcontroller-ว่าดีกว่า-settimeout-ธรรมดาอย่างไร)
   - [ข้อที่ 7: ความจำเป็นของ Client-side Validation ควบคู่กับ Backend Validation](#ข้อที่-7-ทำไมต้องมีทั้ง-client-side-และ-backend-validation-ซ้ำซ้อนหรือไม่)
   - [ข้อที่ 8: การออกแบบ Junction Table (task_tags) และประโยชน์ของ ON DELETE CASCADE](#ข้อที่-8-ทำไมตาราง-task_tags-ถึงต้องตั้งค่า-on-delete-cascade)
   - [ข้อที่ 9: การซิงค์เอกสาร Swagger UI และ OpenAPI 3.0.3 กับ Express Code](#ข้อที่-9-swagger-ui-ซิงค์กับโค้ดจริงใน-express-ได้อย่างไร)
   - [ข้อที่ 10: การจัดการ Database Migration Scripts และ Docker MySQL](#ข้อที่-10-การใช้-docker-mysql-และ-migration-script-ช่วยแก้ปัญหาอะไรในการพัฒนา)
   - [ข้อที่ 11: การรองรับโครงสร้างโฟลเดอร์ส่งมอบ Dual-Mode (รันได้ทั้ง Root และ `src/`)](#ข้อที่-11-โครงสร้างโฟลเดอร์-src-และ-root-เข้ากันได้อย่างไร)
6. [สรุปผลการทดสอบ Test Coverage Baseline ล่าสุด (45 Tests, 89.34% Lines)](#6-สรุปผลการทดสอบ-test-coverage-baseline-ล่าสุด-45-tests-8934-lines)
7. [Checklist เตรียมความพร้อม 60 วินาทีก่อนขึ้นสอบจริง](#7-checklist-เตรียมความพร้อม-60-วินาทีก่อนขึ้นสอบจริง)

---

## 1. กำหนดการนำเสนอและการบริหารเวลา (Timing Schedule: 6–8 นาที)

ตามเกณฑ์การประเมินสัปดาห์ที่ 15 กำหนดเวลาการนำเสนอไว้ที่ 5–7 นาที โดยแบ่งสัดส่วนการนำเสนออย่างเคร่งครัด:

```mermaid
gantt
    title กำหนดการนำเสนอ Project Defense (รวม 6–7 นาที)
    dateFormat  m:s
    axisFormat %M:%S
    section 1. ภาพรวม
    แนะนำโจทย์ ปัญหา และสถาปัตยกรรม (1 นาที) :active, 00:00, 01:00
    section 2. Live Demo
    Demo สด Use Case หลัก + Validation + Weather (3-4 นาที) :crit, 01:00, 04:30
    section 3. ตอบคำถาม
    ตอบคำถามเชิงเทคนิคจากผู้สอน (2-3 นาที) :done, 04:30, 07:00
```

| ช่วงเวลา | หัวข้อเนื้อหา | เป้าหมายและเกณฑ์คะแนน |
| :---: | :---|:---|
| **1 นาที**<br>(0:00–1:00) | **แนะนำภาพรวมโครงงาน โจทย์ที่แก้ไข และสถาปัตยกรรมโดยสรุป** | ปูพื้นฐานให้ผู้สอนเห็นว่าระบบแก้ปัญหาอะไร และใช้สถาปัตยกรรมใด (Express, MySQL, Resilience, Microservices) |
| **3–4 นาที**<br>(1:00–4:30) | **Demo ระบบสด อย่างน้อย 1 use case หลักตั้งแต่ต้นจนจบ** | **สาธิตสด 100% ห้ามเปิดสไลด์**: สร้างงาน, กรองสถานะ, ดึงสภาพอากาศ Resilience, ดูสถิติ และโชว์ Swagger UI |
| **2–3 นาที**<br>(4:30–7:00) | **ตอบคำถามจากผู้สอนเกี่ยวกับการออกแบบและปัญหาที่พบ** | ตอบตรงประเด็น 3 คำถามหลัก (การแบ่งบริการ, สเกล 10 เท่า, Test Coverage) สะท้อนความเข้าใจทางวิศวกรรม |

---

## 2. ข้อควรระวังและวิธีป้องกันปัญหาในการ Demo สด (Pre-Demo Caution & Disaster Recovery)

> [!WARNING]
> **กฎเหล็กวันสอบ:** ควรทดสอบซ้ำก่อนวันนำเสนอจริงอย่างน้อยหนึ่งรอบเต็มด้วยสภาพแวดล้อมเดียวกับที่จะใช้จริง (เครื่องเดียวกัน เครือข่ายเดียวกัน) เพื่อป้องกันข้อผิดพลาดที่เกิดขึ้นบ่อยที่สุด 3 ประการ:

### ⚠️ ข้อควรระวังที่ 1: ฐานข้อมูลบนเครื่องที่ใช้ demo มีข้อมูลไม่ตรงกับที่เตรียมไว้
- **ปัญหาที่พบบ่อย:** ซ้อมลบงาน ซ้อมแก้ไขสถานะ จนตารางงานว่างเปล่า หรือมีขยะค้าง ทำให้พอเริ่ม demo ตัวเลขสถิติไม่ตรง หรือหา ID ไม่เจอ
- **แนวทางป้องกันและคำสั่ง Reset ทันที:**
  ระบบมีสคริปต์ Migration และ Seed เตรียมไว้แล้ว สามารถ Reset ฐานข้อมูลกลับสู่สถานะตั้งต้นได้ภายใน 2 วินาที:
  ```bash
  # วิธีที่ 1: รันผ่านสคริปต์ Migrate
  npm run migrate

  # วิธีที่ 2: รันผ่านคำสั่ง MySQL Direct
  mysql -u root -p task_db < schema.sql
  mysql -u root -p task_db < seed.sql
  ```
- **ข้อมูลตั้งต้นที่แน่นอน:** มี Users 3 คน (`somchai`, `somsri`, `somkid`), มี Tags 3 ตัว (`Work`, `Personal`, `Urgent`), มี Tasks 4 รายการ

---

### ⚠️ ข้อควรระวังที่ 2: Environment Variables ไม่ตรงกับเครื่องที่ Demo จริง
- **ปัญหาที่พบบ่อย:** ค่าในไฟล์ `.env` บนเครื่องซ้อมกับเครื่องที่ยกไปต่อโปรเจกเตอร์ไม่เหมือนกัน เช่น พอร์ตชน, รหัสผ่าน MySQL ผิด, หรือเครื่องลืมเปิด MySQL Server
- **แนวทางป้องกัน:**
  - ตรวจสอบไฟล์ `.env` ก่อนขึ้นสอบ:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=task_db
    ```
  - **Graceful DB Trap:** ระบบของเรามีฟังก์ชัน `safeDbQuery()` ใน `index.js` ดักจับกรณี `ECONNREFUSED` โดยตอบ 503 Service Unavailable และหน้าบ้าน Frontend จะแสดงกล่องแจ้งเตือนสีส้มพร้อมปุ่ม "ลองใหม่อีกครั้ง (Retry)" ทันทีโดยไม่เกิด Unhandled Promise Rejection Crash

---

### ⚠️ ข้อควรระวังที่ 3: Rate Limiter หรือเน็ตห้องสอบบล็อกคำขอ Weather API
- **ปัญหาที่พบบ่อย:** ซ้อมกดตรวจสภาพอากาศหลายรอบเกินไป จน IP มหาวิทยาลัยถูก Open-Meteo Rate Limit ชั่วคราว หรือ Wi-Fi ห้องสอบหลุดขณะกำลัง Demo
- **แนวทางแก้ไขและข้อได้เปรียบของระบบ (Resilience Built-in):**
  - **ระบบไม่ล่ม:** กลไก Fault Tolerance จะทำการ Retry 2 ครั้งพร้อม Exponential Backoff เมื่อครบโควตาแล้วจะเข้าสู่ **Graceful Fallback Strategy** ทันที โดยหน้าเว็บยังคงตอบ HTTP 200 พร้อมแสดงป้าย `[ข้อมูลสำรอง Fallback]`
  - **สามารถพลิกวิกฤตเป็นโอกาส:** บอกอาจารย์ทันทีว่า:  
    *"นี่คือการสาธิตสดของระบบ Fault Tolerance ครับ แม้เน็ตห้องสอบจะมีปัญหาหรือโดน Rate Limit แต่ระบบของเราออกแบบ Graceful Fallback ไว้ ทำให้หน้าจอผู้ใช้ไม่ค้างและไม่พ่น Error 500 ขัดจังหวะการทำงาน"*
  - หากต้องการจำลองความล้มเหลวแบบจงใจ สามารถส่ง query `?mockFailure=network`, `?mockFailure=timeout` หรือ `?mockFailure=500` ได้ทันที

---

## 3. สคริปต์การนำเสนอสดทีละวินาที (Live Demo Script: 0:00 – 4:00)

> 💡 **การจัดเตรียมหน้าต่างล่วงหน้า:** เปิด Chrome 2 แท็บ:
> - แท็บ 1: [http://localhost:3000/app](http://localhost:3000/app) (หน้าเว็บหลัก TaskFlow Pro)
> - แท็บ 2: [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (Swagger UI)
> - หน้าต่าง Terminal (VS Code / PowerShell): ย่อไว้ด้านล่างพร้อมพิมพ์คำสั่ง `npm test`

---

### ⏱️ [0:00 – 1:00] แนะนำตัว โจทย์ที่แก้ไข และสถาปัตยกรรม (1 นาที)
* **หน้าจอ:** หน้าเว็บ [http://localhost:3000/app](http://localhost:3000/app)
* **คำพูดนำเสนอ:**  
  *"กราบเรียนอาจารย์ผู้สอนครับ ผมรหัสนิสิต 67160191 ขออนุญาตนำเสนอโครงงาน **TaskFlow Pro — ระบบจัดการงานครบวงจร** ครับ*  
  * **โจทย์และปัญหาที่แก้ไข:** ในการทำงานจริง ปัญหาที่พบบ่อยคือการลืมกำหนดส่งงาน ขาดการติดตามสถานะความคืบหน้า และขาดข้อมูลสภาพอากาศสำหรับวางแผนงานกลางแจ้ง ระบบนี้จึงถูกพัฒนาขึ้นเพื่อเป็นศูนย์กลางบริหารจัดการงานที่เชื่อมโยงฐานข้อมูลภายนอกและบริการวิเคราะห์สถิติเข้าด้วยกัน*  
  * **สถาปัตยกรรมระบบ:** พัฒนาด้วย Node.js/Express ทำหน้าที่เป็น Application Gateway เชื่อมต่อฐานข้อมูล MySQL เชิงสัมพันธ์ (ตาราง `users`, `tasks`, `tags`, และตารางเชื่อม `task_tags`) เสริมด้วย 3 บริการอิสระ ได้แก่ Weather Resilience Integration, Task Analytics Microservice, และ Notification Dispatcher Microservice พร้อมหน้าบ้าน Client Frontend สไตล์ Minimalist SaaS ที่กำลังแสดงผลอยู่ตรงหน้านี้ครับ"*

---

### ⏱️ [1:00 – 2:15] Demo Use Case หลัก: Validation, บันทึกงาน & อัปเดตสถานะ (CLO6)
* **การกระทำและคำพูดสาธิต:**
  1. **สาธิต Client-side Validation:**  
     - กดปุ่ม **"+ สร้างงานใหม่"**  
     - กดปุ่ม "บันทึกข้อมูล" ทันทีโดยไม่กรอกอะไร  
     - *คำพูด:* *"ตามข้อกำหนด CLO6 ระบบมีการทำ Client-side Validation แบบเรียลไทม์ จะเห็นแถบแจ้งเตือนสีแดงทันทีว่าต้องระบุชื่องานอย่างน้อย 3 ตัวอักษร และเลือกผู้รับผิดชอบ โดยยังไม่ยิงคำขอข้าม Network ไปกวน Backend ครับ"*
  2. **สร้างงานจริง (POST /api/v1/tasks):**  
     - กรอกชื่อ: `ตรวจไซต์งานก่อสร้างประจำสัปดาห์`  
     - รายละเอียด: `ตรวจสอบความคืบหน้าโครงสร้างชั้น 3`  
     - วันครบกำหนด: เลือกวันพรุ่งนี้  
     - ผู้รับผิดชอบ: `somchai`  
     - ป้ายกำกับ: ติ๊กเลือก `Work` และ `Urgent`  
     - กดปุ่ม "บันทึกข้อมูล"  
     - *คำพูด:* *"เมื่อกดบันทึก ระบบจะยิงคำขอ `POST /api/v1/tasks` พร้อมเชื่อม Many-to-Many Tags ลงตาราง `task_tags` จะมี Toast สีเขียวเด้งขึ้นมา และการ์ดงานใหม่จะปรากฏขึ้นทันที พร้อมตัวเลข Stat Cards ด้านบนอัปเดตอัตโนมัติครับ"*
  3. **เปลี่ยนสถานะงาน (PATCH /api/v1/tasks/:id/status):**  
     - ไปที่การ์ดงานที่เพิ่งสร้าง เปลี่ยน Dropdown จาก `pending` เป็น `completed`  
     - *คำพูด:* *"ผู้ใช้สามารถ Quick Update สถานะงานผ่าน `PATCH` ได้ทันที การ์ดจะเปลี่ยนเป็นสีเขียว และเปอร์เซ็นต์ความสำเร็จของระบบจะคำนวณใหม่แบบ Real-time ครับ"*

---

### ⏱️ [2:15 – 3:15] Demo กลไกความทนทาน Weather Resilience (CLO8)
* **การกระทำและคำพูดสาธิต:**
  1. บนการ์ดงาน กดปุ่ม **"🌤️ ตรวจสภาพอากาศ"**  
  2. Modal จะแสดงสภาพอากาศจริงของกรุงเทพฯ (อุณหภูมิ, สภาพท้องฟ้า, คำแนะนำกิจกรรมกลางแจ้ง พร้อม Resilience Metadata)  
  3. *คำพูด:* *"นี่คือส่วนของ Resilience ตาม CLO8 ระบบเชื่อมต่อ Open-Meteo Weather API ภายนอก โดยมีกลไกป้องกันความล้มเหลว 3 ระดับ:  
     - 1) **Timeout 3,000ms** ด้วย AbortController  
     - 2) **Retry อัตโนมัติ 2 ครั้ง** ด้วย Exponential Backoff (หน่วงเวลา 500ms, 1,000ms)  
     - 3) **Graceful Fallback Strategy** หาก API ภายนอกล่ม ระบบจะคืนค่าข้อมูลสำรองพร้อม HTTP 200 ทำให้หน้าจอผู้ใช้ไม่ค้างหรือเกิด Error 500 ครับ"*

---

### ⏱️ [3:15 – 4:00] Demo Swagger UI, Microservices & Automated Tests
* **การกระทำและคำพูดสาธิต:**
  1. สลับไปที่แท็บ Swagger UI [http://localhost:3000/api-docs](http://localhost:3000/api-docs)  
     - *คำพูด:* *"เอกสาร API ตรงกับโค้ดจริง 100% ครอบคลุมทั้ง Tasks CRUD, Users, Tags, Weather Resilience และโมดูล Microservices จากสัปดาห์ที่ 13 ได้แก่ Task Analytics และ Notification Logs ครับ"*
  2. สลับไปที่ Terminal แล้วรันคำสั่ง:  
     ```bash
     npm test
     ```  
     - *คำพูด:* *"เมื่อรันชุดทดสอบอัตโนมัติ ระบบผ่านการทดสอบครบทั้ง 4 Test Suites, 45 Tests ผ่าน 100% โดยมี Line Coverage รวมสูงถึง 89.34% และ Service Layer สูงถึง 95–100% สะท้อนถึงคุณภาพความพร้อมใช้งานระดับ Production ครับ"*

---

## 4. 3 คำถามเชิงเทคนิคหลักที่ผู้สอนมักถาม (Core Defense Technical Questions)

---

### ❓ ข้อที่ 1: เพราะเหตุใดจึงเลือกแบ่งบริการ (Microservices) ในจุดที่แบ่งไว้ ไม่แบ่งที่จุดอื่น?

#### 🎯 สรุปคำตอบสำหรับพูดเปิดประเด็น (Elevator Pitch):
> "เราเลือกแยกเป็น 3 โมดูลบริการอิสระ ได้แก่ **Weather Service**, **Analytics Service**, และ **Notification Service** โดยใช้หลักการทางวิศวกรรมซอฟต์แวร์ 3 ประการ คือ: **Failure Domain Isolation (การจำกัดขอบเขตความเสียหาย)**, **Workload & Scaling Profile ที่ต่างกันอย่างสิ้นเชิง**, และ **Single Responsibility** ครับ  
> และเหตุผลที่เรา **ไม่แบ่ง** แยกตาราง Users, Tasks, และ Tags ออกเป็นฐานข้อมูลคนละก้อน เพราะต้องการรักษา **ACID Transactions** และความสมบูรณ์ของความสัมพันธ์แบบ Relational (`ON DELETE CASCADE`) ครับ"

#### 🔍 การวิเคราะห์เหตุผลเชิงลึกรายบริการ (Deep Analysis):
1. **Weather Service (`services/weatherService.js` / `external-api.js`):**
   - **ลักษณะงาน:** ติดต่อกับ Third-party API ภายนอกผ่านอินเทอร์เน็ตสาธารณะ มีความเสี่ยงสูงจาก Network Latency, DNS Error, หรือ Rate Limit
   - **เหตุผลที่ต้องแยก:** หากรวมไว้ใน Task Controller หลัก เมื่อระบบพยากรณ์อากาศล่ม Node.js จะต้องถือ Connection ค้างไว้จน Socket เต็ม ทำให้ระบบจัดการงานหลักล่มไปด้วย การแยกบริการออกมาพร้อมกลไก Resilience (Timeout 3s + Retry 2 ครั้ง + Fallback) ทำให้มั่นใจว่า **แม้บริการภายนอกจะล่ม 100% แต่ผู้ใช้จะยังคงดูและจัดการงานได้ตามปกติ**
2. **Analytics Service (`services/analyticsService.js`):**
   - **ลักษณะงาน:** เป็นงานประเภท **Compute-Intensive / Read-Heavy (OLAP)** ซึ่งต้องคำนวณ Aggregate ข้อมูลหลายระเบียน นับจำนวนงาน เปอร์เซ็นต์ความสำเร็จ และตรวจหางานเกินกำหนด
   - **เหตุผลที่ต้องแยก:** งาน CRUD ทั่วไปเป็น OLTP ที่ต้องการความเร็วระดับเสี้ยววินาที การแยกคำนวณสถิติออกเป็นโมดูลเดี่ยว ทำให้สามารถใส่ In-Memory Cache (Redis) คั่นกลาง หรือในอนาคตสามารถยกไปรันเป็น Background Worker แยกเครื่องได้ทันที
3. **Notification Service (`services/notificationService.js`):**
   - **ลักษณะงาน:** เป็นงานประเภท **I/O Bound และ Asynchronous Dispatching** (ส่ง Email, SMS, Webhook) ซึ่งการ Handshake กับ Mail Server อาจใช้เวลา 1–3 วินาที
   - **เหตุผลที่ต้องแยก:** การส่งแจ้งเตือนไม่ควรบล็อก Response ของผู้ใช้ การแยกบริการออกมาพร้อมจัดเก็บ Dispatch Audit Logs จะช่วยรองรับการเปลี่ยนผ่านไปสู่ **Event-Driven Architecture (Message Queue เช่น RabbitMQ / Kafka)** ได้อย่างราบรื่น
4. **ทำไมจึงไม่แบ่งบริการในจุด `users`, `tasks`, `tags`?**
   - ตาราง `tasks` อ้างอิง `users(id)` และมีความสัมพันธ์ Many-to-Many กับ `tags` ผ่านตารางเชื่อม `task_tags`
   - หากตัดแบ่งเป็นคนละ Service ตั้งแต่แรก จะต้องแลกมาด้วยความซับซ้อนมหาศาล เช่น ต้องใช้ Distributed Transactions (Two-Phase Commit หรือ Saga Pattern) ซึ่งเกินความจำเป็น การรวมเป็น Core Relational Database ทำให้เราได้ประโยชน์จาก ACID, Foreign Key Constraints, และ `ON DELETE CASCADE` อย่างสมบูรณ์

---

### ❓ ข้อที่ 2: หากข้อมูลเพิ่มขึ้น 10 เท่า ส่วนใดของระบบจะมีปัญหาก่อน และจะแก้ไขอย่างไร?

#### 🎯 สรุปคำตอบสำหรับพูดเปิดประเด็น (Elevator Pitch):
> "หากปริมาณงานในระบบเพิ่มขึ้น 10 เท่า (เช่น จากหลักพันรายการเป็นหลักแสนหรือหลักล้านรายการ) ส่วนที่จะเกิดปัญหาคอขวด (Bottleneck) เป็นจุดแรกคือ **ฐานข้อมูล MySQL ในตาราง `tasks` และตารางเชื่อม `task_tags`** ครับ  
> ปัญหาจะเกิดขึ้น 2 ด้าน:  
> 1) **การค้นหาและคำนวณสถิติจะเกิด Full Table Scan** ส่งผลให้ CPU และ Disk I/O ของ MySQL พุ่งแตะ 100%  
> 2) **Database Connection Pool Exhaustion** เพราะคำสั่ง Query ค้างนานขึ้น ทำให้ Connection เต็มจนคำขอใหม่เกิด Timeout ครับ"

#### 🔍 การวิเคราะห์จุดคอขวดเชิงลึก (Bottleneck Breakdown):
1. **ปัญหาการ Query และ Full Table Scan:**
   - การดึงรายการงาน `GET /api/v1/tasks?status=in_progress&user_id=1` หากไม่มีดัชนี (Index) ที่เหมาะสม MySQL ต้องสแกนข้อมูลทีละแถวตั้งแต่แถวแรกจนถึงแถวสุดท้าย ($O(N)$)
   - คำสั่ง `LEFT JOIN` 3 ตารางใน `safeDbQuery()` พร้อม `GROUP BY t.id` และ `GROUP_CONCAT(tg.name)` จะต้องสร้าง Temporary Table on Disk ขนาดใหญ่ ทำให้เวลาตอบสนองช้าลงจาก 10ms เป็นหลายพันมิลลิวินาที
2. **ขีดจำกัด Connection Pool:**
   - ใน `db.js` มีการตั้งค่า `connectionLimit: 10` เมื่อแต่ละ Query ใช้เวลานานขึ้น โควตา 10 Connection จะถูกยึดครองจนหมด คำขอใหม่ที่เข้ามาจะต่อคิวสะสมจนเกิด `ECONNRESET` หรือ `ETIMEDOUT`

#### 🛠️ แผนการแก้ไขทางวิศวกรรม (Scalability Roadmap):
1. **การปรับปรุงทันที (Quick Win — Database Indexing):**
   - สร้าง **Composite Index (ดัชนีผสม)** บนตาราง `tasks`:
     ```sql
     CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
     CREATE INDEX idx_tasks_due_date ON tasks(due_date);
     ```
   - ผลลัพธ์: ความเร็วในการค้นหาจะเปลี่ยนจาก Full Table Scan ($O(N)$) มาเป็น **B-Tree Index Seek ($O(\log N)$)** ทันที
2. **การทำ Caching Layer ด้วย Redis:**
   - นำ Redis มาคั่นหน้าฐานข้อมูลสำหรับ Endpoint ที่ถูกอ่านซ้ำบ่อย เช่น `GET /api/v1/analytics/summary` และ Task List หน้าแรก
   - ตั้งค่า TTL (Time-To-Live) 60 วินาที พร้อมกลไก Cache Invalidation เมื่อมีคำขอ `POST/PUT/DELETE`
   - ผลลัพธ์: คำขออ่าน 80–90% จะถูกตอบกลับจาก RAM ภายในเวลาไม่ถึง 2ms
3. **การแยกเครื่องอ่าน-เขียน (Database Read Replicas & Connection Splitting):**
   - จัดสถาปัตยกรรมแบบ **Master-Slave (Primary-Replica)**: ให้ Node หลักรับเฉพาะคำสั่งเขียน (`INSERT`, `UPDATE`, `DELETE`) และให้ Read Replicas (2–3 โหนด) รับคำขออ่านข้อมูลและงานคำนวณสถิติของ Analytics
4. **การนำ Asynchronous Queue มาใช้กับ Notifications:**
   - ใช้ Message Broker (เช่น BullMQ / Redis Queue) เพื่อให้ Express ตอบกลับผู้ใช้ทันที แล้วปล่อยให้ Background Worker ค่อยๆ ดึงแจ้งเตือนไปส่งตามรอบ

---

### ❓ ข้อที่ 3: เหตุใด endpoint หนึ่งจึงยังไม่มี test ครอบคลุม และความเสี่ยงของการไม่มี test ในจุดนั้นคืออะไร?

#### 🎯 สรุปคำตอบสำหรับพูดเปิดประเด็น (Elevator Pitch):
> "ในระบบปัจจุบัน เรามีชุดทดสอบอัตโนมัติทั้งหมด **4 Test Suites รวม 45 Tests ผ่าน 100%** โดยมี Line Coverage รวมทั้งระบบสูงถึง **89.34%** และในส่วน Service Layer มี Coverage สูงถึง **88.88% ถึง 100%** ครับ  
> จุดที่ยัง Uncovered มีเพียงประมาณ 10% ของโค้ด ซึ่งส่วนใหญ่คือ **บล็อก Catch ดักจับ Fatal OS Error ที่เกิดขึ้นยากมาก**, **บล็อก `app.listen()`**, และ **รหัสสภาพอากาศ WMO พิเศษ (เช่น ลูกเห็บตก)**  
> ความเสี่ยงในจุดนี้คือเรื่อง Database Schema Drift หากมีการเปลี่ยนชื่อคอลัมน์ในอนาคต ซึ่งเราได้วางกลไกป้องกันความเสี่ยงไว้ด้วย **Database Migration Scripts (`scripts/migrate.js`)** เรียบร้อยแล้วครับ"

#### 🔍 ตารางสถิติ Coverage รายไฟล์จริงในระบบ:

| ไฟล์ในโปรเจกต์ | % Statements | % Branch | % Functions | % Lines | สถานะการทดสอบ |
|:---|:---:|:---:|:---:|:---:|:---|
| **รวมทั้งระบบ (All Files)** | **89.18%** | **72.63%** | **94.82%** | **89.34%** | **ผ่านเกณฑ์ Baseline สูงมาก** |
| `db.js` (Connection Pool) | 100.00% | 100.00% | 100.00% | **100.00%** | ครอบคลุมสมบูรณ์ 100% |
| `services/weatherService.js` / `external-api.js` | 100.00% | 80.00% | 100.00% | **100.00%** | ครอบคลุมสมบูรณ์ 100% |
| `services/analyticsService.js` | 95.00% | 66.66% | 100.00% | **95.00%** | ครอบคลุมสมบูรณ์ |
| `services/notificationService.js` | 80.95% | 88.23% | 60.00% | **88.88%** | ครอบคลุมระดับสูงมาก |
| `index.js` (Express Gateway) | 86.58% | 68.14% | 97.67% | **86.16%** | ครอบคลุมทุก Route และ Validation |

#### 💡 เหตุผลทางเทคนิคที่ยังคงมีบรรทัด Uncovered เล็กน้อย:
1. **บล็อกดักจับ Uncaught Exception ใน `index.js`:**
   - บรรทัด `catch (err) { next(err); }` มีไว้สำหรับดักจับข้อผิดพลาดระดับร้ายแรงที่ไม่อาจคาดการณ์ได้ (เช่น หน่วยความจำระบบเต็ม หรือ Disk I/O พัง) ซึ่งการจำลองสภาพแวดล้อมเช่นนี้ใน Unit Test ทั่วไปทำได้ยาก
2. **บล็อกการเริ่มต้นพอร์ต `if (require.main === module)`:**
   - บรรทัด `app.listen(PORT)` จะไม่ทำงานขณะรัน Unit Test ผ่าน Supertest เพื่อป้องกันปัญหา Port Collision
3. **การรักษาความเร็วและความแน่นอนของการทดสอบ (Fast & Deterministic):**
   - ใน `tests/db-routes.test.js` เราจำลองการทำงานของฐานข้อมูลผ่าน `jest.spyOn(pool, 'query')` ทำให้สามารถทดสอบทั้งกรณีสำเร็จ (200, 201), กรณีไม่พบข้อมูล (404), กรณีชื่อซ้ำ (400 `ER_DUP_ENTRY`), และกรณีฐานข้อมูลออฟไลน์ (503 `ECONNREFUSED`) ได้อย่างรวดเร็ว (เสร็จสิ้นใน ~9 วินาที) โดยไม่ต้องรอให้เปิด MySQL จริง

#### ⚠️ การวิเคราะห์ความเสี่ยงและการป้องกัน (Risk & Mitigation):
- **ความเสี่ยง (The Risk):**
  - **Schema Mismatch (ข้อมูลไม่ตรงสเปก):** หากในอนาคตมีการเปลี่ยนชื่อคอลัมน์ในตาราง MySQL (เช่น เปลี่ยน `due_date` เป็น `deadline`) โค้ดส่วนที่ต่อคำสั่ง SQL อาจแครชใน Production ได้หากรันเฉพาะ Mock Test
- **แนวทางป้องกันความเสี่ยง (Mitigation Strategies):**
  1. **ใช้ Database Migration Scripts (`scripts/migrate.js`):** ล็อกโครงสร้างตารางและเวอร์ชันไว้ใน `migrations/` ตรวจสอบให้แน่ใจว่า Schema ตรงกับโค้ดเสมอ
  2. **แนวทางอัปเกรดในอนาคต:** สามารถนำ **Testcontainers (Docker on-the-fly)** มาใช้ใน CI/CD Pipeline เพื่อสร้าง MySQL คอนเทนเนอร์จริงชั่วคราวขณะรัน Integration Test ก่อนทำการ Deploy

---

## 5. คลังคำถาม-คำตอบเจาะลึกด้านสถาปัตยกรรมและเทคนิค (Deep-Dive Q&A 8 ข้อเพิ่มเติม)

---

### ❓ ข้อที่ 4: ทำไมต้องใช้ Exponential Backoff ในการ Retry แทนที่จะยิงซ้ำทันที?
> **แนวคำตอบ:**  
> "การยิงคำขอซ้ำทันที (Immediate Retry) ในจังหวะที่เซิร์ฟเวอร์ปลายทางกำลังมีปัญหา จะทำให้เกิดปรากฏการณ์ **Thundering Herd Problem** หรือเปรียบเสมือนการช่วยกันยิง DDoS ซ้ำเติมเซิร์ฟเวอร์ปลายทางที่กำลังโหลดสูงหรือคิวเต็มอยู่แล้ว  
> ในโปรเจกต์ของเรา (ในไฟล์ `services/weatherService.js`) เราจึงเลือกใช้กลไก **Exponential Backoff** โดยกำหนดเวลาหน่วงตามสูตร:  
> `delay = baseDelay * (2 ^ (attempt - 1))`  
> - คำขอล้มเหลวรอบที่ 1: รอ 500 มิลลิวินาที ก่อนเริ่มยิงรอบที่ 2  
> - คำขอล้มเหลวรอบที่ 2: รอ 1,000 มิลลิวินาที  
> การถอยฉากแบบทวีคูณเช่นนี้เป็นมาตรฐานวิศวกรรมเพื่อเปิดโอกาสให้เซิร์ฟเวอร์ปลายทางและช่องสัญญาณเครือข่ายมีเวลาเคลียร์คิวและฟื้นตัว โอกาสที่คำขอรอบถัดไปจะสำเร็จจึงสูงกว่ามากครับ"

---

### ❓ ข้อที่ 5: เมื่อ API ภายนอกล่ม ทำไม Fallback ถึงตอบ HTTP 200 แทน HTTP 500?
> **แนวคำตอบ:**  
> "เพราะเป็นไปตามหลักการออกแบบสถาปัตยกรรม **Graceful Degradation (การลดทอนการทำงานอย่างนุ่มนวล)** ครับ  
> ในระบบ Task Management ข้อมูลสภาพอากาศเป็นเพียง **'บริการเสริม' (Non-critical Feature)** เพื่อช่วยแนะนำกิจกรรมกลางแจ้ง ไม่ใช่แกนหลักของระบบ หาก Open-Meteo ล่ม แล้ว Backend ของเราเลือกตอบกลับด้วย **HTTP 500** จะส่งผลให้หน้าจอ Client เกิดการแครชหรือขึ้น Error สีแดงตัวใหญ่ขัดจังหวะผู้ใช้  
> เราจึงออกแบบให้ตอบกลับด้วย **HTTP 200 OK** พร้อม Payload สำรองที่มีความโปร่งใส:  
> ```json
> {
>   "success": true,
>   "isFallback": true,
>   "weather": {
>     "temperature_celsius": 30.0,
>     "condition": "สภาพอากาศประมาณการ (Estimated / Fallback Data)",
>     "recommendation": "ข้อมูลสภาพอากาศภายนอกไม่พร้อมให้บริการ กรุณาตรวจสอบสภาพอากาศจากแอปพลิเคชันหลักก่อนปฏิบัติงานกลางแจ้ง"
>   },
>   "resilienceMeta": {
>     "status": "FAILED_AFTER_RETRIES",
>     "attemptsMade": 3,
>     "errorReason": "External API ตอบกลับด้วยรหัสข้อผิดพลาด HTTP 500"
>   }
> }
> ```
> การทำเช่นนี้ทำให้ผู้ใช้ยังคงจัดการงานได้ตามปกติ ขณะที่ฝั่ง Developer ก็สามารถตรวจสอบฟิลด์ `isFallback: true` ในระบบ Audit Log เพื่อแก้ไขปัญหาเบื้องหลังได้ครับ"

---

### ❓ ข้อที่ 6: อธิบายการทำงานของ AbortController ว่าดีกว่า setTimeout ธรรมดาอย่างไร?
> **แนวคำตอบ:**  
> "หากเราใช้เพียงฟังก์ชัน `setTimeout()` ทั่วไปในการควบคุมเวลา เมื่อเวลาหมดลง โค้ด JavaScript อาจจะสั่ง Reject Promise เพื่อแจ้งผู้ใช้ว่า Timeout ก็จริง **แต่ในระดับ Network Socket ของระบบปฏิบัติการ คำขอ HTTP ของ Node.js ยังคงเชื่อมต่อค้างอยู่กับเซิร์ฟเวอร์ภายนอก** จนกว่า TCP Socket จะหมดเวลาเองตามค่าเริ่มต้น (ซึ่งอาจยาวนานถึง 60–120 วินาที) ทำให้สิ้นเปลือง File Descriptors และหน่วยความจำ  
> ในโค้ดของเรา เราจึงใช้ **`AbortController`** ร่วมกับ `fetch()`:  
> ```javascript
> const controller = new AbortController();
> const timer = setTimeout(() => controller.abort(), 3000);
> 
> try {
>   const res = await fetch(url, { signal: controller.signal });
> } finally {
>   clearTimeout(timer);
> }
> ```
> เมื่อเวลาผ่านไปครบ 3 วินาที เมธอด `controller.abort()` จะส่งสัญญาณตัดการเชื่อมต่อ Socket ระดับ TCP ทันที ทำให้ Node.js คืนทรัพยากร Network กลับสู่ Connection Pool ได้อย่างหมดจด และไม่เกิด Memory Leak ครับ"

---

### ❓ ข้อที่ 7: ทำไมต้องมีทั้ง Client-side และ Backend Validation? ซ้ำซ้อนหรือไม่?
> **แนวคำตอบ:**  
> "การทำทั้งสองฝั่งไม่ใช่ความซ้ำซ้อน แต่เป็นหลักการความปลอดภัยมาตรฐานสากลที่เรียกว่า **Defense-in-Depth (การตั้งรับแบบหลายชั้น)** โดยมีหน้าที่ต่างกันชัดเจนครับ:  
> 1. **Client-side Validation (ในไฟล์ `frontend/app.js`):**  
>    - เน้นเรื่อง **User Experience (UX)** และความรวดเร็ว ผู้ใช้จะเห็นข้อผิดพลาดทันทีขณะพิมพ์ เช่น ชื่องานต้องมีอย่างน้อย 3 ตัวอักษร ช่วยลด Round-trip และลดภาระการส่งคำขอข้าม Network  
> 2. **Backend Validation (ในไฟล์ `index.js`):**  
>    - เน้นเรื่อง **Security และ Data Integrity** เพราะเราไม่สามารถไว้ใจข้อมูลจากหน้าบ้านได้เลย ผู้ไม่หวังดีสามารถใช้เครื่องมืออย่าง Postman, curl หรือสคริปต์ยิงข้ามหน้าเว็บเข้ามาได้โดยตรง Backend จึงต้องตรวจสอบ Data Type, SQL Injection และ Whitelist ของ Status (`pending`, `in_progress`, `completed`, `cancelled`) ซ้ำเสมอเพื่อปกป้องฐานข้อมูลครับ"

---

### ❓ ข้อที่ 8: ทำไมตาราง `task_tags` ถึงต้องตั้งค่า `ON DELETE CASCADE`?
> **แนวคำตอบ:**  
> "ในโครงสร้างฐานข้อมูล ความสัมพันธ์ระหว่างงาน (Tasks) และป้ายกำกับ (Tags) เป็นแบบ **Many-to-Many (M:N)** คือ งาน 1 งานสามารถมีได้หลายป้ายกำกับ และป้ายกำกับ 1 อันก็นำไปติดให้งานได้หลายงาน จึงต้องมีตารางตัวกลาง (Junction Table) ชื่อ `task_tags` เก็บฟิลด์คู่ `(task_id, tag_id)`  
> โครงสร้างใน `schema.sql`:  
> ```sql
> CREATE TABLE task_tags (
>     task_id INT NOT NULL,
>     tag_id INT NOT NULL,
>     PRIMARY KEY (task_id, tag_id),
>     FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
>     FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
> );
> ```
> **ประโยชน์ของ `ON DELETE CASCADE`:**  
> - **ป้องกัน Orphan Records:** หากเราสั่งลบงานชิ้นที่ 1 ทิ้ง ถ้าไม่มี CASCADE ความสัมพันธ์ใน `task_tags` จะยังคงค้างอยู่เป็นข้อมูลขยะ หรือทำให้ MySQL ฟ้อง Foreign Key Constraint Violation  
> - **ลดภาระโค้ด Application:** ระบบฐานข้อมูลจะช่วยลบความสัมพันธ์ในตารางลูกให้โดยอัตโนมัติ ฝั่ง Node.js ส่งเพียงคำสั่ง `DELETE FROM tasks WHERE id = ?` คำสั่งเดียว ข้อมูลทั้งหมดจะถูกจัดการอย่างถูกต้องตามมาตรฐาน ACID ครับ"

---

### ❓ ข้อที่ 9: Swagger UI ซิงค์กับโค้ดจริงใน Express ได้อย่างไร?
> **แนวคำตอบ:**  
> "เราติดตั้งแพ็กเกจ `swagger-ui-express` และ `yamljs` เข้ามาในไฟล์ `index.js` โดยสั่งโหลดไฟล์สเปก `openapi.yaml` มา Mount เข้ากับ Endpoint `/api-docs` ของ Express โดยตรง:  
> ```javascript
> const swaggerDocument = YAML.load(openapiPath);
> app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
> ```
> เมื่อเซิร์ฟเวอร์เริ่มทำงาน Swagger UI จะอ่านไฟล์สเปกล่าสุดมารันเป็นหน้าเว็บ Interactive Documentation ผู้ตรวจสามารถกดปุ่ม **'Try it out'** บนหน้าเว็บเพื่อส่งคำขอจริงเข้าสู่ Express Router และข้อมูลจะถูกเขียน-อ่านลงใน MySQL จริงแบบ Real-time ครับ"

---

### ❓ ข้อที่ 10: การใช้ Docker MySQL และ Migration Script ช่วยแก้ปัญหาอะไรในการพัฒนา?
> **แนวคำตอบ:**  
> "ช่วยขจัดปัญหาคลาสสิกของนักพัฒนาที่ว่า **'บนเครื่องผมรันผ่าน แต่เครื่องคนอื่นรันไม่ผ่าน' (It works on my machine problem)** ครับ:  
> 1. **Environment Parity ด้วย Docker Compose:** กำหนดคอนฟิกไว้ใน `docker-compose.yml` ระบุอิมเมจ `mysql:8.0` แน่นอน พร้อมพอร์ต `3306:3306` รหัสผ่าน และการตั้งค่า Character Set แบบ `utf8mb4` ทำให้ไม่ว่าจะรันบน Windows, macOS หรือ Linux ก็จะได้ฐานข้อมูลที่มีพฤติกรรมเหมือนกัน 100%  
> 2. **Database as Code ด้วย Migration Scripts:** มีโฟลเดอร์ `migrations/` เก็บไฟล์ `001_initial_schema.sql` และ `002_seed_data.sql` รันคำสั่งเดียวผ่าน `npm run migrate` ระบบจะสร้างฐานข้อมูล ตาราง Foreign Key และข้อมูลตั้งต้นให้ครบถ้วนในเสี้ยววินาที สะดวกอย่างยิ่งสำหรับการรีเซ็ตข้อมูลก่อนขึ้น Demo สดครับ"

---

### ❓ ข้อที่ 11: โครงสร้างโฟลเดอร์ `src/` และ Root เข้ากันได้อย่างไร?
> **แนวคำตอบ:**  
> "เพื่อตอบสนองข้อกำหนดการส่งงานที่ระบุให้มีโค้ดในโฟลเดอร์ `src/` (`src/index.js`, `src/services/external-api.js`) ควบคู่กับการทำงานในระดับ Root เราจึงออกแบบสถาปัตยกรรมแบบ **Dual-Resolution Architecture** ครับ:  
> - ในโค้ดมีการใช้ `fs.existsSync` เพื่อค้นหาพาธของ `openapi.yaml` และโฟลเดอร์ `frontend/` อย่างยืดหยุ่น  
> - มีไฟล์ forwarder `src/db.js` เชื่อมโยงกับ `db.js` ระดับ Root  
> ผลลัพธ์คือผู้ตรวจสามารถสั่งรันระบบได้จากทุกรูปแบบ ไม่ว่าจะพิมพ์ `npm start` (รัน `src/index.js`), `node src/index.js` หรือ `node index.js` ระบบจะทำงานได้อย่างถูกต้องสมบูรณ์แบบโดยไม่มีข้อผิดพลาดเรื่อง Path ครับ"

---

## 6. สรุปผลการทดสอบ Test Coverage Baseline ล่าสุด (45 Tests, 89.34% Lines)

ระบบผ่านการทดสอบอัตโนมัติด้วยคำสั่ง:
```bash
npm test
```

### สรุปผลการรัน Test Suites:
- **Test Suites:** 4 passed, 4 total (100%)
- **Tests ทั้งหมด:** 45 passed, 45 total (100% PASS)
- **ระยะเวลาการรัน:** ~8.8 – 9.6 วินาที

### รายละเอียด 4 ชุดทดสอบ:
1. **`tests/tasks.test.js` (19 Tests):** ทดสอบ Route Handling, Validation Rules, Status Transition, NaN ID Traps, และ 404 Route Not Found
2. **`tests/resilience.test.js` (6 Tests):** ทดสอบ 4 สถานการณ์ของ Weather API (Happy Path, Timeout Abort, Retry with Backoff, Fallback Strategy)
3. **`tests/microservices.test.js` (5 Tests):** ทดสอบ Analytics Calculation, Notification Dispatching (Email/SMS/Webhook), และ Audit Logs
4. **`tests/db-routes.test.js` (15 Tests):** ทดสอบ Controller CRUD ครบทุก Use Case ร่วมกับการ Mock Database Pool Queries พร้อมทดสอบกรณี `ECONNREFUSED` คืนรหัส 503

---

## 7. Checklist เตรียมความพร้อม 60 วินาทีก่อนขึ้นสอบจริง

- [ ] **1. สตาร์ตฐานข้อมูล MySQL:** ตรวจสอบว่า Docker หรือ MySQL Service รันอยู่ (`docker compose up -d`)
- [ ] **2. สตาร์ตเซิร์ฟเวอร์ Express:** รันคำสั่ง `npm start` (เปิดที่พอร์ต 3000)
- [ ] **3. เปิด Chrome แท็บ 1:** [http://localhost:3000/app](http://localhost:3000/app) (เช็คว่าการ์ดงานขึ้นครบ 4 ใบ และ Stat Cards แสดงผลถูกต้อง)
- [ ] **4. เปิด Chrome แท็บ 2:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs) (Swagger UI เปิดติด)
- [ ] **5. เตรียม Terminal สำรอง:** พิมพ์คำสั่ง `npm test` ค้างไว้ พร้อมกด Enter โชว์ผลการรัน 45 Tests ทันทีที่อาจารย์ถาม
- [ ] **6. จิตวิทยา:** ยิ้มแย้ม มั่นใจ สบตาผู้สอน และเริ่มต้นด้วยสคริปต์ 1 นาทีแรกอย่างกระชับ
