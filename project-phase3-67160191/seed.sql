-- ตั้งค่า Character Set สำหรับการรองรับภาษาไทย
SET NAMES utf8mb4;

USE task_management;

-- ลบข้อมูลเก่าก่อน (ถ้ามี) เพื่อให้สามารถรันซ้ำได้โดยไม่ติด duplicate
DELETE FROM task_tags;
DELETE FROM tags;
DELETE FROM tasks;
DELETE FROM users;
-- รีเซ็ตค่า AUTO_INCREMENT (ตัวเลือกเสริมเพื่อให้ id เริ่มต้นที่ 1 เสมอ)
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE tasks AUTO_INCREMENT = 1;
ALTER TABLE tags AUTO_INCREMENT = 1;

-- 1. เพิ่มข้อมูลผู้ใช้งาน (อย่างน้อย 3 ระเบียน)
INSERT INTO users (username, email) VALUES
  ('somchai', 'somchai@example.com'),
  ('somsri', 'somsri@example.com'),
  ('mana', 'mana@example.com');

-- 2. เพิ่มข้อมูลป้ายกำกับ (อย่างน้อย 3 ระเบียน)
INSERT INTO tags (name) VALUES
  ('Work'),
  ('Personal'),
  ('Urgent');

-- 3. เพิ่มข้อมูลงาน (อย่างน้อย 3 ระเบียน)
INSERT INTO tasks (title, description, due_date, status, user_id) VALUES
  ('ทำรายงานสรุปประจำเดือน', 'สรุปยอดขายและค่าใช้จ่ายของเดือนนี้ส่งหัวหน้า', '2026-08-31', 'in_progress', 1),
  ('ซื้อของเข้าบ้าน', 'ซื้อนม ไข่ และขนมปังสำหรับสัปดาห์นี้', '2026-08-23', 'pending', 2),
  ('เตรียมพรีเซนต์โปรเจกต์', 'ทำสไลด์สำหรับประชุมทีมเช้าวันจันทร์', '2026-08-25', 'pending', 3),
  ('ตรวจสุขภาพประจำปี', 'นัดหมายที่โรงพยาบาลตอนเช้า', '2026-09-01', 'completed', 1);

-- 4. เพิ่มข้อมูลความสัมพันธ์ระหว่างงานและป้ายกำกับ (อย่างน้อย 3 ระเบียน)
INSERT INTO task_tags (task_id, tag_id) VALUES
  (1, 1), -- รายงานสรุป -> หมวดหมู่ Work
  (1, 3), -- รายงานสรุป -> หมวดหมู่ Urgent
  (2, 2), -- ซื้อของเข้าบ้าน -> หมวดหมู่ Personal
  (3, 1), -- พรีเซนต์โปรเจกต์ -> หมวดหมู่ Work
  (3, 3); -- พรีเซนต์โปรเจกต์ -> หมวดหมู่ Urgent
