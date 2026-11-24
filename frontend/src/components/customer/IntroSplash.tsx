import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext.js';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { logoUrl } = useStoreSettings();

  useEffect(() => {
    // Automatically transition smoothly after 3 seconds
    const timer = setTimeout(() => {
      handleSkip();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-cream text-brand-brown px-4 transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/80 via-brand-cream to-brand-cream-dark opacity-90 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-lg text-center animate-fade-in">
        {/* Animated Brand Circular Badge */}
        <div className="relative mb-6">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-white border-4 border-brand-brown shadow-warm-lg flex items-center justify-center animate-pulse-glow">
            <img
              src={logoUrl}
              alt="Logo BÁNH MÌ 0"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute -bottom-2 -right-2 bg-brand-red text-white p-2.5 rounded-full shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-brown mb-2 font-sans">
          BÁNH MÌ <span className="text-brand-red">0</span>
        </h1>

        {/* Slogan */}
        <p className="text-sm sm:text-base font-bold tracking-widest text-brand-red uppercase mb-4">
          TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ
        </p>

        {/* Brief Story */}
        <p className="text-sm text-brand-brown/80 leading-relaxed mb-8 max-w-sm">
          Ẩm thực đường phố Việt Nam nâng tầm với nguyên liệu tươi chuẩn vị, vỏ bánh nướng giòn rụm và nước sốt độc quyền.
        </p>

        {/* Action Button & Skip */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-brown hover:bg-brand-brown-dark text-white font-bold text-sm shadow-warm hover:scale-105 transition-all"
          >
            <span>Khám Phá Cửa Hàng Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-brand-brown-light hover:text-brand-brown underline py-2 px-4"
          >
            Bỏ qua giới thiệu
          </button>
        </div>

        {/* Signature note */}
        <p className="mt-12 text-[11px] font-bold tracking-widest text-brand-brown/50 uppercase">
          DESIGN BY TRISTAN.TEAMA4
        </p>
      </div>
    </div>
  );
};
