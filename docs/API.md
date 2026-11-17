# TÀI LIỆU RESTFUL API — BÁNH MÌ 0
*Đặc tả giao thức giao tiếp Frontend - Backend*  
**Prefix Endpoint:** `/api/v1`  
**Định dạng dữ liệu:** JSON (`application/json`)  
**Xác thực:** Header `Authorization: Bearer <JWT_TOKEN>`

---

## 1. XÁC THỰC & NGƯỜI DÙNG (`/auth`)

### 1.1. Đăng ký tài khoản khách hàng
- **Method:** `POST /api/v1/auth/register`
- **Body:**
```json
{
  "email": "khachhang@example.com",
  "password": "Password123!",
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Lê Lợi, Quận 1"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 4, "email": "khachhang@example.com", "role": "CUSTOMER" }
  }
}
```

### 1.2. Đăng nhập hệ thống
- **Method:** `POST /api/v1/auth/login`
- **Body:** `{ "email": "...", "password": "..." }`
- **Tài khoản mẫu:**
  - Admin: `admin@banhmi0.vn` / `BanhMi0@Admin2026!`
  - Shipper: `shipper@banhmi0.vn` / `Shipper@123`

---

## 2. SẢN PHẨM & THỰC ĐƠN (`/products`)

### 2.1. Lấy danh sách sản phẩm
- **Method:** `GET /api/v1/products`
- **Query Params:**
  - `category_id`: lọc theo danh mục
  - `featured=true`: chỉ lấy món nổi bật
  - `search=...`: tìm theo từ khóa
  - `all=true`: lấy cả món đã ẩn (dành cho Admin)

### 2.2. Chi tiết sản phẩm & công thức BOM
- **Method:** `GET /api/v1/products/:id`

### 2.3. Tạo & Cập nhật món (Admin / Staff)
- **Method:** `POST /api/v1/products` & `PUT /api/v1/products/:id`

---

## 3. ĐƠN HÀNG & TÍNH GIÁ SERVER (`/orders`)

### 3.1. Tạo đơn hàng mới
- **Method:** `POST /api/v1/orders`
- **Header:** Tùy chọn `Authorization` (khách vãng lai vẫn đặt được)
- **Body:**
```json
{
  "customer_name": "Trần Thị B",
  "customer_phone": "0988776655",
  "delivery_address": "456 Nguyễn Huệ, Quận 1",
  "fulfillment_type": "DELIVERY",
  "notes": "Nướng thật giòn, không ăn ớt",
  "items": [
    { "product_id": 4, "quantity": 2 },
    { "product_id": 1, "quantity": 1 }
  ]
}
```
- **Đặc điểm:** Server tự truy vấn giá gốc từ CSDL và tính tổng tiền, không tin giá từ trình duyệt.

### 3.2. Tra cứu chi tiết đơn hàng
- **Method:** `GET /api/v1/orders/:identifier` (nhận `id` hoặc `order_code`)

### 3.3. Cập nhật trạng thái đơn (Admin / Staff / Shipper)
- **Method:** `PATCH /api/v1/orders/:id/status`
- **Body:** `{ "status": "CONFIRMED", "note": "Xác nhận đơn và bắt đầu chuẩn bị" }`
- **Cơ chế trừ kho an toàn:** Nếu status là `CONFIRMED` hoặc `PREPARING` và `is_inventory_deducted === 0`, server tự động trừ kho nguyên liệu theo định lượng BOM.

---

## 4. KHO & NGUYÊN VẬT LIỆU (`/inventory`)

- `GET /api/v1/inventory/ingredients`: Lấy danh sách tồn kho, ngưỡng báo động.
- `POST /api/v1/inventory/adjust`: Điều chỉnh tồn kho (`IN`, `OUT`, `ADJUST`) kèm lý do bắt buộc.
- `GET /api/v1/inventory/movements`: Nhật ký biến động xuất nhập kho.

---

## 5. ĐIỀU PHỐI SHIPPER & GPS THỜI GIAN THỰC (`/delivery`)

- `POST /api/v1/delivery/assign`: Admin điều phối đơn cho shipper.
- `GET /api/v1/delivery/tasks`: Shipper xem đơn được giao.
- `POST /api/v1/delivery/location`: Shipper phát tọa độ GPS thực tế.
- `GET /api/v1/delivery/location/:order_id`: Khách hàng xem vị trí shipper (nếu shipper bật chia sẻ) hoặc thông báo: *"Chưa có dữ liệu vị trí giao hàng trực tiếp"*.

---

## 6. CÀI ĐẶT & THỐNG KÊ (`/stats`)

- `GET /api/v1/stats/dashboard`: Báo cáo doanh thu thực, số đơn theo trạng thái, cảnh báo tồn kho.
- `GET /api/v1/stats/settings`: Lấy cấu hình cửa hàng.
- `PUT /api/v1/stats/settings`: Cập nhật cấu hình cửa hàng, logo web/app, ảnh trưng bày.
