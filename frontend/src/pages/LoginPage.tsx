import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-brand-brown mx-auto flex items-center justify-center shadow-warm bg-white">
          <img
            src="/logo_banhmi0.jpg"
            alt="Logo BÁNH MÌ 0"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-black text-brand-brown font-sans">Đăng Nhập Tài Khoản</h1>
        <p className="text-xs text-gray-500">Hệ thống thành viên & điều hành BÁNH MÌ 0</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-brand-brown/10 shadow-warm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-brown-light" />
              <span>Email</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@banhmi0.vn hoặc email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-brown-light" />
              <span>Mật khẩu</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập mật khẩu"
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-brand-brown hover:bg-brand-brown-dark text-white font-bold text-xs shadow-warm transition-all"
          >
            {isSubmitting ? 'Đang xác thực...' : 'Đăng Nhập'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-brand-red hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
