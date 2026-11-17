export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'ADMIN' | 'STAFF' | 'SHIPPER' | 'CUSTOMER';
}

export interface Category {
  id: number;
  code: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: number;
  product_count?: number;
}

export interface RecipeItem {
  id?: number;
  ingredient_id: number;
  ingredient_name?: string;
  unit?: string;
  required_quantity: number;
  current_stock?: number;
}

export interface Product {
  id: number;
  code: string;
  category_id: number;
  category_name?: string;
  category_code?: string;
  name: string;
  description: string;
  ingredients_text: string;
  price: number;
  image_url: string;
  is_available: number;
  is_featured: number;
  is_active: number;
  recipe?: RecipeItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface OrderEvent {
  id: number;
  order_id: number;
  event_type: string;
  old_status?: string;
  new_status?: string;
  note?: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_code: string;
  user_id?: number;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  fulfillment_type: 'DELIVERY' | 'PICKUP';
  notes?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  status: OrderStatus;
  is_inventory_deducted: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  events?: OrderEvent[];
  shipper_name?: string;
  delivery?: {
    shipper_name: string;
    shipper_phone: string;
    status: string;
  };
}

export interface Ingredient {
  id: number;
  code: string;
  name: string;
  unit: string;
  current_stock: number;
  warning_threshold: number;
  cost_price: number;
  is_low_stock?: number | boolean;
  updated_at: string;
}

export interface InventoryMovement {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  order_id?: number;
  order_code?: string;
  movement_type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  created_at: string;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  completed_orders: number;
  active_products: number;
  low_stock_ingredients: number;
  recent_orders: Order[];
  top_products: Array<{
    product_name: string;
    total_sold: number;
    total_sales: number;
  }>;
}
