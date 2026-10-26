# เอกสารข้อกำหนดความต้องการของระบบ (Requirement Specification)
## ระบบจัดการงานและติดตามสถานะ (TaskFlow Pro — Task Management System)
**รหัสนิสิต:** 67160191  
**หลักสูตร/วิชา:** 88736065 การพัฒนาเว็บเซอร์วิสและเว็บแอปพลิเคชัน (Web Application Programming / API Development)  
**การบูรณาการครบ 3 ระยะ:** Phase 1 (DB/Requirement), Phase 2 (Docs/DX & Resilience), Phase 3 (Microservices & Frontend)  

---

## 1. ชื่อระบบและวัตถุประสงค์

**ชื่อระบบ:** ระบบจัดการงานและติดตามสถานะ (Task Management System — TaskFlow Pro)

**วัตถุประสงค์และปัญหาที่ระบบแก้ไข:**
ในการทำงานและการเรียนในปัจจุบัน ผู้ใช้งานมักพบปัญหาการหลงลืมกำหนดการ (Due Dates), ไม่สามารถจัดลำดับความสำคัญของภารกิจได้อย่างมีแบบแผน, ตลอดจนขาดเครื่องมือช่วยเตือนภัยสภาพอากาศสำหรับงานที่ต้องปฏิบัติการนอกสถานที่ (Outdoor Activities) ระบบ TaskFlow Pro ถูกพัฒนาขึ้นเพื่อแก้ปัญหาเหล่านี้แบบองค์รวม:
1. เป็นศูนย์กลางบันทึกภารกิจ ติดตามความคืบหน้า และจัดกลุ่มงานด้วยป้ายกำกับ (Tags)
2. เชื่อมโยงข้อมูลสภาพอากาศแบบเรียลไทม์พร้อมระบบความทนทานต่อความล้มเหลว (Resilience) ช่วยให้วางแผนงานกลางแจ้งได้อย่างปลอดภัย
3. ประมวลผลสถิติและอัตราความสำเร็จของงานผ่านโมดูล Microservices
4. ให้บริการผ่านเว็บแอปพลิเคชัน (Frontend) ที่ใช้งานง่าย รวดเร็ว และมีการตรวจสอบความถูกต้องอย่างรัดกุม

**กลุ่มผู้ใช้เป้าหมาย:**
นักเรียน นักศึกษา บุคลากร และทีมงานที่ต้องการเครื่องมือบริหารจัดการงานและตารางเวลาอย่างมีประสิทธิภาพ

---

## 2. ขอบเขตและสถาปัตยกรรมของระบบตามแต่ละระยะ (Phased Requirements)

### ระยะที่ 1: Database Design & Core RESTful CRUD (สัปดาห์ที่ 5)
- ออกแบบฐานข้อมูลเชิงสัมพันธ์ Relational Database (MySQL)
- พัฒนา RESTful API รองรับการสร้าง อ่าน อัปเดต และลบข้อมูล (CRUD)
- ตรวจสอบความสัมพันธ์ระหว่างตารางแบบ 1:N และ M:N ตามมาตรฐาน Codd's Relational Rules

### ระยะที่ 2: Developer Experience (DX) & External API Resilience (สัปดาห์ที่ 10-11)
- จัดทำเอกสาร OpenAPI Specification 3.0.3 พร้อมติดตั้ง Interactive Swagger UI ที่ `/api-docs`
- จัดทำ Postman Collection พร้อม Saved Examples ครบทุกกรณี
- เชื่อมต่อ Open-Meteo Weather API พร้อมระบบ Fault-Tolerant Resilience:
  - **Timeout:** ควบคุมด้วย `AbortController` (3,000ms)
  - **Retry Logic:** เรียกซ้ำอัตโนมัติ 2 ครั้ง พร้อม Exponential Backoff (500ms, 1,000ms)
  - **Graceful Fallback:** ส่งคืนข้อมูลสำรองที่ปลอดภัย ไม่ทำให้เซิร์ฟเวอร์ Crash

### ระยะที่ 3: Microservices Integration & Client Frontend (สัปดาห์ที่ 13-15)
- รวมโมดูล **Microservices สัปดาห์ที่ 13**:
  - `Analytics Microservice`: คำนวณสรุปสถิติงาน อัตราสำเร็จ (Completion Rate) และคะแนนประสิทธิภาพ
  - `Notification Microservice`: จัดส่งแจ้งเตือนผ่าน Email, SMS, Webhook และบันทึก Dispatch Logs
- พัฒนา **Client-Facing Frontend (CLO6)**:
  - หน้าเว็บแบบ Reactive Single Page Interface ให้บริการที่ `/app` และ `/`
  - เชื่อมต่อ API จริงครอบคลุมทั้ง GET, POST, PATCH, DELETE
  - มีการจัดการสถานะ Loading, Error, Empty State และ Toast Notification
  - แบบฟอร์มสร้างงานพร้อม Client-Side Validation

---

## 3. รายการ Use Case หลักของระบบ

1. **UC-01: ผู้ใช้สร้างงานใหม่ (Create Task):**
   - ผู้ใช้สามารถสร้างงานใหม่ ระบุหัวข้อ (title), รายละเอียด (description), กำหนดวันเสร็จ (due_date), ผู้รับผิดชอบ (user_id) และเลือกป้ายกำกับ (tag_ids) ได้พร้อมกัน
2. **UC-02: ผู้ใช้เรียกดูรายการงานทั้งหมด (List Tasks):**
   - ผู้ใช้สามารถดูรายการงานทั้งหมด ค้นหาตามคำสำคัญ และกรองตามสถานะ (`pending`, `in_progress`, `completed`, `cancelled`) หรือตาม `user_id`
3. **UC-03: ผู้ใช้เรียกดูรายละเอียดงานรายบุคคล (Get Task by ID):**
   - แสดงข้อมูลงานโดยละเอียด พร้อมชื่อและอีเมลของผู้สร้างงาน และรายการป้ายกำกับทั้งหมด
4. **UC-04: ผู้ใช้อัปเดตข้อมูลงานทั้งหมด (Update Task via PUT):**
   - แก้ไขข้อมูลของงานและปรับเปลี่ยนชุดป้ายกำกับที่เชื่อมโยง
5. **UC-05: ผู้ใช้อัปเดตสถานะงานอย่างรวดเร็ว (Update Status via PATCH):**
   - ปรับเปลี่ยนสถานะของงานได้ทันที เช่น เลื่อนสถานะเป็น `completed`
6. **UC-06: ผู้ใช้ลบงานออกจากระบบ (Delete Task):**
   - ลบงานที่ไม่ต้องการออกจากระบบ พร้อมลบความสัมพันธ์ในตาราง `task_tags` โดยอัตโนมัติ
7. **UC-07: ผู้ใช้ตรวจสอบสภาพอากาศสำหรับงาน (Task Weather Advisory):**
   - ดึงข้อมูลพยากรณ์อากาศตามกำหนดวันของงาน พร้อมคำแนะนำความปลอดภัย โดยระบบทนทานต่อความล้มเหลว
8. **UC-08: ผู้ใช้ดูภาพรวมสถิติงาน (Task Analytics Microservice):**
   - สรุปจำนวนงานทั้งหมด อัตราสำเร็จร้อยละ และดัชนีประสิทธิภาพ
9. **UC-09: ผู้ใช้ส่งการแจ้งเตือนงาน (Notification Microservice):**
   - จัดส่งข้อความแจ้งเตือนผู้รับผิดชอบผ่านช่องทางที่เลือก และบันทึกประวัติการส่ง
10. **UC-10: ผู้ใช้จัดการหมวดหมู่ป้ายกำกับ (Manage Tags):**
    - เรียกดูป้ายกำกับทั้งหมด และสร้างป้ายกำกับใหม่

---

## 4. รายการ Resources และโครงสร้างฐานข้อมูล (Entity-Relationship)

### 4.1 ตารางในระบบฐานข้อมูล
1. **`users` (ผู้ใช้งาน):**
   - `id` (INT PK AI): รหัสประจำตัวผู้ใช้
   - `username` (VARCHAR(50) UNIQUE): ชื่อผู้ใช้
   - `email` (VARCHAR(100) UNIQUE): อีเมล
   - `created_at` (TIMESTAMP): วันเวลาที่สร้างบัญชี
2. **`tasks` (งาน / ภารกิจ):**
   - `id` (INT PK AI): รหัสประจำงาน
   - `title` (VARCHAR(255) NOT NULL): หัวข้องาน
   - `description` (TEXT): รายละเอียดงาน
   - `due_date` (DATE): วันที่ครบกำหนดส่ง
   - `status` (ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending'): สถานะงาน
   - `user_id` (INT NOT NULL FK -> users.id ON DELETE CASCADE): รหัสผู้รับผิดชอบ
   - `created_at` (TIMESTAMP): วันเวลาที่สร้างงาน
3. **`tags` (ป้ายกำกับหมวดหมู่):**
   - `id` (INT PK AI): รหัสประจำป้ายกำกับ
   - `name` (VARCHAR(50) UNIQUE NOT NULL): ชื่อป้ายกำกับ
4. **`task_tags` (ตารางเชื่อมโยง Many-to-Many Linking Table):**
   - `task_id` (INT NOT NULL FK -> tasks.id ON DELETE CASCADE)
   - `tag_id` (INT NOT NULL FK -> tags.id ON DELETE CASCADE)
   - PRIMARY KEY (`task_id`, `tag_id`)

### 4.2 ความสัมพันธ์ระหว่าง Entity
- **Users กับ Tasks เป็นความสัมพันธ์แบบ 1:N (One-to-Many):** ผู้ใช้ 1 คนสามารถมีงานในความดูแลได้หลายงาน แต่งาน 1 งานต้องเป็นของผู้ใช้คนเดียวเท่านั้น
- **Tasks กับ Tags เป็นความสัมพันธ์แบบ M:N (Many-to-Many):** งาน 1 งานสามารถมีได้หลายป้ายกำกับ และป้ายกำกับ 1 ป้ายสามารถนำไปติดให้กับงานได้หลายงาน เชื่อมโยงผ่านตาราง `task_tags`

---

## 5. มาตรฐานและการทดสอบ (Quality Assurance & Compliance)
- **OpenAPI 3.0.3 Compliance:** เอกสาร API ทุกเส้นทางตรงกับโค้ดที่รันจริง 100%
- **Automated Testing:** มีชุดทดสอบด้วย Jest & Supertest ทั้งหมด 45 ข้อ ผ่าน 100% (Line Coverage > 89%)
- **Fault Tolerance:** มีสคริปต์ `test-resilience.js` จำลอง 4 สถานการณ์ความล้มเหลวของบริการภายนอก และระบบสามารถกู้คืนผ่าน Fallback ได้อย่างสมบูรณ์
