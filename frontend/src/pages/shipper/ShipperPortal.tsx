import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Phone, CheckCircle, XCircle, Navigation, Radio, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';

export const ShipperPortal: React.FC = () => {
  const { user, isShipper, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // GPS Sharing State
  const [isGpsSharing, setIsGpsSharing] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getShipperTasks();
      setTasks(data);
    } catch (e: any) {
      showToast('Lỗi tải danh sách chuyến giao', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Update delivery status
  const handleUpdateStatus = async (assignmentId: number, newStatus: string) => {
    try {
      await api.updateShipperTask(assignmentId, newStatus);
      showToast(`Đã cập nhật trạng thái đơn: ${newStatus}!`, 'success');

      // If finished, stop GPS
      if (activeTaskId === assignmentId && (newStatus === 'DELIVERED' || newStatus === 'FAILED')) {
        stopGpsTracking();
      }
      loadTasks();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật tiến trình', 'error');
    }
  };

  // Toggle GPS Sharing
  const toggleGpsSharing = (taskId: number) => {
    if (isGpsSharing && activeTaskId === taskId) {
      stopGpsTracking();
      return;
    }

    if (!navigator.geolocation) {
      showToast('Trình duyệt không hỗ trợ Geolocation GPS.', 'error');
      return;
    }

    // Request actual GPS
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setIsGpsSharing(true);
        setActiveTaskId(taskId);

        // Send to backend
        api.sendShipperLocation(taskId, latitude, longitude).catch(console.error);
        showToast('Đang phát tọa độ GPS thời gian thực tới khách hàng', 'info');
      },
      (error) => {
        showToast(`Không thể lấy vị trí GPS: ${error.message}`, 'error');
        setIsGpsSharing(false);
        setActiveTaskId(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = watchId;
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsGpsSharing(false);
    setActiveTaskId(null);
    setCurrentCoords(null);
    showToast('Đã dừng chia sẻ vị trí GPS.', 'info');
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-green text-white flex items-center justify-center shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-brown">Cổng Điều Phối Giao Hàng</h1>
            <p className="text-xs text-gray-500">Shipper: <strong>{user?.full_name || 'Nguyễn Văn Giao'}</strong></p>
          </div>
        </div>

        {/* GPS Global status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-ivory border border-brand-brown/15 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isGpsSharing ? 'bg-brand-green animate-ping' : 'bg-gray-300'}`} />
          <span className="font-semibold text-brand-brown">
            {isGpsSharing ? `Đang chia sẻ GPS (${currentCoords?.lat.toFixed(4)}, ${currentCoords?.lng.toFixed(4)})` : 'Đang tắt chia sẻ định vị'}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-brand-brown flex items-center justify-between">
          <span>Danh Sách Đơn Giao Của Bạn ({tasks.length})</span>
          <button onClick={loadTasks} className="text-xs font-semibold text-brand-red hover:underline">Làm mới</button>
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400">Đang tải nhiệm vụ giao hàng...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-brand-brown/10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand-ivory mx-auto flex items-center justify-center text-brand-brown-light">
              <CheckCircle className="w-8 h-8 opacity-40 text-brand-green" />
            </div>
            <h3 className="font-bold text-brand-brown">Hiện không có đơn hàng nào cần giao!</h3>
            <p className="text-xs text-gray-400">Đơn hàng mới do quản trị viên phân công sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-3xl border border-brand-brown/10 shadow-warm space-y-5"
            >
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-lg text-brand-red">{task.order_code}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      task.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'IN_TRANSIT'
                        ? 'bg-blue-100 text-blue-700'
                        : task.status === 'FAILED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Thời gian phân công: {new Date(task.assigned_at).toLocaleTimeString('vi-VN')}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  {task.payment_status === 'PAID' ? (
                    <>
                      <span className="text-xs text-green-700 font-bold">Đã thanh toán, không thu tiền</span>
                      <p className="text-xl font-black text-gray-400 line-through">{formatVND(task.total_amount)}</p>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-gray-400">
                        {task.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản chưa xác nhận, thu tiền:' : 'Thu tiền COD:'}
                      </span>
                      <p className="text-xl font-black text-brand-brown">{formatVND(task.total_amount)}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Customer & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Người nhận:</p>
                  <p className="font-bold text-brand-brown text-sm">{task.customer_name}</p>
                  <a
                    href={`tel:${task.customer_phone}`}
                    className="inline-flex items-center gap-1.5 text-brand-green font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{task.customer_phone}</span>
                  </a>
                </div>

                <div className="space-y-1.5">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Địa chỉ giao:</p>
                  <p className="font-medium text-brand-brown flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                    <span>{task.delivery_address || 'Địa chỉ tiệm BÁNH MÌ 0'}</span>
                  </p>
                  {task.notes && (
                    <p className="text-amber-700 bg-amber-50 p-2 rounded-lg text-[11px] italic">
                      Ghi chú: "{task.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status Action Buttons & GPS sharing */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                {/* GPS toggle button */}
                <button
                  onClick={() => toggleGpsSharing(task.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isGpsSharing && activeTaskId === task.id
                      ? 'bg-brand-red text-white animate-pulse'
                      : 'bg-brand-cream/60 border border-brand-brown/20 text-brand-brown hover:bg-brand-cream'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>
                    {isGpsSharing && activeTaskId === task.id ? 'Dừng phát GPS' : 'Bật chia sẻ GPS trực tiếp'}
                  </span>
                </button>

                {/* Progress Buttons */}
                <div className="flex items-center gap-2">
                  {task.status !== 'IN_TRANSIT' && task.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'IN_TRANSIT')}
                      className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Bắt đầu đi giao
                    </button>
                  )}

                  {task.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'DELIVERED')}
                      className="px-4 py-2 rounded-full bg-brand-green hover:bg-green-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Đã giao thành công
                    </button>
                  )}

                  {task.status !== 'DELIVERED' && task.status !== 'FAILED' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'FAILED')}
                      className="px-3 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                    >
                      Báo giao hỏng/hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
