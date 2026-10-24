-- สร้างฐานข้อมูล (ถ้ายังไม่มี) และเลือกใช้งาน
CREATE DATABASE IF NOT EXISTS task_management;
USE task_management;

-- ลบตารางหากมีอยู่แล้ว (เรียงลำดับการลบจากตารางลูกไปยังตารางแม่เพื่อหลีกเลี่ยง error)
DROP TABLE IF EXISTS task_tags;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;

-- 1. ตาราง users (เก็บข้อมูลผู้ใช้งาน)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตาราง tags (เก็บข้อมูลป้ายกำกับ/หมวดหมู่สำหรับจัดกลุ่มงาน)
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 3. ตาราง tasks (เก็บข้อมูลงาน)
-- เป็นความสัมพันธ์แบบ One-to-Many: 1 user สามารถมีได้หลาย tasks
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. ตาราง task_tags (ตารางเชื่อมความสัมพันธ์ระหว่างงานและป้ายกำกับ)
-- เป็นความสัมพันธ์แบบ Many-to-Many: 1 task มีหลาย tags และ 1 tag ใช้ได้กับหลาย tasks
CREATE TABLE task_tags (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
