# 🏥 Hệ Thống Phục Hồi Chức Năng V3

Hệ thống AI phục hồi chức năng cho người cao tuổi với MediaPipe Pose tracking, JWT authentication, và role-based access.

## 🎯 Tính Năng

### 👤 Cho Bệnh Nhân
- ✅ Tập luyện với AI tracking real-time
- ✅ Xem lịch sử buổi tập
- ✅ Biểu đồ tiến độ cá nhân
- ✅ Phân tích lỗi thường gặp
- ✅ UI thân thiện người cao tuổi (font lớn, màu tương phản cao)

### 🏥 Cho Bác Sĩ
- ✅ Dashboard xem tất cả bệnh nhân
- ✅ Xem chi tiết tiến độ từng bệnh nhân
- ✅ Biểu đồ và phân tích
- ✅ Xuất báo cáo PDF
- ✅ Theo dõi lỗi thường gặp của bệnh nhân

## 🛠 Tech Stack

**Backend:**
- FastAPI
- SQLite
- MediaPipe Pose
- JWT Authentication
- WebSocket

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Recharts (biểu đồ)
- jsPDF (xuất PDF)
- Axios

## 📦 Cài Đặt

### Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install fastapi uvicorn websockets opencv-python mediapipe numpy pyjwt

# Chạy server
python main.py
```

Backend sẽ chạy tại: http://localhost:8000
API Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## 👥 Tài Khoản Mặc Định

**Bác sĩ:**
- Username: `doctor1`
- Password: `doctor123`

**Bệnh nhân:**
- Username: `patient1`
- Password: `patient123`

## 🎨 UI/UX Guidelines

### Senior-Friendly Design
- ✅ Base font: 18px minimum
- ✅ Buttons: 60px+ height
- ✅ High contrast colors
- ✅ Simple navigation
- ✅ Clear visual feedback
- ✅ Large clickable areas

### Color Scheme
- Primary: Blue 600 (#2563eb)
- Success: Green 600 (#16a34a)
- Warning: Yellow 600 (#ca8a04)
- Danger: Red 600 (#dc2626)

## 📁 Cấu Trúc Project

```
rehab-v3/
├── backend/
│   └── main.py              # Backend hoàn chỉnh (700+ dòng)
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   │   ├── VideoCapture.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── PatientCard.tsx
    │   │   ├── SessionCard.tsx
    │   │   ├── ProgressChart.tsx
    │   │   └── ErrorAnalytics.tsx
    │   ├── pages/          # Main pages
    │   │   ├── Login.tsx
    │   │   ├── PatientDashboard.tsx
    │   │   ├── ExercisePage.tsx
    │   │   ├── PatientHistory.tsx
    │   │   ├── DoctorDashboard.tsx
    │   │   └── PatientDetail.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── hooks/
    │   │   └── useWebSocket.ts
    │   ├── utils/
    │   │   └── api.ts
    │   ├── types.ts
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Exercises
- `GET /api/exercises` - Danh sách bài tập (protected)

### Sessions (Patient)
- `POST /api/sessions/start` - Bắt đầu buổi tập
- `POST /api/sessions/{id}/end` - Kết thúc buổi tập
- `GET /api/sessions/my-history` - Lịch sử của mình

### Doctor
- `GET /api/doctor/patients` - Danh sách bệnh nhân
- `GET /api/doctor/patient/{id}/history` - Chi tiết bệnh nhân

### WebSocket
- `WS /ws/exercise/{type}` - Real-time tracking

## 🎮 Workflow

### Patient Flow:
1. Login → Patient Dashboard
2. Click "Bắt Đầu Tập Luyện"
3. Chọn bài tập (Squat / Nâng Tay)
4. Tập với camera + AI tracking
5. Xem tóm tắt sau khi tập
6. Xem lịch sử và biểu đồ

### Doctor Flow:
1. Login → Doctor Dashboard
2. Xem danh sách bệnh nhân
3. Click vào bệnh nhân để xem chi tiết
4. Xem biểu đồ và phân tích lỗi
5. Xuất báo cáo PDF

## 🐛 Troubleshooting

**Port đã được sử dụng:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Camera không hoạt động:**
- Đảm bảo trình duyệt có quyền truy cập camera
- Sử dụng HTTPS hoặc localhost
- Kiểm tra không có app nào khác đang dùng camera

**WebSocket không kết nối:**
- Kiểm tra backend đang chạy
- Kiểm tra proxy config trong vite.config.ts
- Xem console logs để debug

## 📝 Database

Database tự động khởi tạo khi chạy backend lần đầu.

**File:** `rehab_v3.db` (SQLite)

**Tables:**
- `users` - Người dùng (patient, doctor)
- `sessions` - Buổi tập
- `session_frames` - Chi tiết từng frame
- `session_errors` - Lỗi tổng hợp

**Reset database:**
```bash
# Xóa file database
rm rehab_v3.db

# Restart backend (sẽ tự tạo lại)
python main.py
```

## 🚀 Build cho Production

### Frontend
```bash
npm run build
```

Sẽ tạo folder `dist/` với static files.

### Backend
Đảm bảo đổi `SECRET_KEY` trong `main.py` trước khi deploy!

## 📊 Features Checklist

- [x] JWT Authentication
- [x] Role-based access (Patient/Doctor)
- [x] Real-time pose tracking
- [x] Session management
- [x] Database persistence
- [x] Patient dashboard
- [x] Doctor dashboard
- [x] Progress charts
- [x] Error analytics
- [x] PDF reports
- [x] Senior-friendly UI
- [x] Responsive design

## 💡 Future Enhancements

- [ ] Exercise recommendations based on performance
- [ ] Video recording of sessions
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Mobile app
- [ ] More exercise types
- [ ] Real-time doctor monitoring
- [ ] Group sessions

## 📞 Support

Có vấn đề? Kiểm tra:
1. Backend logs
2. Browser console
3. Network tab trong DevTools
4. Database file exists

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa!

---

**Made with ❤️ for helping elderly people with rehabilitation**
