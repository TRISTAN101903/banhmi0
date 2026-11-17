import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: { email: string; password: string; full_name: string; phone?: string; address?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (payload: { full_name: string; phone?: string; address?: string }) => Promise<boolean>;
  isAdmin: boolean;
  isStaff: boolean;
  isShipper: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('bm0_token');
    const savedUser = localStorage.getItem('bm0_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bm0_token');
        localStorage.removeItem('bm0_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập không thành công');
      }

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('bm0_token', data.data.token);
      localStorage.setItem('bm0_user', JSON.stringify(data.data.user));
      showToast(`Xin chào, ${data.data.user.full_name}!`, 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Lỗi đăng nhập', 'error');
      return false;
    }
  };

  const register = async (payload: { email: string; password: string; full_name: string; phone?: string; address?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đăng ký không thành công');
      }

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('bm0_token', data.data.token);
      localStorage.setItem('bm0_user', JSON.stringify(data.data.user));
      showToast('Đăng ký tài khoản BÁNH MÌ 0 thành công!', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Lỗi tạo tài khoản', 'error');
      return false;
    }
  };

  const updateProfile = async (payload: { full_name: string; phone?: string; address?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật');

      setUser(data.data);
      localStorage.setItem('bm0_user', JSON.stringify(data.data));
      showToast('Cập nhật thông tin thành công!', 'success');
      return true;
    } catch (error: any) {
      showToast(error.message || 'Không thể cập nhật hồ sơ', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bm0_token');
    localStorage.removeItem('bm0_user');
    showToast('Đã đăng xuất khỏi hệ thống BÁNH MÌ 0', 'info');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';
  const isShipper = user?.role === 'SHIPPER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin,
        isStaff,
        isShipper,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
