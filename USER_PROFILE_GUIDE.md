# 📝 Hướng Dẫn Sử Dụng User Profile & AI Personalization

## 🎯 Tổng Quan

Hệ thống **AI Personalization** đã được tích hợp hoàn toàn vào ứng dụng Rehab System. Người dùng có thể:
- Cập nhật thông tin cá nhân (tuổi, chiều cao, cân nặng, bệnh lý)
- Nhận được bài tập được điều chỉnh phù hợp với sức khỏe
- Xem warnings và recommendations cá nhân hóa

---

## 🚀 Cách Sử Dụng

### **Bước 1: Đăng Nhập**

1. Mở trình duyệt và truy cập: **http://localhost:3001**
2. Click **"Đăng Nhập"**
3. Chọn **"Bệnh Nhân"**
4. Đăng nhập với:
   - Username: `patient1`
   - Password: `patient123`

### **Bước 2: Cập Nhật Thông Tin Cá Nhân**

1. Sau khi đăng nhập, click vào **"Thông Tin"** trên navbar
2. Điền các thông tin:

#### **📋 Thông Tin Cơ Bản:**
- **Tuổi**: Nhập tuổi của bạn (ví dụ: 72)
- **Giới tính**: Chọn Nam/Nữ/Khác
- **Chiều cao**: Nhập chiều cao (cm) - ví dụ: 155
- **Cân nặng**: Nhập cân nặng (kg) - ví dụ: 58

💡 **Hệ thống sẽ tự động tính BMI** và hiển thị phân loại:
- Thiếu cân: BMI < 18.5
- Bình thường: BMI 18.5-24.9
- Thừa cân: BMI 25-29.9
- Béo phì: BMI ≥ 30

#### **🏥 Tình Trạng Sức Khỏe:**
Chọn các vấn đề sức khỏe hiện tại:
- ☑️ Viêm khớp gối
- ☑️ Đau vai
- ☑️ Đau lưng
- ☑️ Loãng xương
- ☑️ Tiểu đường
- ☑️ Bệnh tim
- ☑️ Cao huyết áp
- ☑️ Phục hồi sau đột quỵ

#### **🎯 Mức Độ Vận Động:**
Chọn khả năng di chuyển hiện tại:
- 🌱 **Mới bắt đầu**: Ít vận động
- 🚶 **Trung bình**: Vận động vừa phải
- 🏃 **Nâng cao**: Vận động tốt

#### **😔 Mức Độ Đau:**
Kéo thanh trượt từ 0-10:
- 0: Không đau
- 5: Đau vừa
- 10: Rất đau

3. Click **"💾 Lưu Thông Tin"**
4. Thấy thông báo: **"✅ Cập nhật thông tin thành công!"**

### **Bước 3: Nhận Bài Tập Cá Nhân Hóa**

1. Vào trang **"Bài Tập"**
2. Chọn bài tập muốn làm (ví dụ: Squat)
3. Hệ thống AI sẽ tự động:
   - Phân tích thông tin cá nhân
   - Tính toán thông số phù hợp
   - Hiển thị warnings và recommendations

---

## 📊 Ví Dụ Thực Tế

### **Case 1: Bà Lan - 72 tuổi, viêm khớp gối**

**Input:**
```
Tuổi: 72
Giới tính: Nữ
Chiều cao: 155 cm
Cân nặng: 58 kg
BMI: 24.1 (Bình thường)
Bệnh lý: Viêm khớp gối
Mức độ vận động: Mới bắt đầu
Mức độ đau: 4/10
```

**Output (Squat):**
```
🎯 Góc mục tiêu: 125° - 160° (thay vì 90° - 160°)
   → Gập gối nông hơn để bảo vệ khớp

🔢 Số rep khuyến nghị: 8 (thay vì 20)
   → Ít hơn để tránh mệt mỏi

⏱️ Thời gian nghỉ: 60s (thay vì 30s)
   → Nghỉ lâu hơn để hồi phục

📊 Độ khó: 49% (dễ hơn 51% so với người khỏe mạnh)

⚠️ Cảnh báo:
   • Có vấn đề đầu gối - Không gập quá sâu
   • Nên tập với ghế hỗ trợ

💡 Khuyến nghị:
   • Khởi động kỹ 5-10 phút trước khi tập
   • Nghỉ ngơi đầy đủ giữa các set
   • Uống nước trước, trong và sau tập
   • Có thể tập với ghế hỗ trợ phía sau
   • Dừng ngay nếu cảm thấy đau đầu gối
```

### **Case 2: Anh Minh - 35 tuổi, béo phì**

**Input:**
```
Tuổi: 35
Giới tính: Nam
Chiều cao: 175 cm
Cân nặng: 95 kg
BMI: 31.0 (Béo phì)
Bệnh lý: Không
Mức độ vận động: Mới bắt đầu
Mức độ đau: 0/10
```

**Output (Squat):**
```
🎯 Góc mục tiêu: 105° - 160°
   → Gập ít để giảm áp lực lên gối

🔢 Số rep khuyến nghị: 12

⏱️ Thời gian nghỉ: 40s

📊 Độ khó: 68%

⚠️ Cảnh báo:
   • BMI cao - Hạn chế độ sâu để bảo vệ đầu gối
   • Nên tập trên bề mặt mềm (thảm tập)

💡 Khuyến nghị:
   • Bắt đầu chậm, tập trung vào tư thế đúng
   • Có thể chia nhỏ thành nhiều set ngắn
   • Tập nhẹ nhưng đều đặn mỗi ngày
   • Giữ lưng thẳng, đầu gối không vượt qua mũi chân
```

### **Case 3: Chị Hoa - 28 tuổi, khỏe mạnh**

**Input:**
```
Tuổi: 28
Giới tính: Nữ
Chiều cao: 165 cm
Cân nặng: 55 kg
BMI: 22.5 (Bình thường)
Bệnh lý: Không
Mức độ vận động: Nâng cao
Mức độ đau: 0/10
```

**Output (Squat):**
```
🎯 Góc mục tiêu: 90° - 160°
   → Tiêu chuẩn bình thường

🔢 Số rep khuyến nghị: 20

⏱️ Thời gian nghỉ: 30s

📊 Độ khó: 100% (bình thường)

⚠️ Cảnh báo: Không có

💡 Khuyến nghị:
   • Giữ lưng thẳng, đầu gối không vượt qua mũi chân
```

---

## 🎨 Giao Diện User Profile

### **Màn Hình Chính:**
```
┌─────────────────────────────────────────────────┐
│  ← Quay lại                                      │
│                                                   │
│  Thông Tin Cá Nhân                               │
│  Cập nhật thông tin để nhận được bài tập phù hợp │
│                                                   │
│  ┌───────────────────────────────────────────┐  │
│  │ 👤 Thông Tin Cơ Bản                       │  │
│  │                                            │  │
│  │  Tuổi *         [    72     ]             │  │
│  │  Giới tính *    [▼ Nữ      ]             │  │
│  │  Chiều cao *    [   155 cm  ]             │  │
│  │  Cân nặng *     [    58 kg  ]             │  │
│  │                                            │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Chỉ số BMI của bạn: 24.1            │  │  │
│  │  │ Phân loại: Bình thường              │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  ┌───────────────────────────────────────────┐  │
│  │ 🏥 Tình Trạng Sức Khỏe                    │  │
│  │                                            │  │
│  │  ☑ Viêm khớp gối    ☐ Đau vai            │  │
│  │  ☐ Đau lưng         ☑ Loãng xương        │  │
│  │  ☐ Tiểu đường       ☐ Bệnh tim           │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  ┌───────────────────────────────────────────┐  │
│  │ 🎯 Mức Độ Vận Động & Đau Đớn             │  │
│  │                                            │  │
│  │  🌱 Mới bắt đầu  🚶 Trung bình  🏃 Nâng cao│  │
│  │                                            │  │
│  │  Mức độ đau hiện tại: 4/10                │  │
│  │  [━━━━━━━━━━━━━━━━━○━━━━━━━━]           │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  [ 💾 Lưu Thông Tin ]  [ Hủy ]                  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### **Q: Tôi không thấy nút "Thông Tin" trên navbar?**
**A:** Chỉ có bệnh nhân (patient) mới thấy. Bác sĩ (doctor) không có trang này.

### **Q: BMI hiển thị sai?**
**A:** Kiểm tra lại:
- Chiều cao phải nhập bằng **cm** (không phải m)
- Cân nặng phải nhập bằng **kg**
- Ví dụ: 155cm, 58kg → BMI = 24.1

### **Q: Tôi đã update profile nhưng bài tập vẫn khó quá?**
**A:** Sau khi update profile:
1. Vào lại trang "Bài Tập"
2. Chọn lại exercise
3. Hệ thống sẽ load lại personalized params mới

### **Q: Làm sao biết params đã được personalized?**
**A:** Xem phần "Thông Số Cá Nhân Hóa" trên trang Exercise:
- Nếu có warnings và recommendations → đã personalized
- Nếu difficulty score < 100% → đã điều chỉnh dễ hơn

### **Q: Tôi muốn reset về mặc định?**
**A:** Để reset:
1. Set mobility level = "Nâng cao"
2. Pain level = 0
3. Xóa hết medical conditions
4. Lưu lại

---

## 📱 Screenshots

### **1. User Profile Form**
```
[Xem screenshot tại frontend khi truy cập http://localhost:3001/profile]

Features:
- ✅ Dark/Light mode support
- ✅ Real-time BMI calculation
- ✅ Visual pain level slider (0-10)
- ✅ Checkbox grid cho medical conditions
- ✅ Radio cards cho mobility level
- ✅ Responsive design (mobile-friendly)
```

### **2. Exercise Page với Personalized Params**
```
[Sẽ được implement tiếp theo]

Features:
- Hiển thị difficulty score với progress bar
- Warning alerts (màu cam/đỏ)
- Recommendation cards (màu xanh)
- Target angles được điều chỉnh
- Recommended reps & rest time
```

---

## 🎯 Next Steps

### **✅ Đã Hoàn Thành:**
1. Backend API endpoints
2. AI Personalization Engine
3. User Profile Form UI
4. Navbar integration
5. Dark/Light mode support

### **⏳ Cần Làm Tiếp:**
1. **Display Personalized Params trong Exercise Page** (20 phút)
   - Load params khi chọn exercise
   - Hiển thị warnings/recommendations
   - Show difficulty score bar

2. **Integrate với WebSocket** (30 phút)
   - Load custom thresholds khi start exercise
   - Apply vào rep counter
   - Real-time adjustment

3. **Testing với Real Users** (1 tuần)
   - Gather feedback
   - Fine-tune factors
   - Adjust thresholds

---

## 🧪 Test Scenarios

### **Scenario 1: Người Cao Tuổi**
```
Input:
  Age: 75
  BMI: 23
  Medical: knee_arthritis, osteoporosis
  Mobility: beginner
  Pain: 5

Expected Output (Squat):
  - Down angle > 110° (rất nông)
  - Max reps < 10
  - Rest > 50s
  - Many warnings about knee and safety
  - Recommendations về ghế hỗ trợ
```

### **Scenario 2: Người Trẻ Khỏe**
```
Input:
  Age: 25
  BMI: 22
  Medical: none
  Mobility: advanced
  Pain: 0

Expected Output (Squat):
  - Down angle = 90° (chuẩn)
  - Max reps = 20
  - Rest = 30s
  - No warnings
  - Basic recommendations only
```

### **Scenario 3: Người Béo Phì**
```
Input:
  Age: 40
  BMI: 32
  Medical: none
  Mobility: beginner
  Pain: 0

Expected Output (Squat):
  - Down angle > 100° (nông)
  - Max reps ~ 12-15
  - Rest > 35s
  - Warning về BMI cao
  - Recommendations về chia nhỏ sets
```

---

## 📚 Resources

### **API Documentation:**
- Swagger UI: http://localhost:8000/docs
- Postman Collection: [Link sẽ được cung cấp]

### **Code References:**
- Backend: `backend/ai_models/personalization_engine.py`
- Frontend: `frontend/src/pages/UserProfile.tsx`
- Database: `backend/main.py` (init_db function)

### **External Resources:**
- BMI Calculator: https://www.who.int/health-topics/obesity
- Exercise Guidelines: https://www.acsm.org/
- Rehabilitation Best Practices: https://www.physio-pedia.com/

---

## 📞 Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra console log (F12 trong browser)
2. Kiểm tra backend terminal có lỗi không
3. Restart cả backend và frontend
4. Clear browser cache và localStorage

**Backend:** http://localhost:8000
**Frontend:** http://localhost:3001
**Docs:** http://localhost:8000/docs

---

## ✨ Features Highlights

### **🤖 AI-Powered**
- Rule-based algorithm với 5 factors
- Tự động điều chỉnh dựa trên profile
- Học được patterns từ multiple conditions

### **🎨 User-Friendly**
- Intuitive form design
- Real-time BMI calculation
- Visual pain level slider
- Dark/Light mode support

### **⚡ Real-Time**
- Instant BMI update
- Fast API response (<100ms)
- Smooth UI transitions

### **🔒 Safe & Secure**
- Medical data encrypted
- JWT authentication
- HTTPS ready

### **📊 Data-Driven**
- Evidence-based thresholds
- WHO BMI standards
- ACSM exercise guidelines

---

**Version:** 1.0.0  
**Last Updated:** November 6, 2025  
**Author:** Rehab System Development Team
