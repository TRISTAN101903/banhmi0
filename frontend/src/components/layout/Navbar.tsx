import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, Menu, X, Shield, Truck, LogOut, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useStoreSettings } from '../../context/StoreSettingsContext.js';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, isShipper } = useAuth();
  const { logoUrl } = useStoreSettings();
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-brand-cream/95 backdrop-blur-md border-b border-brand-brown/10 shadow-sm transition-all">
      {/* Top Banner */}
      <div className="bg-brand-brown text-brand-cream text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
        <span>TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ</span>
        <span className="hidden md:inline opacity-60">|</span>
        <span className="hidden md:inline opacity-80 text-[11px]">DESIGN BY TRISTAN.TEAMA4</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-brown flex items-center justify-center shadow-warm transition-transform group-hover:scale-105 bg-white shrink-0">
              <img
                src={logoUrl}
                alt="Logo BÁNH MÌ 0"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-brand-brown font-sans">BÁNH MÌ</span>
                <span className="text-2xl font-black text-brand-red">0</span>
              </div>
              <p className="text-[10px] text-brand-brown-light font-medium tracking-widest uppercase">Tròn Vị Mỗi Ngày</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-brand-brown hover:text-brand-red transition-colors">
              Trang Chủ
            </Link>
            <Link to="/menu" className="text-sm font-semibold text-brand-brown hover:text-brand-red transition-colors">
              Thực Đơn
            </Link>
            <Link to="/tracking" className="text-sm font-semibold text-brand-brown hover:text-brand-red transition-colors flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-brand-red" />
              <span>Tra Cứu Đơn</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-brand-ivory hover:bg-brand-cream-dark text-brand-brown border border-brand-brown/20 transition-all shadow-sm hover:scale-105"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 text-brand-brown" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-brand-ivory border border-brand-brown/15 hover:border-brand-brown/30 text-sm font-semibold text-brand-brown transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-brown text-brand-cream flex items-center justify-center text-xs font-bold uppercase">
                    {user.full_name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.full_name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-warm-lg border border-brand-brown/10 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500">Tài khoản</p>
                      <p className="text-sm font-bold text-brand-brown truncate">{user.full_name}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-brown hover:bg-brand-cream font-medium transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-brand-brown-light" />
                      <span>Hồ sơ & Đơn mua</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-red hover:bg-brand-red-light font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Trang Quản Trị</span>
                      </Link>
                    )}

                    {isShipper && (
                      <Link
                        to="/shipper"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-green hover:bg-brand-green-light font-medium transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Khu Vực Shipper</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full bg-brand-brown text-white hover:bg-brand-brown-dark transition-all shadow-sm hover:scale-102"
              >
                Đăng Nhập
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-brand-brown hover:bg-brand-ivory transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-brand-brown/10 bg-brand-cream animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-semibold text-brand-brown hover:bg-brand-ivory rounded-xl"
              >
                Trang Chủ
              </Link>
              <Link
                to="/menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-semibold text-brand-brown hover:bg-brand-ivory rounded-xl"
              >
                Thực Đơn Đầy Đủ
              </Link>
              <Link
                to="/tracking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-semibold text-brand-brown hover:bg-brand-ivory rounded-xl flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-brand-red" />
                <span>Tra Cứu Đơn Hàng</span>
              </Link>

              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-brand-red text-white font-bold text-sm"
                >
                  Đăng Nhập / Đăng Ký
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
