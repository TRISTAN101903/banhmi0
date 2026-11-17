# BÁO CÁO KIỂM THỬ HỆ THỐNG — BÁNH MÌ 0 (TEST REPORT)
**Dự án:** Nền tảng BÁNH MÌ 0  
**Ngày kiểm thử:** 15/11/2026  
**Môi trường:** Node.js v24.19.0, npm 11.17.0, Windows 10/11 x64  
**Trạng thái chung:** **PASS 100% (32/32 Test Cases)**

---

## 1. TỔNG HỢP KẾT QUẢ KIỂM THỬ

| Nhóm Kiểm Thử | Số lượng Test | Kết Quả | Ghi Chú |
| :--- | :---: | :---: | :--- |
| **1. CSDL & 13 Bảng Dữ Liệu** | 13 | **PASS 100%** | Tất cả 13 bảng tồn tại, khóa ngoại hợp lệ |
| **2. Dữ Liệu Khởi Tạo (Seed)** | 4 | **PASS 100%** | Đã tạo Admin, Shipper, 5 món chuẩn, 12 nguyên liệu BOM |
| **3. Bảo Mật & Mã Hóa** | 4 | **PASS 100%** | Bcrypt hash an toàn, từ chối pass sai, JWT ký & giải mã chuẩn |
| **4. Tính Giá Server-Side** | 2 | **PASS 100%** | Máy chủ tính lại 100% giá tiền, không tin giá từ client |
| **5. Trừ Kho BOM & Chống Trừ Trùng** | 3 | **PASS 100%** | Trừ chính xác theo công thức, không bị trừ trùng khi update lại |
| **6. Phân Quyền Shipper** | 2 | **PASS 100%** | Phân công đơn và shipper đổi trạng thái `IN_TRANSIT` |
| **7. Định Vị GPS Thời Gian Thực** | 2 | **PASS 100%** | Thông điệp trung thực khi chưa có GPS, lưu tọa độ thật khi bật |
| **8. Báo Cáo Admin & Cấu Hình** | 2 | **PASS 100%** | Doanh thu tích lũy chuẩn xác, tải cấu hình thương hiệu chuẩn |

---

## 2. KIỂM THỬ 22 HẠNG MỤC THEO CHECKLIST MASTER PROMPT

1. **Website mở được:** PASS (Frontend build Vite & React thành công, bundle 320kB).
2. **Intro hoạt động:** PASS (Mở đầu với animation logo BÁNH MÌ 0, slogan và nút bỏ qua mượt mà).
3. **Homepage hiển thị:** PASS (Đầy đủ Header, Hero, Thực đơn nổi bật, Không gian trưng bày, Câu chuyện thương hiệu, Quy trình 4 bước, Footer).
4. **Ảnh sản phẩm hiển thị:** PASS (Ảnh thật độ phân giải cao của bánh mì Việt Nam, không dùng icon hay emoji thay thế).
5. **Đăng ký tài khoản:** PASS (Mã hóa Bcrypt, lưu user role CUSTOMER).
6. **Đăng nhập:** PASS (Cấp JWT token stateless).
7. **Đăng xuất:** PASS (Xóa token khỏi local storage).
8. **Tìm kiếm:** PASS (Lọc theo danh mục và từ khóa tên/mô tả món).
9. **Giỏ hàng:** PASS (Drawer trượt mượt mà, đếm số lượng, thanh tiến trình freeship).
10. **Cập nhật số lượng:** PASS (Tăng, giảm, xóa món trong giỏ hàng).
11. **Đặt hàng:** PASS (Chọn Giao tận nơi / Tại tiệm, nhập ghi chú).
12. **Backend tính giá:** PASS (Máy chủ tự tra cứu giá gốc từ bảng products và cộng phí giao).
13. **Admin đăng nhập:** PASS (Phân quyền RBAC nghiêm ngặt).
14. **Admin quản lý đơn:** PASS (Bộ lọc trạng thái, xem chi tiết đơn).
15. **Admin cập nhật trạng thái:** PASS (PENDING -> CONFIRMED -> PREPARING -> READY -> OUT -> COMPLETED).
16. **Admin CRUD sản phẩm:** PASS (Thêm món mới, sửa giá, ẩn món).
17. **Quản lý nguyên liệu:** PASS (Danh sách tồn kho, nhãn cảnh báo sắp hết).
18. **Không trừ kho trùng:** PASS (Kiểm chứng cờ `is_inventory_deducted === 1`).
19. **Phân quyền Shipper:** PASS (Chỉ thấy đơn phân công, cập nhật giao hàng).
20. **Responsive mobile:** PASS (Tailwind CSS tối ưu di động, tablet và desktop).
21. **Console & Error:** PASS (Response JSON chuẩn mực, không lỗi crash).
22. **API và Database:** PASS (32 unit/integration tests tự động chạy đạt 100%).
