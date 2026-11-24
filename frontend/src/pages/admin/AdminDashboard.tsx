import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign, Package, Clock, AlertTriangle, Layers, Settings,
  Plus, Edit, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw,
  Search, CheckCircle, Shield, Truck, Eye, Save, X, Camera, Upload, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { DashboardStats, Order, Product, Ingredient, InventoryMovement, Category } from '../../types/index.js';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'inventory' | 'settings' | 'branding' | 'shippers'>('orders');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [staffList, setStaffList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const previousOrderStatusRef = useRef<Record<number, string>>({});

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Quản lý tài khoản Shipper (chỉ Admin)
  const [newShipper, setNewShipper] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [isCreatingShipper, setIsCreatingShipper] = useState(false);

  const handleCreateShipper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingShipper(true);
    try {
      await api.createShipper(newShipper);
      showToast('Đã tạo tài khoản Shipper!', 'success');
      setNewShipper({ full_name: '', email: '', phone: '', password: '' });
      setStaffList(await api.getStaffList());
    } catch (err: any) {
      showToast(err.message || 'Lỗi tạo tài khoản shipper', 'error');
    } finally {
      setIsCreatingShipper(false);
    }
  };

  const handleResetShipperPassword = async (id: number, name: string) => {
    const pw = window.prompt(`Nhập mật khẩu mới cho ${name} (8-72 ký tự):`);
    if (!pw) return;
    try {
      await api.resetShipperPassword(id, pw);
      showToast('Đã đặt lại mật khẩu Shipper!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi đặt lại mật khẩu', 'error');
    }
  };

  // Load dashboard data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashStats, ords, prods, cats, ings, movs, sets, staff] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getOrders().catch(() => []),
        api.getProducts({ all: true }).catch(() => []),
        api.getCategories().catch(() => []),
        api.getIngredients().catch(() => []),
        api.getInventoryMovements().catch(() => []),
        api.getSettings().catch(() => ({})),
        api.getStaffList().catch(() => []),
      ]);

      if (dashStats) setStats(dashStats);
      setOrders(ords);
      previousOrderStatusRef.current = Object.fromEntries(ords.map((o: Order) => [o.id, o.status]));
      setProducts(prods);
      setCategories(cats);
      setIngredients(ings);
      setMovements(movs);
      setSettings(sets);
      setStaffList(staff);
    } catch (e) {
      console.error(e);
      showToast('Lỗi tải dữ liệu quản trị', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Thông báo cho admin ngay khi shipper bấm "Đã giao" cho một đơn hàng.
  // Chạy ngầm mỗi 20 giây, không làm gián đoạn các tab khác đang mở.
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const freshOrders = await api.getOrders();
        freshOrders.forEach((o: Order) => {
          const prevStatus = previousOrderStatusRef.current[o.id];
          if (prevStatus && prevStatus !== 'COMPLETED' && o.status === 'COMPLETED') {
            showToast(`🎉 Shipper đã giao thành công đơn ${o.order_code}!`, 'success');
          }
        });
        previousOrderStatusRef.current = Object.fromEntries(freshOrders.map((o: Order) => [o.id, o.status]));
        setOrders(freshOrders);
      } catch {
        // Lỗi mạng tạm thời khi polling - bỏ qua êm, không làm phiền admin.
      }
    }, 20000);
    return () => clearInterval(pollInterval);
  }, []);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // Status update
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Đã cập nhật trạng thái đơn sang ${newStatus}!`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật', 'error');
    }
  };

  // Assign Shipper
  const handleAssignShipper = async (orderId: number, shipperId: number) => {
    try {
      await api.assignOrder(orderId, shipperId);
      showToast('Đã phân công đơn hàng cho Shipper!', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi phân công', 'error');
    }
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct);
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        await api.createProduct(editingProduct);
        showToast('Tạo món bánh mì mới thành công!', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu món', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn ẩn món này khỏi thực đơn?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Đã ẩn sản phẩm khỏi thực đơn!', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa', 'error');
    }
  };

  // Submit stock adjust
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !adjustQty || !adjustReason) {
      showToast('Vui lòng điền đầy đủ số lượng và lý do điều chỉnh.', 'error');
      return;
    }

    try {
      await api.adjustStock({
        ingredient_id: selectedIngredient.id,
        movement_type: adjustType,
        quantity: Number(adjustQty),
        reason: adjustReason,
      });
      showToast('Đã điều chỉnh kho thành công!', 'success');
      setIsAdjustModalOpen(false);
      setSelectedIngredient(null);
      setAdjustQty('');
      setAdjustReason('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi điều chỉnh tồn kho', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      showToast('Đã lưu cấu hình cửa hàng!', 'success');
    } catch (err: any) {
      showToast('Lỗi lưu cài đặt', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-brown/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-red text-white rounded-lg">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-brand-red uppercase tracking-wider">Hệ Thống Điều Hành</span>
          </div>
          <h1 className="text-3xl font-black text-brand-brown font-sans mt-1">Bảng Quản Trị BÁNH MÌ 0</h1>
          <p className="text-xs text-gray-500">Quản lý thực đơn, đơn hàng, kho nguyên vật liệu và điều phối giao nhận</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-brand-brown/20 text-xs font-bold text-brand-brown hover:bg-brand-cream transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <Link
            to="/shipper"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-green text-white text-xs font-bold shadow-sm hover:bg-brand-green/90 transition-all"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Mở Cổng Shipper</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-brand-brown/10 shadow-warm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Doanh Thu Đã Thu</span>
            <DollarSign className="w-5 h-5 text-brand-green" />
          </div>
          <p className="text-2xl font-black text-brand-brown">{formatVND(stats?.total_revenue || 0)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Từ {stats?.completed_orders || 0} đơn hoàn thành</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-brown/10 shadow-warm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tổng Đơn Hàng</span>
            <Package className="w-5 h-5 text-brand-brown" />
          </div>
          <p className="text-2xl font-black text-brand-brown">{stats?.total_orders || 0}</p>
          <span className="text-[11px] text-brand-red font-bold mt-1 block">
            {stats?.pending_orders || 0} đơn đang chờ duyệt
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-brown/10 shadow-warm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Món Đang Phục Vụ</span>
            <Layers className="w-5 h-5 text-brand-red" />
          </div>
          <p className="text-2xl font-black text-brand-brown">{stats?.active_products || products.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Trong thực đơn trực tuyến</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-brown/10 shadow-warm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Nguyên Liệu Cần Nhập</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{stats?.low_stock_ingredients || 0}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Đạt ngưỡng cảnh báo tồn</span>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-brand-brown/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-brown hover:text-brand-red'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Quản Lý Đơn Hàng ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-brown hover:text-brand-red'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Quản Lý Món Bánh Mì ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-brown hover:text-brand-red'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Kho & Nguyên Liệu ({ingredients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-brown hover:text-brand-red'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cấu Hình Cửa Hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'branding'
              ? 'border-brand-red text-brand-red'
              : 'border-transparent text-brand-brown hover:text-brand-red'
          }`}
        >
          <Camera className="w-4 h-4 text-brand-red" />
          <span>Ảnh Đại Diện Web / App & Trưng Bày</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('shippers')}
            className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'shippers'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-brown hover:text-brand-red'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Tài Khoản Shipper</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Status filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  orderFilter === st
                    ? 'bg-brand-brown text-white shadow-sm'
                    : 'bg-white text-brand-brown border border-brand-brown/15 hover:bg-brand-cream'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-ivory/60 border-b border-brand-brown/10 text-brand-brown uppercase font-bold">
                  <tr>
                    <th className="p-4">Mã Đơn</th>
                    <th className="p-4">Khách Hàng</th>
                    <th className="p-4">Hình Thức</th>
                    <th className="p-4">Tổng Tiền</th>
                    <th className="p-4">Trừ Kho?</th>
                    <th className="p-4">Shipper</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        Không có đơn hàng nào trong danh mục này.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-brand-cream/20 transition-colors">
                        <td className="p-4">
                          <Link to={`/tracking?code=${ord.order_code}`} className="font-mono font-black text-brand-red hover:underline">
                            {ord.order_code}
                          </Link>
                          <span className="block text-[10px] text-gray-400">
                            {new Date(ord.created_at).toLocaleTimeString('vi-VN')}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-brand-brown">{ord.customer_name}</p>
                          <p className="text-gray-400 text-[11px]">{ord.customer_phone}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            ord.fulfillment_type === 'DELIVERY' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {ord.fulfillment_type === 'DELIVERY' ? 'Giao hàng' : 'Tại tiệm'}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-brand-brown">
                          {formatVND(ord.total_amount)}
                        </td>
                        <td className="p-4">
                          {ord.is_inventory_deducted === 1 ? (
                            <span className="inline-flex items-center gap-1 text-green-700 font-bold text-[10px] bg-green-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Đã trừ
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">Chưa trừ</span>
                          )}
                        </td>
                        <td className="p-4">
                          {ord.fulfillment_type === 'DELIVERY' ? (
                            <select
                              value={ord.delivery?.shipper_name || ''}
                              onChange={(e) => {
                                const selectedStaff = staffList.find(s => s.id === Number(e.target.value));
                                if (selectedStaff) handleAssignShipper(ord.id, selectedStaff.id);
                              }}
                              className="text-xs bg-brand-ivory/50 border border-brand-brown/20 rounded-lg p-1 font-medium"
                            >
                              <option value="">-- Chọn Shipper --</option>
                              {staffList.filter(s => s.role === 'SHIPPER').map((s) => (
                                <option key={s.id} value={s.id}>{s.full_name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-400 text-[10px]">Lấy tại tiệm</span>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                            className="text-xs font-bold bg-white border border-brand-brown/30 rounded-lg p-1.5 focus:ring-1 focus:ring-brand-red"
                          >
                            <option value="PENDING">PENDING (Chờ xác nhận)</option>
                            <option value="CONFIRMED">CONFIRMED (Xác nhận & trừ kho)</option>
                            <option value="PREPARING">PREPARING (Đang nướng/làm)</option>
                            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP (Chờ lấy)</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Đang giao)</option>
                            <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                            <option value="CANCELLED">CANCELLED (Hủy đơn)</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <Link
                            to={`/tracking?code=${ord.order_code}`}
                            className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-ivory inline-block"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-brand-brown">Danh Sách Món Bánh Mì</h3>
            <button
              onClick={() => {
                setEditingProduct({
                  code: `BM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                  name: '',
                  category_id: categories[0]?.id || 1,
                  price: 30000,
                  description: '',
                  ingredients_text: '',
                  image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
                  is_featured: 0,
                  is_available: 1,
                });
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-red text-white text-xs font-bold hover:bg-brand-red-dark transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Món Mới</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-ivory/60 border-b border-brand-brown/10 text-brand-brown uppercase font-bold">
                  <tr>
                    <th className="p-4">Ảnh</th>
                    <th className="p-4">Mã SKU</th>
                    <th className="p-4">Tên Món</th>
                    <th className="p-4">Danh Mục</th>
                    <th className="p-4">Giá Bán</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4">Nổi Bật?</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-brand-cream/20">
                      <td className="p-4">
                        <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-brand-brown/10" />
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-500">{p.code}</td>
                      <td className="p-4 font-bold text-brand-brown">{p.name}</td>
                      <td className="p-4 text-gray-500">{p.category_name}</td>
                      <td className="p-4 font-black text-brand-red">{formatVND(p.price)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.is_available === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.is_available === 1 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.is_featured === 1 ? (
                          <span className="text-brand-red font-bold text-[10px]">★ Nổi bật</span>
                        ) : (
                          <span className="text-gray-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-ivory"
                          title="Sửa món"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Ẩn món"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVENTORY & BOM */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-brand-brown">Kho Nguyên Vật Liệu (Định Mức BOM)</h3>
                <p className="text-xs text-gray-400">Nguyên liệu sẽ tự động trừ theo công thức khi đơn được xác nhận</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-ivory/60 border-b border-brand-brown/10 text-brand-brown uppercase font-bold">
                  <tr>
                    <th className="p-4">Mã</th>
                    <th className="p-4">Tên Nguyên Liệu</th>
                    <th className="p-4">Đơn Vị</th>
                    <th className="p-4">Tồn Kho Hiện Tại</th>
                    <th className="p-4">Ngưỡng Báo Động</th>
                    <th className="p-4">Giá Nhập Chuẩn</th>
                    <th className="p-4">Tình Trạng</th>
                    <th className="p-4 text-right">Điều Chỉnh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingredients.map((ing) => {
                    const isLow = ing.current_stock <= ing.warning_threshold;
                    return (
                      <tr key={ing.id} className="hover:bg-brand-cream/20">
                        <td className="p-4 font-mono font-bold text-gray-500">{ing.code}</td>
                        <td className="p-4 font-bold text-brand-brown">{ing.name}</td>
                        <td className="p-4 text-gray-500">{ing.unit}</td>
                        <td className="p-4 font-black text-sm text-brand-brown">{ing.current_stock}</td>
                        <td className="p-4 text-gray-400">{ing.warning_threshold}</td>
                        <td className="p-4 font-medium text-gray-600">{formatVND(ing.cost_price)}</td>
                        <td className="p-4">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px] animate-pulse">
                              Sắp hết hàng!
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold text-[10px]">
                              Ổn định
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedIngredient(ing);
                              setIsAdjustModalOpen(true);
                            }}
                            className="px-3 py-1 rounded-full bg-brand-brown text-white text-[11px] font-bold hover:bg-brand-brown-dark transition-all"
                          >
                            Nhập/Xuất Kho
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Movements audit trail */}
          <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm p-6 space-y-4">
            <h4 className="font-bold text-base text-brand-brown">Nhật Ký Biến Động Kho (Audit Log)</h4>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 text-xs">
              {movements.map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-brand-brown">
                      {m.ingredient_name} ({m.movement_type === 'IN' ? '+ ' : '- '}{m.quantity} {m.unit})
                    </p>
                    <p className="text-[11px] text-gray-400 italic">
                      Lý do: {m.reason} {m.order_code && `(Đơn: ${m.order_code})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-gray-500">{m.previous_stock} → {m.new_stock}</span>
                    <span className="block text-[10px] text-gray-400">{new Date(m.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SHIPPERS (chỉ Admin) */}
      {activeTab === 'shippers' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleCreateShipper} className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm p-8 space-y-4">
            <div>
              <h3 className="font-bold text-lg text-brand-brown">Tạo Tài Khoản Shipper</h3>
              <p className="text-xs text-gray-500">Chỉ Admin tạo được. Shipper không thể tự đăng ký trên web.</p>
            </div>
            {[
              { key: 'full_name', label: 'Họ tên', type: 'text', required: true },
              { key: 'email', label: 'Email đăng nhập', type: 'email', required: true },
              { key: 'phone', label: 'Số điện thoại', type: 'tel', required: false },
              { key: 'password', label: 'Mật khẩu (tối thiểu 8 ký tự)', type: 'password', required: true },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-brand-brown mb-1">{f.label}</label>
                <input
                  type={f.type}
                  required={f.required}
                  minLength={f.key === 'password' ? 8 : undefined}
                  autoComplete={f.key === 'password' ? 'new-password' : 'off'}
                  value={(newShipper as any)[f.key]}
                  onChange={(e) => setNewShipper({ ...newShipper, [f.key]: e.target.value })}
                  className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs font-medium text-brand-brown"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={isCreatingShipper}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingShipper ? 'Đang tạo...' : 'Tạo Tài Khoản Shipper'}</span>
            </button>
          </form>

          <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm p-8 space-y-4">
            <h3 className="font-bold text-lg text-brand-brown">Danh Sách Shipper</h3>
            <div className="divide-y divide-brand-brown/10">
              {staffList.filter((s) => s.role === 'SHIPPER').length === 0 && (
                <p className="text-xs text-gray-500 py-3">Chưa có shipper nào.</p>
              )}
              {staffList.filter((s) => s.role === 'SHIPPER').map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-brown truncate">{s.full_name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{s.email}{s.phone ? ` · ${s.phone}` : ''}</p>
                  </div>
                  <button
                    onClick={() => handleResetShipperPassword(s.id, s.full_name)}
                    className="shrink-0 px-3 py-1.5 rounded-full border border-brand-brown/20 text-[11px] font-bold text-brand-brown hover:border-brand-red hover:text-brand-red"
                  >
                    Đặt lại mật khẩu
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm p-8 max-w-2xl space-y-6">
          <div>
            <h3 className="font-bold text-lg text-brand-brown">Cấu Hình Cửa Hàng & Vận Hành</h3>
            <p className="text-xs text-gray-500">Các thông số này ảnh hưởng trực tiếp tới phí giao hàng và thông tin hiển thị</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-brown mb-1">Tên thương hiệu</label>
              <input
                type="text"
                value={settings.STORE_NAME || 'BÁNH MÌ 0'}
                onChange={(e) => setSettings({ ...settings, STORE_NAME: e.target.value })}
                className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs font-medium text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-brown mb-1">Khẩu hiệu (Slogan)</label>
              <input
                type="text"
                value={settings.STORE_SLOGAN || 'TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ'}
                onChange={(e) => setSettings({ ...settings, STORE_SLOGAN: e.target.value })}
                className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs font-medium text-brand-brown"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1">Phí giao hàng chuẩn (VNĐ)</label>
                <input
                  type="number"
                  value={settings.DELIVERY_BASE_FEE || '15000'}
                  onChange={(e) => setSettings({ ...settings, DELIVERY_BASE_FEE: e.target.value })}
                  className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs font-medium text-brand-brown"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-brown mb-1">Ngưỡng Freeship (VNĐ)</label>
                <input
                  type="number"
                  value={settings.DELIVERY_FREE_THRESHOLD || '150000'}
                  onChange={(e) => setSettings({ ...settings, DELIVERY_FREE_THRESHOLD: e.target.value })}
                  className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs font-medium text-brand-brown"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-brown mb-1">Hotline cửa hàng</label>
              <input
                type="text"
                value={settings.STORE_PHONE || '0987 654 321'}
                onChange={(e) => setSettings({ ...settings, STORE_PHONE: e.target.value })}
                className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs font-medium text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-brown mb-1">Địa chỉ tiệm bánh</label>
              <input
                type="text"
                value={settings.STORE_ADDRESS || '123 Đường Bánh Mì, Quận 1, TP. Hồ Chí Minh'}
                onChange={(e) => setSettings({ ...settings, STORE_ADDRESS: e.target.value })}
                className="w-full px-4 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 text-xs font-medium text-brand-brown"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-brown hover:bg-brand-brown-dark text-white text-xs font-bold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Cửa Hàng</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: BRANDING & WEB/APP AVATAR (REQUESTED BY USER) */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-3xl border border-brand-brown/10 shadow-warm p-8 max-w-4xl space-y-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase tracking-widest mb-1">
              <Camera className="w-4 h-4" />
              <span>Nhận Diện Thương Hiệu</span>
            </div>
            <h3 className="font-bold text-2xl text-brand-brown font-sans">
              Cập Nhật Ảnh Đại Diện Web / App & Trưng Bày Cửa Hàng
            </h3>
            <p className="text-xs text-gray-500">
              Quản lý hình ảnh logo chính thức xuất hiện trên thanh điều hướng, favicon, intro và ảnh trưng bày không gian cửa hàng.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-8">
            {/* 1. Web & App Avatar / Logo */}
            <div className="p-6 rounded-2xl bg-brand-cream/40 border border-brand-brown/15 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-brand-brown flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-red" />
                    <span>1. Ảnh Đại Diện Web / App (Logo Chính Thức)</span>
                  </h4>
                  <p className="text-xs text-gray-500">Kích thước khuyến nghị: Vuông hoặc Tròn (512x512px), định dạng JPG, PNG</p>
                </div>
                <span className="text-xs font-bold text-brand-green bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  Đang hoạt động
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Preview Avatar */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-brand-brown/10 text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-brown shadow-warm bg-white mb-2">
                    <img
                      src={settings.STORE_LOGO_URL || '/logo_banhmi0.jpg'}
                      alt="Logo Web/App Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-brand-brown">Xem trước Logo</span>
                </div>

                {/* Input URL & File Upload */}
                <div className="md:col-span-8 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Đường dẫn ảnh Logo (URL hoặc file hệ thống)</label>
                    <input
                      type="text"
                      value={settings.STORE_LOGO_URL || '/logo_banhmi0.jpg'}
                      onChange={(e) => setSettings({ ...settings, STORE_LOGO_URL: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-brand-brown/20 font-mono text-brand-brown"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Hoặc tải lên file ảnh đại diện mới từ máy tính</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-brand-brown/30 rounded-xl cursor-pointer hover:bg-brand-ivory transition-colors">
                      <Upload className="w-4 h-4 text-brand-brown-light" />
                      <span className="font-semibold text-brand-brown">Chọn file ảnh Logo để tải lên...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              showToast('Đang tải ảnh logo lên...', 'info');
                              const uploadedUrl = await api.uploadImage(file);
                              setSettings({ ...settings, STORE_LOGO_URL: uploadedUrl });
                              showToast('Tải ảnh logo thành công!', 'success');
                            } catch (uErr: any) {
                              showToast(uErr.message || 'Lỗi tải ảnh', 'error');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Store Showcase Image */}
            <div className="p-6 rounded-2xl bg-brand-cream/40 border border-brand-brown/15 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-brand-brown flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-brown" />
                    <span>2. Ảnh Trưng Bày Cửa Hàng & Bao Bì (Showcase Banner)</span>
                  </h4>
                  <p className="text-xs text-gray-500">Kích thước khuyến nghị: Tỉ lệ 16:9, thể hiện quầy bán, bao bì kraft và sản phẩm</p>
                </div>
                <span className="text-xs font-bold text-brand-green bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  Đang hoạt động
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Preview Banner */}
                <div className="md:col-span-5 p-2 bg-white rounded-2xl border border-brand-brown/10">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden border border-brand-brown/10">
                    <img
                      src={settings.STORE_SHOWCASE_URL || '/store_showcase.jpg'}
                      alt="Showcase Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-brand-brown block text-center mt-1.5">
                    Xem trước Ảnh Trưng Bày
                  </span>
                </div>

                {/* Input URL & File Upload */}
                <div className="md:col-span-7 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Đường dẫn ảnh Trưng Bày (URL hoặc file hệ thống)</label>
                    <input
                      type="text"
                      value={settings.STORE_SHOWCASE_URL || '/store_showcase.jpg'}
                      onChange={(e) => setSettings({ ...settings, STORE_SHOWCASE_URL: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-brand-brown/20 font-mono text-brand-brown"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Hoặc tải lên ảnh trưng bày tiệm mới</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-brand-brown/30 rounded-xl cursor-pointer hover:bg-brand-ivory transition-colors">
                      <Upload className="w-4 h-4 text-brand-brown-light" />
                      <span className="font-semibold text-brand-brown">Chọn file ảnh Trưng Bày để tải lên...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              showToast('Đang tải ảnh trưng bày lên...', 'info');
                              const uploadedUrl = await api.uploadImage(file);
                              setSettings({ ...settings, STORE_SHOWCASE_URL: uploadedUrl });
                              showToast('Tải ảnh trưng bày thành công!', 'success');
                            } catch (uErr: any) {
                              showToast(uErr.message || 'Lỗi tải ảnh', 'error');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Concept Store Image */}
            <div className="p-6 rounded-2xl bg-brand-cream/40 border border-brand-brown/15 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-brand-brown flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-brown" />
                    <span>3. Ảnh Trưng Bày Tiệm & Bao Bì (Concept Store)</span>
                  </h4>
                  <p className="text-xs text-gray-500">Ảnh riêng cho mục "Không Gian & Nhận Diện Thương Hiệu" ở trang chủ, tách biệt với ảnh Showcase ở trên</p>
                </div>
                <span className="text-xs font-bold text-brand-green bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  Đang hoạt động
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 p-2 bg-white rounded-2xl border border-brand-brown/10">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden border border-brand-brown/10">
                    <img
                      src={settings.STORE_CONCEPT_IMAGE_URL || '/store_showcase.jpg'}
                      alt="Concept Store Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-brand-brown block text-center mt-1.5">
                    Xem trước Ảnh Concept Store
                  </span>
                </div>

                <div className="md:col-span-7 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Đường dẫn ảnh Concept Store (URL hoặc file hệ thống)</label>
                    <input
                      type="text"
                      value={settings.STORE_CONCEPT_IMAGE_URL || '/store_showcase.jpg'}
                      onChange={(e) => setSettings({ ...settings, STORE_CONCEPT_IMAGE_URL: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-brand-brown/20 font-mono text-brand-brown"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Hoặc tải lên ảnh Concept Store mới</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-brand-brown/30 rounded-xl cursor-pointer hover:bg-brand-ivory transition-colors">
                      <Upload className="w-4 h-4 text-brand-brown-light" />
                      <span className="font-semibold text-brand-brown">Chọn file ảnh Concept Store để tải lên...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              showToast('Đang tải ảnh Concept Store lên...', 'info');
                              const uploadedUrl = await api.uploadImage(file);
                              setSettings({ ...settings, STORE_CONCEPT_IMAGE_URL: uploadedUrl });
                              showToast('Tải ảnh Concept Store thành công!', 'success');
                            } catch (uErr: any) {
                              showToast(uErr.message || 'Lỗi tải ảnh', 'error');
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-brand-brown/10">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold shadow-warm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Lưu & Áp Dụng Nhận Diện Thương Hiệu</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCT CREATE/EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-brand-brown">
                {editingProduct.id ? 'Chỉnh Sửa Món Bánh Mì' : 'Thêm Món Bánh Mì Mới'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-brand-brown">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-brown mb-1">Mã sản phẩm (SKU) *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.code || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Tên món bánh mì *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Danh mục *</label>
                  <select
                    value={editingProduct.category_id || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Hình ảnh bánh mì</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand-brown/20 bg-brand-ivory/40 flex-shrink-0">
                    {editingProduct.image_url ? (
                      <img src={editingProduct.image_url} alt="Xem trước" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-brand-brown-light" />
                      </div>
                    )}
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-dashed border-brand-brown/30 rounded-xl cursor-pointer hover:bg-brand-ivory transition-colors text-xs">
                    <Upload className="w-4 h-4 text-brand-brown-light" />
                    <span className="font-semibold text-brand-brown">Chọn ảnh từ thư viện / thư mục...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            showToast('Đang tải ảnh lên...', 'info');
                            const uploadedUrl = await api.uploadImage(file);
                            setEditingProduct({ ...editingProduct, image_url: uploadedUrl });
                            showToast('Tải ảnh thành công!', 'success');
                          } catch (uErr: any) {
                            showToast(uErr.message || 'Lỗi tải ảnh', 'error');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="...hoặc dán URL ảnh trực tiếp"
                  value={editingProduct.image_url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Mô tả món ăn</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Thành phần chi tiết</label>
                <input
                  type="text"
                  value={editingProduct.ingredients_text || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, ingredients_text: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_available === 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_available: e.target.checked ? 1 : 0 })}
                  />
                  <span>Đang mở bán</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured === 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked ? 1 : 0 })}
                  />
                  <span>Món Nổi Bật</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-gray-500 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-brand-red text-white font-bold"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVENTORY ADJUST MODAL */}
      {isAdjustModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-brand-brown">Điều Chỉnh Kho Nguyên Liệu</h3>
                <p className="text-xs text-gray-400">{selectedIngredient.name} ({selectedIngredient.unit})</p>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-brand-brown">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-brown mb-1.5">Loại điều chỉnh</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'IN', label: 'Nhập Kho (+)' },
                    { key: 'OUT', label: 'Xuất Kho (-)' },
                    { key: 'ADJUST', label: 'Kiểm Kê (=)' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setAdjustType(t.key as any)}
                      className={`py-2 rounded-xl border text-center font-bold transition-all ${
                        adjustType === t.key
                          ? 'bg-brand-brown text-white border-brand-brown'
                          : 'bg-brand-cream/50 border-brand-brown/15 text-brand-brown'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {adjustType === 'ADJUST' ? 'Số lượng tồn thực tế mới' : 'Số lượng thay đổi'} ({selectedIngredient.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Ví dụ: 10"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Lý do điều chỉnh (bắt buộc) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Nhập hàng sáng ngày 12/11 từ nhà cung cấp"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-ivory/40 rounded-xl border border-brand-brown/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-gray-500 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-brand-brown hover:bg-brand-brown-dark text-white font-bold"
                >
                  Xác Nhận Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
