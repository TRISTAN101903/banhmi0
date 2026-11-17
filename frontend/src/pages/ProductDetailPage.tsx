import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingBag, ShieldCheck, Clock, Flame, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.getProductById(id)
        .then((data) => setProduct(data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-brand-brown">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-gray-500">Món bánh mì này có thể đã được cập nhật hoặc không khả dụng.</p>
        <Link to="/menu" className="inline-block px-6 py-2.5 rounded-full bg-brand-brown text-white text-xs font-bold">
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-brand-brown hover:text-brand-red transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại thực đơn</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-4 border border-brand-brown/10 shadow-warm overflow-hidden">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-brand-ivory relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.is_featured === 1 && (
                <div className="absolute top-4 left-4 bg-brand-red text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  <span>Bán Chạy Nhất</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-brand-red uppercase tracking-wider">
                {product.category_name || 'BÁNH MÌ 0'}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-mono font-medium text-gray-400">Mã: {product.code}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-brown font-sans leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="text-3xl font-black text-brand-red font-sans">
            {formatVND(product.price)}
          </div>

          <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-brown/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown mb-1.5">Mô tả món ăn:</h4>
            <p className="text-sm text-brand-brown/80 leading-relaxed">
              {product.description}
            </p>
          </div>

          {product.ingredients_text && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                <span>Thành phần & Topping chính:</span>
              </h4>
              <p className="text-xs text-brand-brown/70 leading-relaxed bg-white p-3 rounded-xl border border-brand-brown/10">
                {product.ingredients_text}
              </p>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="pt-4 border-t border-brand-brown/10 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-brand-brown">Số lượng:</span>
              <div className="flex items-center bg-white rounded-full border border-brand-brown/20 px-3 py-1.5 shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-gray-500 hover:text-brand-brown"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-brand-brown">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1 text-gray-500 hover:text-brand-brown"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm font-bold text-brand-brown ml-auto">
                Tổng: <span className="text-brand-red font-black text-lg">{formatVND(product.price * quantity)}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-bold text-sm shadow-warm hover:shadow-warm-lg transition-all active:scale-98"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Thêm Vào Giỏ Hàng</span>
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-brand-brown/70">
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-brand-brown/10">
              <Clock className="w-4 h-4 text-brand-green shrink-0" />
              <span>Nướng nóng giòn theo đơn</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-brand-brown/10">
              <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
              <span>Bao bì giấy kraft vệ sinh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
