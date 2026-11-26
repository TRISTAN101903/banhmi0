import { Product, Category, Order, User, Ingredient, InventoryMovement, DashboardStats } from '../types/index.js';

const API_BASE = '/api/v1';

const getHeaders = (isMultipart = false): HeadersInit => {
  const token = localStorage.getItem('bm0_token');
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Fallback demo data in case backend API is warming up
const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    code: 'BM-TRUNG',
    category_id: 1,
    category_name: 'Bánh Mì Truyền Thống',
    category_code: 'TRADITIONAL',
    name: 'Bánh Mì Trứng Ốp La Giòn Tan',
    description: 'Hai quả trứng gà ốp la lòng đào nóng hổi, quyện cùng pate gan thơm béo, sốt bơ trứng vàng ngậy, dưa leo tươi giòn và rau ngò thơm nức mũi.',
    ingredients_text: 'Vỏ bánh mì giòn, 2 trứng gà ta, pate gan, sốt bơ trứng, dưa leo, ngò gai, nước tương ớt tỏi.',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80',
    is_available: 1,
    is_featured: 1,
    is_active: 1,
  },
  {
    id: 2,
    code: 'BM-CHA',
    category_id: 1,
    category_name: 'Bánh Mì Truyền Thống',
    category_code: 'TRADITIONAL',
    name: 'Bánh Mì Chả Lụa & Chả Quế Thượng Hạng',
    description: 'Chả lụa bì truyền thống thái lát dày dặn cùng chả quế nướng thơm ngậy, sốt tương ớt đậm đà, đồ chua cà rốt củ cải giòn sần sật.',
    ingredients_text: 'Vỏ bánh mì nướng, chả lụa hảo hạng, chả quế, pate gan, sốt mayonnaise gia truyền, đồ chua, ớt sừng.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    is_available: 1,
    is_featured: 1,
    is_active: 1,
  },
  {
    id: 3,
    code: 'BM-THIT',
    category_id: 2,
    category_name: 'Đặc Biệt & Thịt Nướng',
    category_code: 'SIGNATURE',
    name: 'Bánh Mì Thịt Xá Xíu Rim Mật Ong',
    description: 'Thịt xá xíu đậm vị được rim lửa nhỏ cùng mật ong hoa rừng thơm lừng, thịt nguội jambon, sốt pate nướng bùi béo kết hợp hoàn hảo.',
    ingredients_text: 'Vỏ bánh mì, thịt xá xíu rim mật ong, thịt nguội, pate nướng, sốt bơ tươi, dưa chua, ớt xanh.',
    price: 35000,
    image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    is_available: 1,
    is_featured: 1,
    is_active: 1,
  },
  {
    id: 4,
    code: 'BM-DAC-BIET',
    category_id: 2,
    category_name: 'Đặc Biệt & Thịt Nướng',
    category_code: 'SIGNATURE',
    name: 'Bánh Mì Đặc Biệt BÁNH MÌ 0',
    description: 'Món Signature đỉnh cao của BÁNH MÌ 0! Ổ bánh đầy ụ nhân: chả lụa, xá xíu mật ong, thịt nguội giòn dai, pate gan hảo hạng, sốt trứng vàng ngậy độc quyền và sốt ớt cay nhẹ.',
    ingredients_text: 'Vỏ bánh mì đặc ruột giòn rụm, chả lụa, xá xíu, thịt nguội, pate gan đặc biệt, bơ trứng tươi, sốt gia truyền BÁNH MÌ 0, đồ chua, rau thơm.',
    price: 45000,
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    is_available: 1,
    is_featured: 1,
    is_active: 1,
  },
  {
    id: 5,
    code: 'COMBO-01',
    category_id: 3,
    category_name: 'Combo Bánh Mì & Nước',
    category_code: 'COMBO',
    name: 'Combo BÁNH MÌ 0 Tròn Vị + Trà Quất Mật Ong',
    description: 'Thưởng thức 01 Ổ Bánh Mì Đặc Biệt BÁNH MÌ 0 nóng hổi kèm 01 Ly Trà Quất Mật Ong mát lạnh sảng khoái, mang lại trải nghiệm chuẩn vị đường phố Việt.',
    ingredients_text: '01 Bánh Mì Đặc Biệt BÁNH MÌ 0 + 01 Ly Trà Quất Mật Ong tươi mát lạnh.',
    price: 55000,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    is_available: 1,
    is_featured: 1,
    is_active: 1,
  },
];

const DEMO_CATEGORIES: Category[] = [
  { id: 1, code: 'TRADITIONAL', name: 'Bánh Mì Truyền Thống', description: 'Hương vị cổ truyền gắn liền với ký ức ẩm thực Sài Gòn', display_order: 1, is_active: 1, product_count: 2 },
  { id: 2, code: 'SIGNATURE', name: 'Đặc Biệt & Thịt Nướng', description: 'Dòng bánh mì thượng hạng đầy ắp nhân sốt độc quyền', display_order: 2, is_active: 1, product_count: 2 },
  { id: 3, code: 'COMBO', name: 'Combo Bánh Mì & Nước', description: 'Lựa chọn trọn vẹn dinh dưỡng cho bữa sáng và trưa tràn đầy năng lượng', display_order: 3, is_active: 1, product_count: 1 },
];

export const api = {
  // Products
  async getProducts(params?: { search?: string; category_id?: number; featured?: boolean; all?: boolean }): Promise<Product[]> {
    try {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.category_id) q.append('category_id', String(params.category_id));
      if (params?.featured) q.append('featured', 'true');
      if (params?.all) q.append('all', 'true');

      const res = await fetch(`${API_BASE}/products?${q.toString()}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return data.data;
    } catch (e) {
      console.warn('API fallback to local product catalog:', e);
      let list = [...DEMO_PRODUCTS];
      if (params?.category_id) list = list.filter(p => p.category_id === params.category_id);
      if (params?.featured) list = list.filter(p => p.is_featured === 1);
      if (params?.search) {
        const s = params.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
      }
      return list;
    }
  },

  async getProductById(id: number | string): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      return data.data;
    } catch (e) {
      const found = DEMO_PRODUCTS.find(p => p.id === Number(id)) || DEMO_PRODUCTS[0];
      return found;
    }
  },

  async createProduct(payload: any): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi tạo sản phẩm');
    return data.data;
  },

  async updateProduct(id: number, payload: any): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật sản phẩm');
    return data.data;
  },

  async deleteProduct(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Lỗi xóa sản phẩm');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.data;
    } catch (e) {
      return DEMO_CATEGORIES;
    }
  },

  // Orders
  async createOrder(payload: {
    customer_name: string;
    customer_phone: string;
    delivery_address?: string;
    fulfillment_type: 'DELIVERY' | 'PICKUP';
    notes?: string;
    payment_method?: 'COD' | 'BANK_TRANSFER';
    items: Array<{ product_id: number; quantity: number }>;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tạo đơn hàng');
    return data.data;
  },

  async getOrders(params?: { status?: string; code?: string }): Promise<Order[]> {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.code) q.append('code', params.code);

    const res = await fetch(`${API_BASE}/orders?${q.toString()}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy đơn hàng');
    return data.data;
  },

  async getOrderDetail(identifier: string | number, phone?: string): Promise<Order> {
    const q = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    const res = await fetch(`${API_BASE}/orders/${identifier}${q}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không tìm thấy thông tin đơn hàng');
    return data.data;
  },

  async updateOrderStatus(id: number, status: string, note?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật trạng thái đơn');
    return data.data;
  },

  // Inventory
  async getIngredients(): Promise<Ingredient[]> {
    const res = await fetch(`${API_BASE}/inventory/ingredients`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy nguyên liệu');
    return data.data;
  },

  async adjustStock(payload: { ingredient_id: number; movement_type: 'IN' | 'OUT' | 'ADJUST'; quantity: number; reason: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi điều chỉnh tồn kho');
    return data.data;
  },

  async getInventoryMovements(ingredient_id?: number): Promise<InventoryMovement[]> {
    const q = ingredient_id ? `?ingredient_id=${ingredient_id}` : '';
    const res = await fetch(`${API_BASE}/inventory/movements${q}`, { headers: getHeaders() });
    const data = await res.json();
    return data.data;
  },

  // Delivery & Shipper
  async assignOrder(order_id: number, shipper_id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/delivery/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ order_id, shipper_id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi điều phối đơn hàng');
    return data.data;
  },

  async getShipperTasks(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/delivery/tasks`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy danh sách giao hàng');
    return data.data;
  },

  async updateShipperTask(assignment_id: number, status: string, note?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/delivery/tasks/${assignment_id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật tiến trình giao hàng');
    return data.data;
  },

  async sendShipperLocation(assignment_id: number, latitude: number, longitude: number): Promise<any> {
    const res = await fetch(`${API_BASE}/delivery/location`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ assignment_id, latitude, longitude }),
    });
    return res.json();
  },

  async getOrderLocation(order_id: number): Promise<{ has_location: boolean; latitude?: number; longitude?: number; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/delivery/location/${order_id}`, { headers: getHeaders() });
      const data = await res.json();
      return data.data;
    } catch (e) {
      return { has_location: false, message: 'Chưa có dữ liệu vị trí giao hàng trực tiếp' };
    }
  },

  // Stats & Settings
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats/dashboard`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy số liệu thống kê');
    return data.data;
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${API_BASE}/stats/settings`, { headers: getHeaders() });
    const data = await res.json();
    return data.data;
  },

  async updateSettings(settings: Record<string, string>): Promise<any> {
    const res = await fetch(`${API_BASE}/stats/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Admin xác nhận đã nhận tiền cho đơn
  async updatePaymentStatus(orderId: number, payment_status: 'PAID' | 'PENDING'): Promise<void> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ payment_status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể cập nhật thanh toán');
  },

  // Image upload
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi tải ảnh lên');
    return data.data.url;
  },

  // Staff list for shipper assignment
  async getStaffList(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/auth/staff`, { headers: getHeaders() });
    const data = await res.json();
    return data.data || [];
  },

  async createShipper(payload: { email: string; password: string; full_name: string; phone?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/staff`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể tạo tài khoản shipper');
    return data.data;
  },

  async resetShipperPassword(id: number, password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/staff/${id}/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể đặt lại mật khẩu');
  }
};
