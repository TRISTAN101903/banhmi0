import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';

// Layout & Common Components
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/customer/CartDrawer.js';
import { IntroSplash } from './components/customer/IntroSplash.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { MenuPage } from './pages/MenuPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { ShipperPortal } from './pages/shipper/ShipperPortal.js';

export const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro on first session visit
    return sessionStorage.getItem('bm0_intro_viewed') !== 'true';
  });

  const handleCompleteIntro = () => {
    sessionStorage.setItem('bm0_intro_viewed', 'true');
    setShowIntro(false);
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            {showIntro && <IntroSplash onComplete={handleCompleteIntro} />}

            <div className="min-h-screen flex flex-col bg-brand-cream text-brand-brown">
              <Navbar />
              <CartDrawer />

              <main className="flex-1">
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
              </main>

              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};
