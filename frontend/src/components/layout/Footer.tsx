import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Heart, ShieldCheck } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext.js';

export const Footer: React.FC = () => {
  const { logoUrl } = useStoreSettings();
  return (
    <footer className="bg-brand-brown text-brand-cream border-t border-brand-brown-dark/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-brand-cream/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-brown bg-white flex items-center justify-center shrink-0">
                <img
                  src={logoUrl}
                  alt="Logo BÁNH MÌ 0"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans">BÁNH MÌ <span className="text-brand-red">0</span></span>
            </div>
            <p className="text-xs uppercase tracking-widest text-brand-red-light font-bold">
              TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ
            </p>
            <p className="text-sm text-brand-cream/70 leading-relaxed">
              Trải nghiệm bánh mì Việt Nam phong vị nguyên bản, từng ổ bánh nướng nóng giòn kết hợp nhân xá xíu, chả lụa hảo hạng và sốt bơ trứng độc quyền.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cream/10 text-[11px] font-bold text-brand-cream/90 border border-brand-cream/20">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                100% Nguyên liệu tươi sạch mỗi ngày
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-4">Khám Phá</h3>
            <ul className="space-y-2.5 text-sm text-brand-cream/80">
              <li>
                <Link to="/" className="hover:text-brand-red transition-colors">Trang chủ thương hiệu</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-brand-red transition-colors">Thực đơn bánh mì nóng</Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-brand-red transition-colors">Theo dõi tiến trình đơn hàng</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-brand-red transition-colors">Khu vực quản trị Admin</Link>
              </li>
              <li>
                <Link to="/shipper" className="hover:text-brand-red transition-colors">Giao diện điều phối Shipper</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-4">Liên Hệ Đặt Hàng</h3>
            <ul className="space-y-3 text-sm text-brand-cream/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>123 Đường Bánh Mì, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-red shrink-0" />
                <span className="font-semibold text-white">0987 654 321</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-red shrink-0" />
                <span>06:00 – 21:00 (Thứ 2 – Chủ Nhật)</span>
              </li>
            </ul>
          </div>

          {/* Policies & Safety Note */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-4">Tiêu Chuẩn Vận Hành</h3>
            <p className="text-xs text-brand-cream/70 leading-relaxed mb-3">
              Quy trình chế biến bánh mì và đóng gói tuân thủ nghiêm ngặt vệ sinh an toàn thực phẩm. Bao bì giấy kraft bảo vệ môi trường và giữ trọn độ nóng giòn.
            </p>
            <div className="bg-brand-brown-dark/60 p-3 rounded-xl border border-brand-cream/10 text-xs text-brand-cream/80">
              <p className="font-semibold text-white mb-1">Cam kết BÁNH MÌ 0:</p>
              <p>Nướng bánh liên tục trong ngày – Tuyệt đối không phục vụ bánh cũ nguội.</p>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Design Signature */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-cream/60">
          <p>© {new Date().getFullYear()} BÁNH MÌ 0. Giữ toàn bộ bản quyền thương hiệu.</p>
          <div className="flex items-center gap-1.5 font-bold tracking-widest text-brand-red-light bg-brand-cream/10 px-4 py-1.5 rounded-full border border-brand-cream/15">
            <Heart className="w-3.5 h-3.5 text-brand-red fill-brand-red" />
            <span>DESIGN BY TRISTAN.TEAMA4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
