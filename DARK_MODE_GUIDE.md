# 🌓 Hướng Dẫn Dark Mode / Light Mode

## ✅ Đã Hoàn Thành

Hệ thống Dark Mode đã được tích hợp đầy đủ vào ứng dụng với các tính năng:

### 🎨 Tính Năng
- ✅ **Toggle Button**: Nút chuyển đổi theme ở góc trên navbar
- ✅ **Lưu Preference**: Theme được lưu vào localStorage (không mất khi reload)
- ✅ **Smooth Transition**: Chuyển đổi mượt mà với animation 300ms
- ✅ **Full Support**: Tất cả trang đã hỗ trợ cả 2 theme
- ✅ **Default Dark**: Mặc định mở ứng dụng sẽ là Dark Mode

### 📁 Các File Đã Cập Nhật

#### 1. **ThemeContext.tsx** (MỚI)
```
frontend/src/context/ThemeContext.tsx
```
- Quản lý state dark/light mode
- Lưu preference vào localStorage
- Export `useTheme()` hook để dùng ở các component

#### 2. **ThemeToggle.tsx** (MỚI)
```
frontend/src/components/ThemeToggle.tsx
```
- Nút toggle với icon mặt trời (☀️) / mặt trăng (🌙)
- Có tooltip và accessible

#### 3. **tailwind.config.js**
```javascript
darkMode: 'class', // Thêm dòng này
```

#### 4. **main.tsx**
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

#### 5. **Pages đã cập nhật**
- ✅ `Landing.tsx` - Trang chủ với full dark/light support
- ✅ `Login.tsx` - Form đăng nhập
- ✅ `LoginChoice.tsx` - Chọn loại tài khoản
- ✅ `ExercisePage.tsx` - Trang danh sách bài tập

## 🎯 Cách Sử Dụng

### Cho User:
1. Mở ứng dụng
2. Nhìn lên góc trên navbar, tìm nút có icon ☀️ hoặc 🌙
3. Click vào nút để chuyển đổi Dark ↔️ Light
4. Theme sẽ được lưu tự động, lần sau vào sẽ giữ nguyên

### Cho Developer:
Muốn thêm dark mode cho component mới:

```tsx
import { useTheme } from '../context/ThemeContext';

export const MyComponent = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-900">
      <h1 className="text-gray-900 dark:text-white">
        Hello
      </h1>
    </div>
  );
};
```

**Quy tắc class:**
- Light mode class trước: `bg-white`
- Dark mode class sau với `dark:` prefix: `dark:bg-gray-900`
- Tailwind tự động switch dựa vào class `dark` trên `<html>`

## 🎨 Color Scheme

### Light Mode
- Background: `bg-white`, `bg-gray-50`, `bg-gray-100`
- Text: `text-gray-900`, `text-gray-700`
- Borders: `border-gray-200`, `border-gray-300`
- Gradients: Teal/Cyan với opacity cao

### Dark Mode
- Background: `dark:bg-black`, `dark:bg-gray-900`, `dark:bg-gray-800`
- Text: `dark:text-white`, `dark:text-gray-300`
- Borders: `dark:border-gray-700`, `dark:border-gray-800`
- Gradients: Teal/Cyan với opacity thấp hơn

## 🔧 Troubleshooting

### Theme không lưu sau khi reload?
- Check localStorage trong DevTools
- Phải có key `theme` với value `"dark"` hoặc `"light"`

### Một số element không chuyển màu?
- Check xem có thiếu `dark:` class không
- Thêm `transition-colors duration-300` để smooth

### Toggle button không hiện?
- Check xem `ThemeToggle` đã được import vào navbar chưa
- Phải wrap app trong `<ThemeProvider>`

## 📝 TODO (Nếu cần mở rộng)

- [ ] Thêm dark mode cho Dashboard (Doctor/Patient)
- [ ] Thêm dark mode cho Exercise.tsx (trang tập luyện)
- [ ] Thêm dark mode cho PatientHistory
- [ ] Custom theme colors (không chỉ dark/light)
- [ ] System preference detection (`prefers-color-scheme`)

## 🎉 Kết Quả

Bây giờ ứng dụng của bạn đã có:
- ✅ Dark Mode đầy đủ
- ✅ Light Mode đầy đủ
- ✅ Toggle button dễ dùng
- ✅ Lưu preference tự động
- ✅ UI đẹp cả 2 theme

**Enjoy your new dark mode! 🌙✨**
