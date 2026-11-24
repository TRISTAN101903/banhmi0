import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { StoreSettingsProvider } from './context/StoreSettingsContext.js';

import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/customer/CartDrawer.js';

import { HomePage } from './pages/HomePage.js';
import { MenuPage } from './pages/MenuPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

// Các trang ít dùng chỉ tải khi khách mở tới, giúp trang chủ nhẹ hơn
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.js').then((m) => ({ default: m.ProductDetailPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.js').then((m) => ({ default: m.CheckoutPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage.js').then((m) => ({ default: m.OrderTrackingPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage.js').then((m) => ({ default: m.ProfilePage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.js').then((m) => ({ default: m.AdminDashboard })));
const ShipperPortal = lazy(() => import('./pages/shipper/ShipperPortal.js').then((m) => ({ default: m.ShipperPortal })));

export const App: React.FC = () => {
  return (
    <StoreSettingsProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-brand-cream text-brand-brown">
                <Navbar />
                <CartDrawer />

                <main className="flex-1">
                  <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-sm text-brand-brown/60">Đang tải...</div>}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/menu" element={<MenuPage />} />
                      <Route path="/product/:id" element={<ProductDetailPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/tracking" element={<OrderTrackingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/shipper" element={<ShipperPortal />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </main>

                <Footer />
              </div>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </StoreSettingsProvider>
  );
};
