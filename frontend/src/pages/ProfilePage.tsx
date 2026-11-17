import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, Package, Clock, Shield, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api.getOrders()
      .then((data) => setOrders(data))
      .catch(console.error)
      .finally(() => setIsLoadingOrders(false));
  }, [user, navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await updateProfile({ full_name: fullName, phone, address });
    setIsUpdating(false);
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-brown/10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-brown font-sans">Tài Khoản Thành Viên</h1>
          <p className="text-xs text-gray-500">Quản lý thông tin giao nhận và theo dõi các đơn bánh mì đã đặt</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors w-fit"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Profile Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-warm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-brown text-brand-cream flex items-center justify-center font-black text-xl uppercase">
                {user?.full_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-brown">{user?.full_name}</h3>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red">
                  Vai trò: {user?.role}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-brown-light" />
                  <span>Họ và tên</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-brown-light" />
                  <span>Số điện thoại</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-brown-light" />
                  <span>Địa chỉ giao hàng</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 rounded-full bg-brand-brown hover:bg-brand-brown-dark text-white text-xs font-bold shadow-sm transition-all"
              >
                {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Orders History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-warm space-y-4">
            <h3 className="font-bold text-base text-brand-brown flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-red" />
              <span>Lịch Sử Đơn Bánh Mì Đã Đặt</span>
            </h3>

            {isLoadingOrders ? (
              <div className="p-8 text-center text-xs text-gray-400">Đang tải lịch sử đơn...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs space-y-3">
                <p>Bạn chưa có đơn đặt bánh mì nào.</p>
                <Link to="/menu" className="inline-block px-5 py-2 rounded-full bg-brand-red text-white font-bold">
                  Khám phá thực đơn ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-brand-cream/30 border border-brand-brown/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black font-mono text-brand-red">{ord.order_code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ord.created_at).toLocaleString('vi-VN')}</span>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <span className="font-black text-sm text-brand-brown">{formatVND(ord.total_amount)}</span>
                      <Link
                        to={`/tracking?code=${ord.order_code}`}
                        className="text-brand-red font-bold hover:underline text-[11px]"
                      >
                        Chi tiết đơn →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
