import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShoppingBag, ArrowLeft, ShieldCheck, CheckCircle2, Truck, Store, MapPin, Phone, User, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../services/api.js';
import { useStoreSettings } from '../context/StoreSettingsContext.js';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [fulfillmentType, setFulfillmentType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [notes, setNotes] = useState('');
  const { settings } = useStoreSettings();
  const hasQr = Boolean(settings.PAYMENT_QR_URL);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const deliveryFee = fulfillmentType === 'DELIVERY' ? (subtotal >= 150000 ? 0 : 15000) : 0;
  const estimatedTotal = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-ivory mx-auto flex items-center justify-center text-brand-brown-light">
          <ShoppingBag className="w-8 h-8 opacity-40" />
        </div>
        <h2 className="text-2xl font-bold text-brand-brown">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-gray-500">Vui lòng chọn món bánh mì trước khi chuyển đến bước đặt hàng.</p>
        <Link to="/menu" className="inline-block px-6 py-2.5 rounded-full bg-brand-brown text-white text-xs font-bold">
          Quay lại thực đơn
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-ivory mx-auto flex items-center justify-center text-brand-brown-light">
          <User className="w-8 h-8 opacity-40" />
        </div>
        <h2 className="text-2xl font-bold text-brand-brown">Bạn cần đăng nhập để đặt hàng</h2>
        <p className="text-xs text-gray-500">
          Đăng nhập hoặc tạo tài khoản để theo dõi đơn hàng và nhận ưu đãi dành riêng cho thành viên.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            state={{ from: '/checkout' }}
            className="px-6 py-2.5 rounded-full bg-brand-brown text-white text-xs font-bold"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            state={{ from: '/checkout' }}
            className="px-6 py-2.5 rounded-full border border-brand-brown/30 text-brand-brown text-xs font-bold"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Vui lòng điền họ tên và số điện thoại nhận hàng.', 'error');
      return;
    }

    if (fulfillmentType === 'DELIVERY' && !deliveryAddress.trim()) {
      showToast('Vui lòng nhập địa chỉ giao hàng chi tiết.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: fulfillmentType === 'DELIVERY' ? deliveryAddress : undefined,
        fulfillment_type: fulfillmentType,
        notes: notes.trim() || undefined,
        payment_method: hasQr ? paymentMethod : 'COD',
        items: items.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
      };

      const result = await api.createOrder(orderPayload);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (cErr) {}

      showToast(`Đặt hàng thành công! Mã đơn: ${result.order_code}`, 'success');
      clearCart();
      navigate(`/tracking?code=${result.order_code}`);
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi gửi đơn hàng', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-brown/10 pb-6">
        <div>
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-brown hover:text-brand-red transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tiếp tục chọn món</span>
          </button>
          <h1 className="text-3xl font-black text-brand-brown font-sans">Xác Nhận Đặt Hàng</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-brand-green bg-brand-green-light px-3 py-1.5 rounded-full border border-brand-green/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Giá kiểm chứng an toàn bởi Server</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Delivery Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fulfillment Type Toggle */}
          <div className="bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-warm space-y-4">
            <h3 className="font-bold text-base text-brand-brown flex items-center gap-2">
              <span>Hình Thức Nhận Bánh</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  fulfillmentType === 'DELIVERY'
                    ? 'border-brand-red bg-brand-red-light/40 ring-2 ring-brand-red/20'
                    : 'border-brand-brown/15 bg-brand-ivory/50 hover:bg-white'
                }`}
              >
                <Truck className={`w-5 h-5 mb-2 ${fulfillmentType === 'DELIVERY' ? 'text-brand-red' : 'text-gray-400'}`} />
                <div>
                  <p className="font-bold text-sm text-brand-brown">Giao Tận Nơi</p>
                  <p className="text-[11px] text-gray-500">Shipper BÁNH MÌ 0 giao nhanh</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  fulfillmentType === 'PICKUP'
                    ? 'border-brand-red bg-brand-red-light/40 ring-2 ring-brand-red/20'
                    : 'border-brand-brown/15 bg-brand-ivory/50 hover:bg-white'
                }`}
              >
                <Store className={`w-5 h-5 mb-2 ${fulfillmentType === 'PICKUP' ? 'text-brand-red' : 'text-gray-400'}`} />
                <div>
                  <p className="font-bold text-sm text-brand-brown">Đến Lấy Tại Tiệm</p>
                  <p className="text-[11px] text-gray-500">123 Đường Bánh Mì, Q.1</p>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-warm space-y-4">
            <h3 className="font-bold text-base text-brand-brown flex items-center gap-2">
              <User className="w-4 h-4 text-brand-red" />
              <span>Thông Tin Người Nhận</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
                />
              </div>
            </div>

            {fulfillmentType === 'DELIVERY' && (
              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  <span>Địa chỉ giao hàng chi tiết *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-brand-brown mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand-brown-light" />
                <span>Ghi chú cho bếp & đóng gói (không bắt buộc)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Không ăn ớt, nhiều ngò gai, nướng thật giòn..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs text-brand-brown font-medium focus:outline-none focus:border-brand-red focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-warm space-y-6">
            <h3 className="font-bold text-base text-brand-brown flex items-center justify-between">
              <span>Đơn Hàng ({items.length} món)</span>
              <Link to="/menu" className="text-xs text-brand-red font-medium hover:underline">Chỉnh sửa</Link>
            </h3>

            {/* Items table */}
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-brand-brown/10" />
                    <div>
                      <p className="font-bold text-brand-brown line-clamp-1">{product.name}</p>
                      <p className="text-gray-400">Số lượng: {quantity} × {formatVND(product.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-brand-brown">{formatVND(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-brand-brown/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-brand-brown">
                <span>Tạm tính món:</span>
                <span className="font-semibold">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-brown">
                <span>Phí giao hàng:</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? <strong className="text-brand-green font-bold">MIỄN PHÍ</strong> : formatVND(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-dashed border-brand-brown/20 pt-2 flex justify-between items-baseline text-sm">
                <span className="font-bold text-brand-brown">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-brand-red font-sans">{formatVND(estimatedTotal)}</span>
              </div>
            </div>

            {/* Payment method */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold text-brand-brown mb-1">Hình thức thanh toán</legend>
              <label className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer ${paymentMethod === 'COD' || !hasQr ? 'border-brand-red bg-brand-red-light/40' : 'border-brand-brown/15 bg-white'}`}>
                <input type="radio" name="payment" className="mt-0.5" checked={paymentMethod === 'COD' || !hasQr} onChange={() => setPaymentMethod('COD')} />
                <span>
                  <strong className="block text-brand-brown">Tiền mặt khi nhận hàng</strong>
                  <span className="text-gray-500">Thanh toán khi nhận được bánh.</span>
                </span>
              </label>
              {hasQr && (
                <label className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer ${paymentMethod === 'BANK_TRANSFER' ? 'border-brand-red bg-brand-red-light/40' : 'border-brand-brown/15 bg-white'}`}>
                  <input type="radio" name="payment" className="mt-0.5" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} />
                  <span>
                    <strong className="block text-brand-brown">Chuyển khoản qua mã QR</strong>
                    <span className="text-gray-500">Sau khi đặt hàng, bạn sẽ thấy mã QR kèm số tiền và nội dung chuyển khoản.</span>
                  </span>
                </label>
              )}
            </fieldset>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-bold text-sm shadow-warm hover:shadow-warm-lg transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang xử lý đơn hàng...</span>
              ) : (
                <span>Đặt Món Ngay ({formatVND(estimatedTotal)})</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
