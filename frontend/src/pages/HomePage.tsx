import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/customer/ProductCard.js';
import { useStoreSettings } from '../context/StoreSettingsContext.js';

const vnd = (value: string | undefined, fallback: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || fallback);

export const HomePage: React.FC = () => {
  const { showcaseUrl, conceptImageUrl, settings } = useStoreSettings();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getProducts({ featured: true })
      .then((data) => setFeatured(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const hasSecondImage = conceptImageUrl && conceptImageUrl !== showcaseUrl;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">
      {/* Giới thiệu */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-brand-brown">
            Tròn vị mỗi ngày, nóng giòn từng ổ
          </h1>
          <p className="mt-5 text-base sm:text-lg text-brand-brown/80 leading-relaxed max-w-md">
            Bánh mì Việt với pate, chả, xá xíu và rau thơm, gói trong hộp giấy kraft. Chọn món, đặt trên web, đến tiệm lấy hoặc nhận tại nhà.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/menu"
              className="px-7 py-3.5 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-semibold transition-colors"
            >
              Xem thực đơn
            </Link>
            <Link to="/tracking" className="font-semibold text-brand-brown underline underline-offset-4 decoration-brand-brown/30 hover:decoration-brand-red hover:text-brand-red">
              Tra cứu đơn hàng
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
            <div>
              <dt className="text-brand-brown/60">Giờ mở cửa</dt>
              <dd className="mt-0.5 font-semibold">{settings.STORE_HOURS || '06:00 - 21:00 hàng ngày'}</dd>
            </div>
            <div>
              <dt className="text-brand-brown/60">Phí giao hàng</dt>
              <dd className="mt-0.5 font-semibold">
                {vnd(settings.DELIVERY_BASE_FEE, 15000)}, miễn phí từ {vnd(settings.DELIVERY_FREE_THRESHOLD, 150000)}
              </dd>
            </div>
            <div>
              <dt className="text-brand-brown/60">Thanh toán</dt>
              <dd className="mt-0.5 font-semibold">Tiền mặt khi nhận hàng</dd>
            </div>
          </dl>
        </div>

        <img
          src={showcaseUrl}
          alt="Bánh mì và bao bì giấy kraft của BÁNH MÌ 0"
          width={800}
          height={600}
          className="w-full aspect-[4/3] object-cover rounded-2xl border border-brand-brown/10"
        />
      </section>

      {/* Món nổi bật */}
      {(isLoading || featured.length > 0) && (
        <section>
          <div className="flex items-baseline justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Món nổi bật</h2>
            <Link to="/menu" className="text-sm font-semibold text-brand-brown underline underline-offset-4 decoration-brand-brown/30 hover:text-brand-red hover:decoration-brand-red">
              Xem toàn bộ thực đơn
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-brand-brown/10"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 3).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Cách đặt */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">Cách đặt bánh</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Chọn món', desc: 'Thêm món vào giỏ và ghi chú nếu cần, ví dụ bớt ớt hoặc thêm ngò.' },
            { title: 'Chọn cách nhận', desc: 'Đến tiệm lấy hoặc giao tận nơi. Trả tiền mặt khi nhận hàng.' },
            { title: 'Theo dõi đơn', desc: 'Dùng mã đơn trong mục Tra cứu đơn hàng để xem đơn đang ở bước nào.' },
          ].map((s, i) => (
            <li key={s.title} className="border-t-2 border-brand-brown pt-4">
              <p className="font-bold">
                <span className="text-brand-red">{i + 1}.</span> {s.title}
              </p>
              <p className="mt-1.5 text-sm text-brand-brown/75 leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Về tiệm */}
      <section className={hasSecondImage ? 'grid grid-cols-1 md:grid-cols-2 gap-10 items-center' : 'max-w-xl'}>
        {hasSecondImage && (
          <img
            src={conceptImageUrl}
            alt="Quầy và bao bì của BÁNH MÌ 0"
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className="w-full aspect-[4/3] object-cover rounded-2xl border border-brand-brown/10"
          />
        )}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Vì sao tên là BÁNH MÌ 0</h2>
          <p className="mt-4 text-brand-brown/80 leading-relaxed">
            Tên tiệm đến từ con số 0 tròn trĩnh: trọn vẹn trong hương vị và không thỏa hiệp với chất lượng. Bếp nướng lại vỏ bánh trước khi đóng gói để bánh còn giòn khi đến tay bạn.
          </p>
        </div>
      </section>
    </div>
  );
};
