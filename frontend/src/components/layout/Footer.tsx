import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../context/StoreSettingsContext.js';

export const Footer: React.FC = () => {
  const { logoUrl, settings } = useStoreSettings();
  const address = settings.STORE_ADDRESS;
  const phone = settings.STORE_PHONE;
  const hours = settings.STORE_HOURS;

  return (
    <footer className="bg-brand-brown text-brand-cream mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <img src={logoUrl} alt="" width={40} height={40} loading="lazy" className="w-10 h-10 rounded-full object-cover bg-white" />
              <span className="text-xl font-extrabold text-white">BÁNH MÌ 0</span>
            </div>
            <p className="mt-4 text-sm text-brand-cream/70 max-w-xs leading-relaxed">
              Tròn vị mỗi ngày, nóng giòn từng ổ.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-brand-cream/80">
              {address && <li>{address}</li>}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white">{phone}</a>
                </li>
              )}
              {hours && <li>Mở cửa {hours}</li>}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Đặt bánh</h3>
            <ul className="space-y-2 text-sm text-brand-cream/80">
              <li><Link to="/menu" className="hover:text-white">Thực đơn</Link></li>
              <li><Link to="/tracking" className="hover:text-white">Tra cứu đơn hàng</Link></li>
              <li><Link to="/login" className="hover:text-white">Đăng nhập</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-brand-cream/15 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-brand-cream/60">
          <p>© {new Date().getFullYear()} BÁNH MÌ 0</p>
          <p>Thiết kế bởi Tristan.TeamA4</p>
        </div>
      </div>
    </footer>
  );
};
