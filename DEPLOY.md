# 🚀 Hướng Dẫn Deploy Chiếu Nẫu (Frontend: Vercel - Backend: Render)

Tài liệu này hướng dẫn chi tiết từng bước để đưa dự án **Chiếu Nẫu** lên môi trường online hoàn toàn miễn phí.

---

## 📌 BƯỚC 1: Deploy Backend lên Render (Làm trước để lấy URL API)

Backend Node.js/Express quản lý Cơ sở dữ liệu, Đơn hàng, Live Chat thời gian thực và Quản lý tài khoản.

1. Truy cập [dashboard.render.com](https://dashboard.render.com) và đăng nhập (bằng GitHub).
2. Nhấp chọn **New +** ➔ **Web Service**.
3. Chọn kết nối với repository GitHub: **`Toannguyen231/CuocThiReact`**.
4. Cấu hình thông số như sau:
   - **Name**: `chieu-nau-backend` (hoặc tên tùy thích)
   - **Region**: `Singapore` (để tốc độ tải tại Việt Nam nhanh nhất)
   - **Branch**: `main`
   - **Root Directory**: Để trống
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Instance Type**: `Free`
5. Trong mục **Environment Variables**, bấm **Add Environment Variable**:
   - `JWT_SECRET`: `chieu-nau-secret-key-2026` (hoặc chuỗi bảo mật bất kỳ)
   - `PORT`: `10000`
6. Nhấp **Create Web Service** và đợi khoảng 1 - 2 phút để Render build xong.
7. Khi hoàn tất, Render sẽ cung cấp đường link backend của bạn dạng:
   👉 **`https://chieu-nau-backend.onrender.com`** *(Hãy copy đường link này!)*

---

## 📌 BƯỚC 2: Deploy Frontend lên Vercel

Frontend React (Vite) cung cấp toàn bộ giao diện khách hàng, bản đồ giao hàng Leaflet, chatbot AI và trang admin.

1. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
2. Nhấp **Add New...** ➔ **Project**.
3. Chọn repository **`CuocThiReact`** ➔ Nhấp **Import**.
4. Cấu hình Build:
   - **Framework Preset**: `Vite` (Vercel tự động nhận diện)
   - **Root Directory**: `./` (mặc định)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Trong mục **Environment Variables**, thêm 2 biến sau:
   - 🔑 **Biến 1 (API Backend)**:
     - **Key**: `VITE_API_URL`
     - **Value**: Dán URL backend Render vừa copy ở Bước 1 (Ví dụ: `https://chieu-nau-backend.onrender.com`)
   - 🤖 **Biến 2 (Chatbot AI Gemini)**:
     - **Key**: `VITE_GEMINI_API_KEY`
     - **Value**: Dán mã khóa API Gemini của bạn (đã được cấp)
6. Bấm **Deploy**.
7. Sau ~40 giây, Vercel sẽ cấp cho bạn tên miền online chính thức (dạng `https://cuocthireact.vercel.app`).

---

## 🔐 Thông Tin Đăng Nhập Mặc Định

- **Trang Admin**: `https://<domain-cua-ban>.vercel.app/admin`
  - **Tài khoản**: `admin`
  - **Mật khẩu**: `admin123`
- **Khách hàng mẫu**:
  - **Email**: `ngoctoann06@gmail.com`
  - **Mật khẩu**: `admin123`
  *(Hoặc bấm Đăng ký tài khoản mới trực tiếp trên web)*

---

## 💡 Lưu ý quan trọng
- Gói Free của Render sẽ chuyển sang chế độ "ngủ đông" (sleep) nếu không có yêu cầu sau 15 phút. Lần truy cập đầu tiên sau khi ngủ đông có thể mất khoảng 30 - 45 giây để server khởi động lại.
- Nếu bạn cập nhật code trên máy, chỉ cần `git push origin main` là cả Vercel và Render sẽ tự động build và cập nhật phiên bản mới nhất!
