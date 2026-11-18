import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, ShieldCheck, Clock, Award, ChevronRight } from 'lucide-react';
import { api } from '../services/api.js';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/customer/ProductCard.js';
import { useStoreSettings } from '../context/StoreSettingsContext.js';

export const HomePage: React.FC = () => {
  const { logoUrl, showcaseUrl, conceptImageUrl } = useStoreSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getProducts({ featured: true })
      .then((data) => setFeaturedProducts(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pb-24 lg:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red-light border border-brand-red/20 text-brand-red text-xs font-bold uppercase tracking-wider animate-fade-in">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thương Hiệu Bánh Mì Việt Thượng Hạng</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-brown tracking-tight leading-[1.1] font-sans">
                TRÒN VỊ MỖI NGÀY <br />
                <span className="text-brand-red">NÓNG GIÒN TỪNG Ổ</span>
              </h1>

              <p className="text-base sm:text-lg text-brand-brown/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                BÁNH MÌ 0 mang đến trải nghiệm bánh mì Việt Nam chuẩn vị truyền thống kết hợp quy chuẩn vận hành hiện đại. Vỏ bánh giòn rụm nướng nóng liên tục, pate gan bùi béo và nước sốt bí truyền khó quên.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-bold text-base shadow-warm hover:shadow-warm-lg transition-all hover:scale-102"
                >
                  <Flame className="w-5 h-5 fill-white" />
                  <span>Đặt Bánh Ngay Bây Giờ</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/tracking"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-brand-ivory text-brand-brown font-bold text-base border border-brand-brown/20 transition-all"
                >
                  <span>Tra Cứu Tiến Trình Đơn</span>
                </Link>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-brown/10 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-brand-brown">15 Phút</p>
                  <p className="text-xs text-brand-brown/70 font-medium">Mẻ bánh mới nướng</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-brand-red">100%</p>
                  <p className="text-xs text-brand-brown/70 font-medium">Nguyên liệu tươi sạch</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-brand-green">Tròn Vị</p>
                  <p className="text-xs text-brand-brown/70 font-medium">Sốt bí truyền BÁNH MÌ 0</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative blob */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-brand-red/20 to-brand-green/20 rounded-3xl blur-2xl -z-10"></div>

                <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-warm-lg border border-brand-brown/10 overflow-hidden transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img
                    src={showcaseUrl}
                    alt="Không Gian Trưng Bày BÁNH MÌ 0"
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red">Không Gian & Trưng Bày</span>
                      <h3 className="font-bold text-lg text-brand-brown">BÁNH MÌ 0 Store & Packaging</h3>
                      <p className="text-xs text-gray-500">Bao bì kraft cao cấp, món ăn chuẩn vị</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-green bg-brand-green-light px-2.5 py-1 rounded-full">
                        Chuẩn Vị 100%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-6 -left-6 sm:left-4 bg-brand-brown text-brand-cream p-2 pr-5 rounded-2xl shadow-warm border border-brand-brown-light/40 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-brand-brown">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Nóng giòn trao tay</p>
                    <p className="text-[11px] text-brand-cream/70">Đóng gói hộp kraft cao cấp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase tracking-widest mb-1.5">
              <Flame className="w-4 h-4" />
              <span>Thực Đơn Được Yêu Thích</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-brown font-sans">
              Món Bánh Mì Nổi Bật Hôm Nay
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-brown hover:text-brand-red transition-colors"
          >
            <span>Xem tất cả thực đơn</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-brand-brown/10 p-4"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 3).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* ORDER PROCESS (4 STEPS) */}
      <section className="bg-white border-y border-brand-brown/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-brand-red text-xs font-bold uppercase tracking-widest">Đơn Giản & Tiện Lợi</span>
            <h2 className="text-3xl font-black text-brand-brown mt-1">4 Bước Thưởng Thức Bánh Mì Nóng Giòn</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Chọn Ổ Bánh Yêu Thích', desc: 'Lựa chọn bánh mì trứng, chả, thịt nướng xá xíu hoặc combo nước dinh dưỡng.' },
              { step: '02', title: 'Tùy Chọn Nhân & Ghi Chú', desc: 'Thêm bớt ớt, ngò gai, đồ chua theo sở thích cá nhân của bạn.' },
              { step: '03', title: 'Nướng Giòn Liền Tay', desc: 'Bếp BÁNH MÌ 0 nướng lại vỏ bánh giòn rụm trước khi đóng gói kraft.' },
              { step: '04', title: 'Giao Nhanh Tận Cửa', desc: 'Shipper chuyên trách giao nhanh nóng hổi đến tay bạn hoặc lấy ngay tại tiệm.' },
            ].map((st, i) => (
              <div key={i} className="p-6 rounded-2xl bg-brand-cream/50 border border-brand-brown/10 relative">
                <span className="text-4xl font-black text-brand-red/20 absolute top-4 right-4">{st.step}</span>
                <div className="w-10 h-10 rounded-xl bg-brand-brown text-white flex items-center justify-center font-bold text-sm mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-base text-brand-brown mb-2">{st.title}</h3>
                <p className="text-xs text-brand-brown/70 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORE SHOWCASE & PACKAGING DISPLAY (IMAGE 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-brand-brown/10 p-8 sm:p-12 shadow-warm overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold text-brand-red uppercase tracking-widest">Không Gian & Nhận Diện Thương Hiệu</span>
            <h2 className="text-3xl font-black text-brand-brown">Trưng Bày Tiệm & Bao Bì BÁNH MÌ 0</h2>
            <p className="text-xs sm:text-sm text-brand-brown/70">
              Trải nghiệm đồng bộ từ quầy gọi món tại tiệm, ứng dụng số đặt bánh mì đến bao bì giấy kraft bảo vệ môi trường và giữ trọn hương vị nóng giòn.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-brand-brown/15 shadow-warm-lg group relative">
            <img
              src={conceptImageUrl}
              alt="Trưng bày cửa hàng BÁNH MÌ 0"
              className="w-full h-[320px] sm:h-[480px] lg:h-[540px] object-cover transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6 sm:p-10">
              <div className="text-white space-y-2">
                <span className="text-xs font-bold px-3 py-1 bg-brand-red rounded-full text-white uppercase tracking-wider">
                  BÁNH MÌ 0 Concept Store
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-sans">
                  TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ
                </h3>
                <p className="text-xs sm:text-sm text-brand-cream/80 max-w-xl">
                  Bao gồm túi xách giấy kraft, hộp takeaway có cửa sổ kính, giấy gói chuyên dụng giữ nhiệt, khay rau thơm tươi xanh và hệ thống đặt món QR thông minh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STORY & PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-brand-brown to-brand-brown-dark rounded-3xl p-8 sm:p-14 text-white shadow-warm-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-brand-cream text-xs font-semibold tracking-wider uppercase">
                Câu Chuyện BÁNH MÌ 0
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Gìn Giữ Hồn Vị Bánh Mì Việt – Chuẩn Phong Vị Đương Đại
              </h2>
              <p className="text-sm text-brand-cream/80 leading-relaxed">
                Tên gọi <strong className="text-white">BÁNH MÌ 0</strong> khởi nguồn từ triết lý số 0 tròn trĩnh: sự trọn vẹn trong hương vị, không thỏa hiệp với chất lượng, và mở ra một chuẩn mực mới cho ẩm thực đường phố Việt Nam.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-brand-cream/90">
                  <ShieldCheck className="w-4 h-4 text-brand-green" />
                  <span>An toàn vệ sinh chuẩn F&B</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-cream/90">
                  <Clock className="w-4 h-4 text-brand-green" />
                  <span>Nướng mẻ mới mỗi 15 phút</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-brand-cream/90">
                  <Award className="w-4 h-4 text-brand-green" />
                  <span>Bao bì giấy kraft thân thiện</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="bg-brand-cream/10 p-6 rounded-2xl border border-white/15 max-w-sm text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-brand-cream border-2 border-brand-brown flex items-center justify-center text-brand-brown font-black text-2xl">
                  BM0
                </div>
                <p className="text-sm font-bold tracking-widest text-brand-red-light uppercase">
                  TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ
                </p>
                <p className="text-xs text-brand-cream/70 italic">
                  "Mỗi ổ bánh trao tay là một tâm huyết trọn vẹn dành cho thực khách."
                </p>
                <div className="pt-2 text-[10px] font-bold text-white/60 tracking-wider">
                  DESIGN BY TRISTAN.TEAMA4
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
