# TaskFlow Pro — Task Management System (Phase 3 Final Integration)

**รหัสนิสิต:** 67160191  
**วิชา:** 88736065 การพัฒนาเว็บเซอร์วิสและเว็บแอปพลิเคชัน (Web Application Programming / API Development)  
**การบูรณาการครบ 3 ระยะ:**
- **ส่วนที่ 1: Final Integration (Full Stack Sync - CLO8)**
- **ส่วนที่ 2: Client-Facing Frontend (CLO6)**
- **ส่วนที่ 3: Project Defense & Q&A (CLO7)**

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
project-phase3-67160191/
├── src/                                  # โค้ด API รวมทั้งหมด (Unified Express Server)
│   ├── index.js                          # เซิร์ฟเวอร์หลัก พร้อมเมานต์ /api-docs สำหรับ Swagger UI
│   ├── db.js                             # โมดูลเชื่อมต่อ MySQL Database Pool
│   └── services/                         # บริการและโมดูล Microservices
│       ├── external-api.js               # เชื่อมต่อบริการภายนอก (Retry, Timeout, Fallback Logic)
│       ├── weatherService.js             # ตัวประมวลผล Open-Meteo Weather API + Resilience
│       ├── analyticsService.js           # Analytics Microservice (สรุปสถิติและอัตราความสำเร็จ)
│       └── notificationService.js        # Notification Microservice (Email, SMS, Webhook Dispatch)
├── frontend/                             # หน้าเว็บ Client-Facing Frontend (CLO6)
│   ├── index.html                        # หน้าต่างแอปพลิเคชัน TaskFlow Pro
│   ├── style.css                         # การออกแบบ UI/UX สไตล์ Modern Minimalist SaaS
│   └── app.js                            # ควบคุมการเรียก API จริง, State Management & Validation
├── tests/                                # ชุดทดสอบอัตโนมัติ (Automated Test Suites)
│   ├── tasks.test.js                     # ทดสอบ Route, Validation และ Status Codes
│   ├── resilience.test.js                # ทดสอบ 4 Failure Scenarios ของ External API
│   ├── microservices.test.js             # ทดสอบ Analytics และ Notification Microservices
│   └── db-routes.test.js                 # ทดสอบ Mocked Database Controllers (High Coverage)
├── postman_collection.json               # Postman Collection v2.1.0 พร้อม Saved Examples ครบทุก Endpoint
├── openapi.yaml                          # สเปกเอกสาร API ตามมาตรฐาน OpenAPI Specification 3.0.3
├── coverage-report.md                    # รายงาน Test Coverage Baseline (Lines > 89%)
├── failure-scenario-results.md           # รายงานผลการทดสอบ Failure Scenarios ทั้ง 4 กรณี
├── requirement.md                        # เอกสารข้อกำหนดความต้องการระบบครบทั้ง 3 ระยะ
├── erd.png                               # แผนภาพ Entity Relationship Diagram
├── schema.sql                            # สคริปต์ DDL สร้างตารางฐานข้อมูล MySQL
├── seed.sql                              # ข้อมูลจำลองสำหรับเริ่มต้นระบบ
├── db.js                                 # โมดูลเชื่อมต่อฐานข้อมูลสำหรับ Root Level
├── test-resilience.js                    # สคริปต์รันจำลองการทดสอบ Resilience แบบแยกเดี่ยว
├── defense-qa.md                         # แนวทางการตอบคำถามสำหรับการสอบ Project Defense
└── package.json                          # กำหนดค่าโปรเจกต์และ Scripts
```

---

## 🚀 วิธีการติดตั้งและรันระบบ (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่าฐานข้อมูล (MySQL)
สร้างฐานข้อมูล `task_db` และรันสคริปต์:
```bash
mysql -u root -p task_db < schema.sql
mysql -u root -p task_db < seed.sql
```
*(กำหนดค่าการเชื่อมต่อในไฟล์ `.env` เช่น `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)*

### 3. เริ่มต้นรันเซิร์ฟเวอร์
```bash
npm start
```
ระบบจะเปิดบริการที่พอร์ต 3000:
- 🌐 **Client-Facing Frontend App:** [http://localhost:3000/app](http://localhost:3000/app) หรือ [http://localhost:3000/](http://localhost:3000/)
- 📖 **Swagger UI Documentation:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- 📄 **Raw OpenAPI Spec (JSON):** [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

---

## 🧪 การรันชุดทดสอบ (Automated Testing)

### รันชุดทดสอบทั้งหมด พร้อมสรุป Coverage Baseline:
```bash
npm test
```
*ผลการทดสอบ: 4 Test Suites, 45 Tests Passed (100%), Line Coverage > 89%*

### รันการทดสอบ Resilience 4 สถานการณ์:
```bash
npm run test:resilience
# หรือ
node test-resilience.js
```

---

## 📋 สรุป Endpoints หลัก (14 Endpoints)

| Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- |
| `GET` | `/api/v1/tasks` | ดึงรายการงานทั้งหมด (รองรับกรอง status, user_id) |
| `POST` | `/api/v1/tasks` | สร้างงานใหม่ พร้อมระบุป้ายกำกับ |
| `GET` | `/api/v1/tasks/:id` | ดึงรายละเอียดงานตาม ID (รวม Owner และ Tags) |
| `PUT` | `/api/v1/tasks/:id` | แก้ไขข้อมูลงานทั้งหมด |
| `PATCH`| `/api/v1/tasks/:id/status` | อัปเดตสถานะงานอย่างรวดเร็ว |
| `DELETE`| `/api/v1/tasks/:id` | ลบงานออกจากระบบ |
| `GET` | `/api/v1/tasks/:id/weather` | ดึงสภาพอากาศสำหรับงาน (Retry, Timeout, Fallback) |
| `GET` | `/api/v1/weather` | ทดสอบสภาพอากาศและจำลอง Failure Scenarios |
| `GET` | `/api/v1/analytics/summary`| สรุปสถิติภาพรวมงาน (Analytics Microservice) |
| `POST` | `/api/v1/notifications/send`| ส่งการแจ้งเตือนงาน (Notification Microservice) |
| `GET` | `/api/v1/notifications/logs`| ดึงประวัติการส่งแจ้งเตือน (Notification Logs) |
| `GET` | `/api/v1/users` | ดึงรายชื่อผู้ใช้งานทั้งหมด |
| `GET` | `/api/v1/tags` | ดึงรายการป้ายกำกับทั้งหมด |
| `POST` | `/api/v1/tags` | สร้างป้ายกำกับใหม่ |
