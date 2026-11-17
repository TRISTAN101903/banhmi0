import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register({
      full_name: fullName,
      email,
      phone,
      address,
      password,
    });
    setIsSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-brand-brown font-sans">Tạo Tài Khoản Khách Hàng</h1>
        <p className="text-xs text-gray-500">Trở thành thành viên BÁNH MÌ 0 để nhận nhiều ưu đãi</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-brand-brown/10 shadow-warm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-brown-light" />
              <span>Họ và tên *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn An"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-brown-light" />
              <span>Email *</span>
            </label>
            <input
              type="email"
              required
              placeholder="an.nguyen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-brown-light" />
              <span>Số điện thoại</span>
            </label>
            <input
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-brown-light" />
              <span>Địa chỉ giao hàng mặc định</span>
            </label>
            <input
              type="text"
              placeholder="Địa chỉ giao hàng"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-brown-light" />
              <span>Mật khẩu (tối thiểu 6 ký tự) *</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Nhập mật khẩu an toàn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-brown p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs shadow-warm transition-all"
          >
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng Ký Thành Viên'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-brand-brown hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
