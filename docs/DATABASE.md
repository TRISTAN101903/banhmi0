# THIẾT KẾ CƠ SỞ DỮ LIỆU & QUẢN LÝ KHO (DATABASE & BOM DICTIONARY)
**Dự án:** Nền tảng BÁNH MÌ 0  
**Thương hiệu:** BÁNH MÌ 0  
**Slogan:** TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ  
**Design Signature:** DESIGN BY TRISTAN.TEAMA4  

---

## 1. TỔNG QUAN CSDL
Hệ thống sử dụng cơ sở dữ liệu quan hệ gồm **13 bảng** với ràng buộc khóa ngoại (Foreign Keys) nghiêm ngặt, cơ chế Transaction chống xung đột dữ liệu và hỗ trợ cả **SQLite** (phát triển cục bộ) lẫn **PostgreSQL** (triển khai production).

---

## 2. DANH MỤC CÁC BẢNG & MÔ TẢ CHI TIẾT

### 2.1. Bảng `roles` (Vai trò người dùng)
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID vai trò |
| `code` | TEXT | UNIQUE, NOT NULL | Mã vai trò: `ADMIN`, `STAFF`, `SHIPPER`, `CUSTOMER` |
| `name` | TEXT | NOT NULL | Tên hiển thị vai trò |
| `description`| TEXT | NULL | Mô tả quyền hạn |

### 2.2. Bảng `users` (Tài khoản người dùng)
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID người dùng |
| `role_id` | INTEGER | FK -> `roles.id` | Vai trò |
| `email` | TEXT | UNIQUE, NOT NULL | Email đăng nhập |
| `password_hash`| TEXT | NOT NULL | Mật khẩu mã hóa Bcrypt (Salt rounds = 10) |
| `full_name` | TEXT | NOT NULL | Họ và tên |
| `phone` | TEXT | NULL | Số điện thoại liên hệ |
| `address` | TEXT | NULL | Địa chỉ giao hàng mặc định |
| `created_at`| DATETIME | DEFAULT CURRENT_TIMESTAMP | Ngày tạo tài khoản |

### 2.3. Bảng `categories` (Danh mục món)
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID danh mục |
| `code` | TEXT | UNIQUE, NOT NULL | Mã: `TRADITIONAL`, `SIGNATURE`, `COMBO` |
| `name` | TEXT | NOT NULL | Tên danh mục |
| `description`| TEXT | NULL | Giới thiệu danh mục |
| `display_order`| INTEGER | DEFAULT 0 | Thứ tự hiển thị trên menu |
| `is_active` | INTEGER | DEFAULT 1 | Cờ kích hoạt (1: bật, 0: tắt) |

### 2.4. Bảng `products` (Sản phẩm bánh mì)
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID sản phẩm |
| `code` | TEXT | UNIQUE, NOT NULL | Mã SKU (ví dụ: `BM-DAC-BIET`, `BM-TRUNG`) |
| `category_id`| INTEGER | FK -> `categories.id`| Thuộc danh mục |
| `name` | TEXT | NOT NULL | Tên món |
| `description`| TEXT | NULL | Mô tả chi tiết món ăn |
| `ingredients_text`| TEXT | NULL | Danh sách thành phần hiển thị khách xem |
| `price` | REAL | NOT NULL | Giá bán niêm yết (VNĐ) |
| `image_url` | TEXT | NULL | Link ảnh món bánh mì |
| `is_available`| INTEGER | DEFAULT 1 | Trạng thái còn hàng (1: còn, 0: hết) |
| `is_featured`| INTEGER | DEFAULT 0 | Món bán chạy/nổi bật (1: có, 0: không) |
| `is_active` | INTEGER | DEFAULT 1 | Cờ hiển thị thực đơn |

### 2.5. Bảng `ingredients` (Kho nguyên vật liệu)
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID nguyên liệu |
| `code` | TEXT | UNIQUE, NOT NULL | Mã nguyên liệu (ví dụ: `ING-VO-BANH`) |
| `name` | TEXT | NOT NULL | Tên nguyên liệu (Vỏ bánh, Chả, Xá xíu...) |
| `unit` | TEXT | NOT NULL | Đơn vị tính (ổ, kg, lít, quả, cái...) |
| `current_stock`| REAL | NOT NULL | Số lượng tồn kho thực tế |
| `warning_threshold`| REAL | DEFAULT 10 | Ngưỡng báo động sắp hết |
| `cost_price` | REAL | DEFAULT 0 | Giá vốn nhập kho tham khảo |

### 2.6. Bảng `recipe_items` (Định mức nguyên liệu - BOM)
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID định mức |
| `product_id` | INTEGER | FK -> `products.id` | Sản phẩm |
| `ingredient_id`| INTEGER | FK -> `ingredients.id`| Nguyên liệu cần dùng |
| `required_quantity`| REAL | NOT NULL | Định lượng cần cho 1 ổ bánh mì |

### 2.7. Bảng `orders` (Đơn hàng)
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID đơn |
| `order_code` | TEXT | UNIQUE, NOT NULL | Mã đơn khách hàng (ví dụ: `BM0-261115-A1B2`) |
| `user_id` | INTEGER | FK -> `users.id`, NULL | ID khách đặt (hoặc null nếu khách vãng lai) |
| `customer_name`| TEXT | NOT NULL | Tên người nhận |
| `customer_phone`| TEXT | NOT NULL | Số điện thoại |
| `delivery_address`| TEXT | NULL | Địa chỉ nhận bánh |
| `fulfillment_type`| TEXT | NOT NULL | `DELIVERY` (Giao tận nơi) hoặc `PICKUP` (Tại tiệm) |
| `subtotal` | REAL | NOT NULL | Tổng tiền món (máy chủ tự tính) |
| `delivery_fee`| REAL | DEFAULT 0 | Phí giao hàng (tính theo chính sách) |
| `total_amount`| REAL | NOT NULL | Tổng thanh toán = subtotal + fee |
| `status` | TEXT | DEFAULT 'PENDING' | Trạng thái: PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP, OUT_FOR_DELIVERY, COMPLETED, CANCELLED |
| `is_inventory_deducted`| INTEGER | DEFAULT 0 | Cờ trừ kho an toàn (0: chưa trừ, 1: đã trừ) |

### 2.8. Bảng `order_items` (Chi tiết món & Snapshot giá)
Lưu snapshot tên và giá tại thời điểm đặt để ngăn sai lệch giá lịch sử:
| Trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PK, Auto | ID dòng |
| `order_id` | INTEGER | FK -> `orders.id` | Đơn hàng |
| `product_id` | INTEGER | FK -> `products.id` | Mã món |
| `product_name`| TEXT | NOT NULL | Snapshot tên món lúc đặt |
| `unit_price` | REAL | NOT NULL | Snapshot giá bán lúc đặt |
| `quantity` | INTEGER | NOT NULL | Số lượng |
| `subtotal` | REAL | NOT NULL | Thành tiền |

### 2.9. Bảng `inventory_movements` (Lịch sử biến động kho)
Ghi nhận toàn bộ vết xuất nhập kho, liên kết với order_id khi đơn trừ kho:
`movement_type`: `IN` (Nhập kho), `OUT` (Xuất kho chế biến), `ADJUST` (Điều chỉnh kiểm kê).

### 2.10. Bảng `delivery_assignments` & `delivery_locations`
- `delivery_assignments`: Gán đơn cho `shipper_id`, cập nhật trạng thái `ASSIGNED`, `IN_TRANSIT`, `DELIVERED`, `FAILED`.
- `delivery_locations`: Tọa độ `latitude`, `longitude` thật từ thiết bị của shipper, có thời gian `recorded_at`.

### 2.11. Bảng `settings`
Lưu trữ cấu hình động:
- `STORE_NAME`, `STORE_SLOGAN`, `STORE_PHONE`, `STORE_ADDRESS`
- `DELIVERY_BASE_FEE`, `DELIVERY_FREE_THRESHOLD`
- `STORE_LOGO_URL`, `STORE_SHOWCASE_URL`
