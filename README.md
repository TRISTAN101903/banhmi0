# BÁNH MÌ 0 — HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ & VẬN HÀNH F&B ĐA NỀN TẢNG
> **Thương hiệu:** BÁNH MÌ 0  
> **Khẩu hiệu:** TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ  
> **Chữ ký thiết kế:** DESIGN BY TRISTAN.TEAMA4  

---

## 🥖 GIỚI THIỆU DỰ ÁN
**BÁNH MÌ 0** là nền tảng thương mại điện tử kết hợp quản lý kinh doanh ẩm thực F&B toàn diện. Dự án mang đến trải nghiệm chuẩn vị bánh mì Việt Nam đương đại kết hợp công nghệ vận hành chuẩn mực:
- **Cửa Hàng Khách Hàng (Customer Storefront):** Giao diện Premium Street Food, nướng bánh nóng giòn, tùy chọn nhân bánh & ghi chú, đặt hàng giao tận nơi hoặc lấy tại tiệm.
- **Bảo Vệ Giá Phía Máy Chủ (Server-Side Price Protection):** Máy chủ tự động kiểm chứng và tính lại 100% giá tiền từ CSDL, không tin cậy giá tiền gửi từ trình duyệt.
- **Quản Lý Định Lượng Nguyên Liệu (Recipe BOM):** Tự động trừ kho nguyên liệu (vỏ bánh mì, thịt, chả, pate, rau thơm, bao bì kraft) khi đơn được duyệt.
- **Chống Trừ Trùng Lặp (Single-Deduction):** Cơ chế Transaction và cờ kiểm soát ngăn chặn việc trừ kho lặp lại khi đơn cập nhật nhiều lần.
- **Phân Quyền Shipper & GPS Thực Tế:** Shipper chỉ xem đơn được phân công, có nút bật/tắt chia sẻ GPS thời gian thực minh bạch.
- **Quản Trị Nhận Diện Thương Hiệu:** Admin có thể cập nhật ảnh đại diện Web/App và ảnh trưng bày cửa hàng ngay trong bảng điều khiển.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Frontend
- **React 18 / 19** với **TypeScript** và **Vite** (Tốc độ khởi động siêu tốc).
- **Tailwind CSS v3:** Thiết kế theo bảng màu ẩm thực Việt: Kem bánh mì (`#FBF7EE`), Nâu bánh mì nướng (`#5C3A21`), Đỏ thương hiệu (`#C83214`), Xanh rau thơm (`#2D6A4F`).
- **Font chữ:** `Be Vietnam Pro` hỗ trợ tiếng Việt 100% không lỗi dấu.
- **Lucide Icons** & **Framer Motion:** Tối ưu hóa hoạt họa và biểu tượng.

### Backend & Database
- **Node.js v24** + **Express.js** + **TypeScript**.
- **Bảo mật:** `bcryptjs` mã hóa mật khẩu, `jsonwebtoken` (JWT) phân quyền theo vai trò (RBAC).
- **Database:** **SQLite** (sử dụng `node:sqlite` tích hợp sẵn trong Node 24, không cần cài đặt C++ build tools, sao lưu di động cực dễ), sẵn sàng kết nối **PostgreSQL** khi deploy production.
- **Validation:** Kiểm tra dữ liệu đầu vào nghiêm ngặt, parameterized queries chống SQL Injection.

---

## 📂 CẤU TRÚC THƯ MỤC
```
PAGE-BANH-MI/
├── frontend/               # Ứng dụng khách hàng, Admin và Shipper
│   ├── src/
│   │   ├── components/     # Layout, Navbar, Footer, ProductCard, CartDrawer...
│   │   ├── context/        # AuthContext, CartContext, ToastContext
│   │   ├── pages/          # HomePage, MenuPage, Checkout, Tracking, Admin, Shipper...
│   │   └── services/       # Kết nối REST API
│   └── dist/               # Bản build production tối ưu
├── backend/                # Máy chủ RESTful API Express + TypeScript
│   ├── src/
│   │   ├── controllers/    # Điều khiển auth, product, order, inventory, delivery...
│   │   ├── database/       # Khởi tạo CSDL, 13 bảng & dữ liệu mẫu (seed.ts)
│   │   ├── middlewares/    # Xác thực JWT, phân quyền vai trò (RBAC)
│   │   ├── routes/         # Định tuyến API (/api/v1/...)
│   │   └── test_suite.ts   # Bộ kiểm thử tự động toàn diện
├── database/               # File CSDL banhmi0.sqlite
├── uploads/                # Lưu trữ ảnh thương hiệu và ảnh sản phẩm
│   └── brand/              # logo_banhmi0.jpg & store_showcase.jpg
├── docs/                   # Bộ tài liệu dự án & cuộc thi
│   ├── ARCHITECTURE.md     # Bản vẽ kiến trúc
│   ├── DATABASE.md         # Mô hình 13 bảng & định lượng BOM
│   ├── API.md              # Đặc tả RESTful API
│   ├── USER_GUIDE.md       # Hướng dẫn khách hàng
│   ├── ADMIN_GUIDE.md      # Hướng dẫn Quản trị viên & Shipper
│   ├── TEST_REPORT.md      # Báo cáo kiểm thử đạt 100% (32/32 tests)
│   ├── STUDENT_CONTRIBUTION.md # Đóng góp học sinh & sáng tạo
│   └── AI_USAGE.md         # Tuyên bố sử dụng AI có kiểm soát
├── .env.example            # Mẫu biến môi trường an toàn
└── README.md               # Tài liệu này
```

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### 1. Chuẩn bị môi trường
- Đảm bảo đã cài đặt **Node.js** (khuyến nghị phiên bản 20 trở lên, dự án đã kiểm thử trên Node v24).

### 2. Cài đặt thư viện
```bash
# Cài đặt backend
cd backend
npm install

# Cài đặt frontend
cd ../frontend
npm install
```

### 3. Nạp dữ liệu mẫu ban đầu (Seed Database)
```bash
cd backend
npm run seed
```

### 4. Chạy kiểm thử tự động (32/32 Tests)
```bash
cd backend
npx tsx src/test_suite.ts
```

### 5. Khởi động ứng dụng
- **Khởi động Backend (Port 5000):**
```bash
cd backend
npm start
```
- **Khởi động Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```
Truy cập trình duyệt tại: **`http://localhost:5173`**

---

## 🔑 TÀI KHOẢN MẪU ĐỂ ĐÁNH GIÁ (DEMO CREDENTIALS)

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin@banhmi0.vn` | `<mật khẩu bạn đặt qua ADMIN_BOOTSTRAP_PASSWORD>` | Toàn quyền quản trị đơn, kho, sản phẩm, cài đặt ảnh đại diện |
| **Nhân Viên Giao Hàng (Shipper)** | `shipper@banhmi0.vn` | `<chỉ có khi SEED_DEMO_ACCOUNTS=true ở môi trường dev>` | Xem đơn phân công, cập nhật giao hàng, bật/tắt GPS |
| **Khách Hàng (Customer)** | Đăng ký tài khoản mới trực tiếp trên web | Tự chọn | Đặt bánh, giỏ hàng, tra cứu tiến trình đơn |

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI PRODUCTION
- **Frontend:** Triển khai trên **Vercel** hoặc **Netlify**, thiết lập Build Command: `npm run build`, Output Directory: `dist`.
- **Backend:** Triển khai trên **Render**, **Railway** hoặc VPS Linux với Node.js.
- **Database:** Chuyển đổi từ SQLite sang **PostgreSQL Managed Service** (Supabase, Neon hoặc Render Postgres) bằng cách cấu hình biến môi trường `DATABASE_URL` trong file `.env`.
- Cấu hình file tĩnh phục vụ ảnh qua CDN hoặc Cloudinary khi đưa vào kinh doanh diện rộng.

---
*© 2026 BÁNH MÌ 0. DESIGN BY TRISTAN.TEAMA4.*
