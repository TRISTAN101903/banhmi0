# BÁO CÁO ĐÓNG GÓP HỌC SINH & GIẢI THÍCH CÔNG NGHỆ
**Dự án:** BÁNH MÌ 0 — Nền tảng Thương Mại Điện Tử & Vận Hành F&B Chuẩn Hóa  
**Tác giả:** Đội ngũ phát triển học sinh (DESIGN BY TRISTAN.TEAMA4)

---

## 1. MỤC TIÊU DỰ ÁN VÀ Ý TƯỞNG ĐỔI MỚI
BÁNH MÌ 0 xuất phát từ niềm đam mê gìn giữ và lan tỏa ẩm thực đường phố Việt Nam, kết hợp với công nghệ số hiện đại để giải quyết bài toán vận hành thực tế của một cửa hàng F&B:
- **Tính toán giá an toàn (Server-side):** Không tin cậy dữ liệu giá gửi từ trình duyệt người dùng, bảo vệ doanh thu cửa hàng khỏi các hình thức gian lận web.
- **Quản lý nguyên liệu định lượng (Bill of Materials - BOM):** Khắc phục vấn đề thất thoát nguyên liệu thường gặp ở các tiệm ăn truyền thống bằng cách tự động trừ kho nguyên liệu (vỏ bánh, chả, thịt, pate, rau) mỗi khi đơn hàng được duyệt.
- **Cơ chế chống trừ trùng lặp (Single-Deduction):** Ứng dụng Transaction trong Cơ sở dữ liệu và cờ kiểm soát trạng thái để đảm bảo mỗi ổ bánh chỉ bị trừ kho đúng 1 lần.
- **Trải nghiệm đặt món số hóa:** Đặt bánh mì online, tùy chọn nhân bánh không ớt/nhiều ngò, theo dõi tiến trình 5 bước và nhận diện thương hiệu chuyên nghiệp.

---

## 2. VAI TRÒ CỦA CÁC THÀNH PHẦN KỸ THUẬT
- **Frontend (Giao diện người dùng):** 
  - Xây dựng bằng React + Vite + TypeScript.
  - Áp dụng Tailwind CSS theo bảng màu ẩm thực: Kem bánh mì, Nâu nướng giòn, Đỏ thương hiệu và Xanh rau thơm.
  - Hỗ trợ tiếng Việt 100% với font `Be Vietnam Pro`.
- **Backend (Máy chủ xử lý):**
  - Xây dựng bằng Node.js và Express.js theo kiến trúc RESTful API.
  - Bảo mật bằng mã hóa mật khẩu Bcrypt và cấp mã xác thực JWT stateless.
- **Database (Cơ sở dữ liệu):**
  - Thiết kế 13 bảng dữ liệu với quan hệ chặt chẽ giữa Khách hàng, Đơn hàng, Món ăn, Nguyên liệu và Chuyến giao hàng của Shipper.

---

## 3. ĐIỂM ĐỔI MỚI & TIỀM NĂNG PHÁT TRIỂN
- Hệ thống sẵn sàng mở rộng thêm tính năng thanh toán QR ngân hàng tự động (VietQR).
- Sẵn sàng tích hợp máy in hóa đơn nhiệt quầy thu ngân qua cổng mạng nội bộ.
- Có khả năng nâng cấp thêm module phân tích dự báo lượng nguyên liệu cần nhập dựa trên lịch sử bán hàng.

*Lưu ý đạo đức & an toàn thực phẩm:* Mọi hoạt động chế biến và bán bánh mì thực tế đều cần sự giám sát của người lớn/thầy cô giáo hướng dẫn và tuân thủ tuyệt đối quy định an toàn vệ sinh thực phẩm của Bộ Y Tế.
