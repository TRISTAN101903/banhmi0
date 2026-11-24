import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Compass, Clock, MapPin, Phone, Package, Bike, ShieldAlert } from 'lucide-react';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';
import { OrderStepper } from '../components/customer/OrderStepper.js';
import { useStoreSettings } from '../context/StoreSettingsContext.js';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { settings } = useStoreSettings();
  const initialCode = searchParams.get('code') || '';

  const [orderCodeInput, setOrderCodeInput] = useState(initialCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [locationInfo, setLocationInfo] = useState<{ has_location: boolean; latitude?: number; longitude?: number; message?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchOrder = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    setSearchError(null);
    try {
      const data = await api.getOrderDetail(code.trim());
      setOrder(data);

      // Check delivery GPS if available
      if (data && data.id) {
        const loc = await api.getOrderLocation(data.id);
        setLocationInfo(loc);
      }
    } catch (err: any) {
      setSearchError('Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại.');
      setOrder(null);
      setLocationInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchOrder(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderCodeInput);
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-brand-red uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Compass className="w-4 h-4" />
          <span>Theo Dõi Đơn Hàng</span>
        </span>
        <h1 className="text-3xl font-black text-brand-brown font-sans">
          Kiểm Tra Tiến Trình Ổ Bánh Mì Của Bạn
        </h1>
        <p className="text-xs sm:text-sm text-brand-brown/70 max-w-md mx-auto">
          Nhập mã đơn hàng (định dạng BM0-XXXXXX) để theo dõi trạng thái chế biến và giao nhận theo thời gian thực.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ví dụ: BM0-261112-ABCD"
            value={orderCodeInput}
            onChange={(e) => setOrderCodeInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-full border border-brand-brown/20 text-xs sm:text-sm text-brand-brown font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-full bg-brand-brown hover:bg-brand-brown-dark text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
        >
          {isLoading ? 'Đang tìm...' : 'Tra Cứu'}
        </button>
      </form>

      {searchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 text-center max-w-xl mx-auto">
          {searchError}
        </div>
      )}

      {/* Order Details Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm p-6 sm:p-8 space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Mã đơn hàng:</span>
              <h2 className="text-2xl font-black text-brand-red font-mono">{order.order_code}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Đặt lúc: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Hình thức nhận:</span>
              <p className="text-sm font-bold text-brand-brown">
                {order.fulfillment_type === 'DELIVERY' ? 'Giao Tận Nơi' : 'Nhận Tại Tiệm'}
              </p>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-brown/10 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-brand-brown">
                {order.payment_method === 'BANK_TRANSFER' ? 'Thanh toán: Chuyển khoản' : 'Thanh toán: Tiền mặt khi nhận hàng'}
              </span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${order.payment_status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                {order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>

            {order.payment_method === 'BANK_TRANSFER' && order.payment_status !== 'PAID' && order.status !== 'CANCELLED' && settings.PAYMENT_QR_URL && (
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img src={settings.PAYMENT_QR_URL} alt="Mã QR chuyển khoản" className="w-44 h-44 object-contain bg-white rounded-xl border border-brand-brown/15" />
                <div className="space-y-2 text-brand-brown">
                  {settings.PAYMENT_BANK_NAME && <p><strong>Ngân hàng:</strong> {settings.PAYMENT_BANK_NAME}</p>}
                  {settings.PAYMENT_ACCOUNT_NAME && <p><strong>Chủ tài khoản:</strong> {settings.PAYMENT_ACCOUNT_NAME}</p>}
                  {settings.PAYMENT_ACCOUNT_NO && <p><strong>Số tài khoản:</strong> {settings.PAYMENT_ACCOUNT_NO}</p>}
                  <p><strong>Số tiền:</strong> {formatVND(order.total_amount)}</p>
                  <p className="flex flex-wrap items-center gap-2">
                    <span><strong>Nội dung chuyển khoản:</strong> <span className="font-mono">{order.order_code}</span></span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(order.order_code)?.catch(() => {})}
                      className="px-2.5 py-1 rounded-full border border-brand-brown/20 font-bold hover:border-brand-red hover:text-brand-red"
                    >
                      Sao chép
                    </button>
                  </p>
                  <p className="text-gray-500 leading-relaxed">
                    Quét mã QR, nhập đúng số tiền và nội dung ở trên. Tiệm sẽ xác nhận khi nhận được tiền.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stepper */}
          <div className="py-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Tiến trình xử lý:</h3>
            <OrderStepper status={order.status} fulfillmentType={order.fulfillment_type} />
          </div>

          {/* Delivery & GPS Location Section */}
          {order.fulfillment_type === 'DELIVERY' && (
            <div className="p-5 rounded-2xl bg-brand-ivory/60 border border-brand-brown/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown flex items-center gap-2">
                <Bike className="w-4 h-4 text-brand-red" />
                <span>Vị Trí Shipper Giao Hàng Trực Tiếp</span>
              </h4>

              {locationInfo?.has_location ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-brand-green font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-ping"></span>
                    <span>Đang cập nhật tọa độ GPS trực tiếp từ thiết bị của Shipper:</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-brand-brown/15 font-mono text-xs text-brand-brown">
                    Tọa độ: {locationInfo.latitude}, {locationInfo.longitude}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-brand-brown/15 text-xs text-brand-brown/80">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>Chưa có dữ liệu vị trí giao hàng trực tiếp</span>
                </div>
              )}

              {order.delivery && (
                <div className="text-xs text-gray-600 pt-2 border-t border-brand-brown/10 flex items-center gap-4">
                  <span>Shipper phụ trách: <strong>{order.delivery.shipper_name}</strong></span>
                  {order.delivery.shipper_phone && <span>Hotline: <strong>{order.delivery.shipper_phone}</strong></span>}
                </div>
              )}
            </div>
          )}

          {/* Recipient info & items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            {/* Recipient Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-gray-400">Thông tin nhận hàng:</h4>
              <p><strong>Người nhận:</strong> {order.customer_name}</p>
              <p><strong>Số điện thoại:</strong> {order.customer_phone}</p>
              {order.delivery_address && <p><strong>Địa chỉ:</strong> {order.delivery_address}</p>}
              {order.notes && <p className="italic text-gray-500"><strong>Ghi chú:</strong> "{order.notes}"</p>}
            </div>

            {/* Items Summary */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-gray-400">Món đã đặt:</h4>
              <div className="space-y-2">
                {order.items?.map((it) => (
                  <div key={it.id} className="flex justify-between items-center bg-brand-cream/30 p-2 rounded-lg">
                    <span>{it.quantity} × {it.product_name}</span>
                    <strong className="text-brand-brown">{formatVND(it.subtotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-sm">
                <span>Tổng cộng:</span>
                <span className="text-brand-red text-base font-black">{formatVND(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Audit Events Timeline */}
          {order.events && order.events.length > 0 && (
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Lịch sử cập nhật:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.events.map((ev) => (
                  <div key={ev.id} className="text-xs text-gray-600 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-brand-brown">[{new Date(ev.created_at).toLocaleTimeString('vi-VN')}]</strong>{' '}
                      {ev.note || ev.event_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
