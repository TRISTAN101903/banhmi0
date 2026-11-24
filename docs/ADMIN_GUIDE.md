# HƯỚNG DẪN QUẢN TRỊ & ĐIỀU HÀNH — BÁNH MÌ 0
*Dành cho Quản Trị Viên (Admin) và Nhân Viên Giao Hàng (Shipper)*

---

## 1. ĐĂNG NHẬP QUẢN TRỊ
- **Đường dẫn:** Bấm vào nút **"Admin"** trên thanh điều hướng hoặc truy cập `/admin`.
- **Tài khoản mặc định:**
  - Email: `admin@banhmi0.vn`
  - Mật khẩu: `<mật khẩu bạn đặt qua ADMIN_BOOTSTRAP_PASSWORD>`

---

## 2. QUẢN LÝ ĐƠN HÀNG & PHÂN CÔNG SHIPPER
1. **Duyệt Đơn & Trừ Kho Tự Động:**
   - Khi có đơn mới ở trạng thái `PENDING`, chọn đổi sang `CONFIRMED`.
   - **Hệ thống tự động kích hoạt trừ kho** các nguyên liệu (vỏ bánh, chả, pate, xá xíu, đồ chua, bao bì kraft) theo đúng công thức định lượng BOM của món đó.
   - Cơ chế cờ `is_inventory_deducted` bảo vệ chống trừ trùng nếu trạng thái đơn được cập nhật lại.
2. **Phân Công Shipper:**
   - Tại cột **"Shipper"**, chọn nhân viên giao hàng từ danh sách thả xuống để điều phối đơn cho shipper đó.

---

## 3. CẬP NHẬT ẢNH ĐẠI DIỆN WEB / APP & TRƯNG BÀY TIỆM
1. Trong Admin Dashboard, chuyển sang tab **"Ảnh Đại Diện Web / App & Trưng Bày"**.
2. **Cập nhật Logo Web / App:**
   - Xem trước ảnh đại diện hiện tại.
   - Nhập đường dẫn URL mới hoặc bấm **"Chọn file ảnh Logo để tải lên"** trực tiếp từ máy tính.
3. **Cập nhật Ảnh Trưng Bày Tiệm (Showcase Banner):**
   - Xem trước ảnh trưng bày quầy bán, khay nguyên liệu và bao bì.
   - Tải file ảnh banner trưng bày mới hoặc nhập URL.
4. Bấm **"Lưu & Áp Dụng Nhận Diện Thương Hiệu"** để cập nhật toàn hệ thống!

---

## 4. QUẢN LÝ KHO & ĐIỀU CHỈNH TỒN THỰC TẾ
1. Vào tab **"Kho & Nguyên Liệu"** để theo dõi số lượng tồn kho từng loại.
2. Các mặt hàng có tồn kho nhỏ hơn ngưỡng cảnh báo sẽ hiển thị nhãn đỏ **"Sắp hết hàng!"**.
3. Bấm **"Nhập/Xuất Kho"** để:
   - Nhập kho bổ sung (`IN`)
   - Xuất kho hao hụt (`OUT`)
   - Cập nhật số lượng kiểm kê thực tế (`ADJUST`)
   - *Bắt buộc nhập lý do điều chỉnh để lưu vết vào Nhật ký Biến Động Kho (Audit Log).*

---

## 5. DÀNH CHO SHIPPER (CỔNG ĐIỀU PHỐI)
1. **Đăng nhập:** Email: `shipper@banhmi0.vn` / Mật khẩu: `<chỉ có khi SEED_DEMO_ACCOUNTS=true ở môi trường dev>` hoặc truy cập `/shipper`.
2. **Xem danh sách đơn:** Shipper chỉ xem thấy những đơn được Admin phân công cho mình.
3. **Cập nhật trạng thái:**
   - Bấm **"Bắt đầu đi giao"** -> chuyển sang `IN_TRANSIT`.
   - Bấm **"Đã giao thành công"** -> chuyển sang `DELIVERED` (Đơn hoàn tất, ghi nhận doanh thu).
   - Bấm **"Báo giao hỏng/hủy"** -> chuyển sang `FAILED`.
4. **Chia sẻ GPS:**
   - Bấm nút **"Bật chia sẻ GPS trực tiếp"** để gửi tọa độ thực tế lên hệ thống cho khách theo dõi.
   - Có thể chủ động bấm dừng bất kỳ lúc nào để bảo vệ quyền riêng tư.
