# AI Photo Restoration & Enhancement Lab

Một ứng dụng full-stack hiện đại sử dụng trí tuệ nhân tạo (AI) để hồi sinh những ký ức quý giá của bạn.

## ✨ Tính năng nổi bật
- **Đa năng AI**:
  - **Phục hồi**: Làm nét ảnh mờ, cũ, hỏng (GFPGAN).
  - **Tô màu**: Biến ảnh đen trắng thành ảnh màu sống động (DeOldify).
  - **Phóng to**: Tăng độ phân giải ảnh lên 4x mà không làm vỡ nét (Real-ESRGAN).
- **Thiết kế Cao cấp**: Giao diện Glassmorphism hiện đại, responsive, trải nghiệm người dùng mượt mà.
- **So sánh Trực quan**: Thanh trượt so sánh Before/After chuyên nghiệp.
- **Lịch sử Xử lý**: Tự động lưu lại các kết quả gần đây trong trình duyệt của bạn.
- **Tải về Chất lượng cao**: Hỗ trợ tải ảnh kết quả về thiết bị.

## 🚀 Cách cài đặt và chạy

### 1. Cấu hình AI (Replicate)
Ứng dụng sử dụng API của [Replicate](https://replicate.com/). 
1. Tạo tài khoản trên Replicate.
2. Lấy API Token từ phần Settings.
3. Mở file `backend/.env` và dán token vào:
   ```env
   REPLICATE_API_TOKEN=your_token_here
   ```

### 2. Chạy Backend
```bash
cd backend
npm install
npm run dev
```
Backend sẽ chạy tại `http://localhost:5000`.

### 3. Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại `http://localhost:5173`.

## 🛠 Công nghệ sử dụng
- **Frontend**: React, Vite, Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Multer, Replicate SDK.
- **AI Models**: GFPGAN v1.4, DeOldify, Real-ESRGAN.

---
&copy; 2026 AI Photo Restoration Lab.
