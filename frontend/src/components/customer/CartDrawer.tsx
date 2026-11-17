import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';

export const CartDrawer: React.FC = () => {
  const { items, removeItem, updateQuantity, isCartOpen, setIsCartOpen, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 150000;
  const progressToFreeShip = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-brand-brown/10">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-brand-cream/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-brown text-white rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-brand-brown">Giỏ Hàng Của Bạn</h2>
                <p className="text-xs text-brand-brown/70">{totalItems} món đã chọn</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-brand-brown hover:bg-brand-ivory transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Alert Bar */}
          <div className="bg-brand-ivory px-6 py-3 border-b border-brand-brown/10 text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium text-brand-brown">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-green" />
                {remainingForFreeShip > 0 ? (
                  <>Mua thêm <strong className="text-brand-red">{formatVND(remainingForFreeShip)}</strong> để được Miễn Phí Giao Hàng</>
                ) : (
                  <strong className="text-brand-green font-bold">Bạn đã được MIỄN PHÍ GIAO HÀNG! 🎉</strong>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-green h-full rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShip}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                <div className="w-16 h-16 rounded-full bg-brand-ivory flex items-center justify-center mb-4 text-brand-brown-light">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-base font-bold text-brand-brown mb-1">Giỏ hàng đang trống</p>
                <p className="text-xs text-gray-400 mb-6">Hãy chọn cho mình một ổ bánh mì nóng giòn tròn vị nhé!</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-brand-brown text-white text-xs font-bold hover:bg-brand-red transition-all"
                >
                  Xem Thực Đơn
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-brand-cream/40 rounded-2xl border border-brand-brown/10 items-center"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-18 h-18 rounded-xl object-cover shrink-0 border border-brand-brown/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-brand-brown truncate">{product.name}</h4>
                    <p className="text-xs font-black text-brand-red mt-0.5">{formatVND(product.price)}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-brand-brown/20 px-2 py-1 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-0.5 text-gray-500 hover:text-brand-brown"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-1.5 text-brand-brown">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-0.5 text-gray-500 hover:text-brand-brown"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Xóa món"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-brand-cream/30 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-brown/80 font-medium">Tạm tính:</span>
                <span className="text-xl font-black text-brand-brown">{formatVND(subtotal)}</span>
              </div>
              <p className="text-[11px] text-gray-400 italic">
                * Phí giao hàng sẽ được hệ thống tính tự động chính xác ở bước thanh toán.
              </p>
              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-bold text-sm shadow-warm hover:scale-101 transition-all"
              >
                <span>Tiến Hành Đặt Hàng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
