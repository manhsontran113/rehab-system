# 🗄️ Database Management Guide

## Quản lý Database SQLite của Rehab System V3

### 📌 Database Location
- **File:** `backend/rehab_v3.db`
- **Type:** SQLite3 database

---

## 🔧 Cách 1: Sử dụng Python Management Tool (Khuyên dùng)

### Chạy tool:
```bash
cd backend
python manage_db.py
```

### Tính năng:
✅ **Xem dữ liệu:**
- View all tables (tất cả bảng)
- View users (người dùng)
- View sessions (buổi tập)
- View errors (lỗi)
- Database statistics (thống kê)

✅ **Xóa dữ liệu:**
- Delete user (xóa người dùng + tất cả sessions)
- Delete session (xóa 1 buổi tập cụ thể)
- Clear all sessions (xóa tất cả sessions, giữ users)

✅ **Advanced:**
- Execute custom SQL query (chạy SQL tùy chỉnh)
- Backup database (sao lưu)

---

## 🗂️ Cách 2: Sử dụng DB Browser for SQLite (GUI)

### Download & Install:
1. Tải về: https://sqlitebrowser.org/dl/
2. Cài đặt phần mềm
3. Mở file: `backend/rehab_v3.db`

### Tính năng DB Browser:
- ✅ Xem/sửa/xóa data bằng GUI
- ✅ Browse Data tab: xem nội dung bảng
- ✅ Execute SQL tab: chạy queries
- ✅ Database Structure: xem cấu trúc bảng
- ✅ Export/Import data

---

## 💻 Cách 3: Sử dụng SQLite Command Line

### Windows:
```powershell
cd backend
sqlite3 rehab_v3.db
```

### Các lệnh cơ bản:
```sql
-- Xem tất cả bảng
.tables

-- Xem cấu trúc bảng
.schema users

-- Xem dữ liệu
SELECT * FROM users;
SELECT * FROM sessions ORDER BY id DESC LIMIT 10;

-- Thống kê
SELECT COUNT(*) FROM sessions;
SELECT AVG(accuracy) FROM sessions;

-- Thoát
.quit
```

---

## 🏗️ Database Schema

### 1. **users** - Người dùng
```
- id: INT (Primary Key)
- username: TEXT (unique)
- password_hash: TEXT
- role: TEXT ('patient' hoặc 'doctor')
- full_name, age, gender, height_cm, weight_kg, bmi
- medical_conditions, injury_type, mobility_level, pain_level
- doctor_notes, contraindicated_exercises
- created_at: TEXT (ISO timestamp)
- doctor_id: INT (Foreign Key → users.id)
```

### 2. **sessions** - Buổi tập
```
- id: INT (Primary Key)
- patient_id: INT (Foreign Key → users.id)
- exercise_name: TEXT
- start_time, end_time: TEXT (ISO timestamp)
- total_reps, correct_reps: INT
- accuracy: REAL (%)
- duration_seconds: INT
- avg_heart_rate: INT
- notes: TEXT
```

### 3. **session_errors** - Lỗi trong buổi tập
```
- id: INT (Primary Key)
- session_id: INT (Foreign Key → sessions.id)
- error_name: TEXT
- count: INT
- severity: TEXT
```

### 4. **session_frames** - Frame data (chi tiết từng frame)
```
- id: INT (Primary Key)
- session_id: INT (Foreign Key → sessions.id)
- timestamp: TEXT
- rep_count: INT
- angles: TEXT (JSON)
- errors: TEXT (JSON)
```

### 5. **user_exercise_limits** - Personalization data
```
- id: INT (Primary Key)
- user_id: INT (Foreign Key → users.id)
- exercise_type: TEXT
- max_depth_angle, min_raise_angle: REAL
- max_reps_per_set, recommended_rest_seconds: INT
- difficulty_score, injury_risk_score: REAL
- created_at, updated_at: TEXT
```

---

## 📝 Useful SQL Queries

### Xem sessions gần nhất của 1 user:
```sql
SELECT * FROM sessions 
WHERE patient_id = 1 
ORDER BY start_time DESC 
LIMIT 10;
```

### Thống kê độ chính xác theo bài tập:
```sql
SELECT 
    exercise_name, 
    COUNT(*) as total_sessions,
    AVG(accuracy) as avg_accuracy,
    AVG(total_reps) as avg_reps
FROM sessions
GROUP BY exercise_name;
```

### Top 10 lỗi phổ biến nhất:
```sql
SELECT 
    error_name, 
    SUM(count) as total_count,
    COUNT(DISTINCT session_id) as sessions_affected
FROM session_errors
GROUP BY error_name
ORDER BY total_count DESC
LIMIT 10;
```

### Tiến độ của 1 patient theo thời gian:
```sql
SELECT 
    DATE(start_time) as date,
    exercise_name,
    accuracy,
    total_reps
FROM sessions
WHERE patient_id = 1
ORDER BY start_time DESC;
```

### Xóa sessions có accuracy < 50%:
```sql
DELETE FROM session_errors 
WHERE session_id IN (
    SELECT id FROM sessions WHERE accuracy < 50
);

DELETE FROM sessions WHERE accuracy < 50;
```

---

## 💾 Backup & Restore

### Tạo backup bằng Python tool:
```bash
cd backend
python manage_db.py
# Chọn option 10: Backup database
```

### Tạo backup thủ công:
```bash
# Windows
copy rehab_v3.db rehab_v3_backup_20250107.db

# Linux/Mac
cp rehab_v3.db rehab_v3_backup_20250107.db
```

### Restore từ backup:
```bash
# Windows
copy rehab_v3_backup_20250107.db rehab_v3.db

# Linux/Mac
cp rehab_v3_backup_20250107.db rehab_v3.db
```

---

## ⚠️ Important Notes

1. **Luôn backup trước khi xóa data hoặc chạy UPDATE/DELETE queries!**

2. **Foreign Key Cascade:**
   - Khi xóa user → tự động xóa sessions của user đó
   - Khi xóa session → tự động xóa errors & frames

3. **Testing vs Production:**
   - Development: dùng `rehab_v3.db`
   - Production: đổi tên hoặc tạo copy riêng

4. **Password Security:**
   - Passwords được hash bằng SHA256
   - Không thể reverse để xem password gốc
   - Reset password = update password_hash với hash mới

---

## 🔐 Tạo User Mới

### Thông qua Python:
```python
import sqlite3
import hashlib
from datetime import datetime

def create_user(username, password, role='patient', full_name=''):
    conn = sqlite3.connect('rehab_v3.db')
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor.execute("""
        INSERT INTO users (username, password_hash, role, full_name, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (username, password_hash, role, full_name, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    print(f"✅ User '{username}' created!")

# Example:
create_user('patient3', 'patient123', 'patient', 'Nguyễn Văn D')
```

### Thông qua SQL:
```sql
INSERT INTO users (username, password_hash, role, full_name, created_at)
VALUES (
    'patient3',
    '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090',  -- password: patient123
    'patient',
    'Nguyễn Văn D',
    datetime('now')
);
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Check database file exists: `backend/rehab_v3.db`
2. Try running: `python check_db.py` để xem database status
3. Backup database trước khi troubleshoot
4. Re-create database: delete `rehab_v3.db` và run `python main.py`

---

## 🎯 Quick Commands Cheat Sheet

```bash
# View database
python manage_db.py           # Interactive menu
python check_db.py            # Quick stats

# Backup
python manage_db.py           # Option 10

# Direct SQL access
sqlite3 rehab_v3.db           # Open DB
.tables                       # List tables
SELECT * FROM users;          # Query
.quit                         # Exit
```

---

**Happy Database Managing! 🚀**
