import { Response } from 'express';
import { db } from '../database/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getDashboardStats = (req: AuthRequest, res: Response) => {
  try {
    // 1. Total revenue (completed orders)
    const revenueRow = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'COMPLETED'").get() as any;

    // 2. Orders count by status
    const totalOrdersRow = db.prepare('SELECT COUNT(id) as total FROM orders').get() as any;
    const pendingOrdersRow = db.prepare("SELECT COUNT(id) as total FROM orders WHERE status = 'PENDING'").get() as any;
    const processingOrdersRow = db.prepare("SELECT COUNT(id) as total FROM orders WHERE status IN ('CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY')").get() as any;
    const completedOrdersRow = db.prepare("SELECT COUNT(id) as total FROM orders WHERE status = 'COMPLETED'").get() as any;

    // 3. Products
    const totalProductsRow = db.prepare('SELECT COUNT(id) as total FROM products WHERE is_active = 1').get() as any;

    // 4. Low stock ingredients
    const lowStockRow = db.prepare('SELECT COUNT(id) as total FROM ingredients WHERE current_stock <= warning_threshold').get() as any;

    // 5. Recent 5 orders
    const recentOrders = db.prepare(`
      SELECT o.id, o.order_code, o.customer_name, o.total_amount, o.status, o.created_at, o.fulfillment_type
      FROM orders o
      ORDER BY o.id DESC
      LIMIT 6
    `).all();

    // 6. Top selling items
    const topProducts = db.prepare(`
      SELECT oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'CANCELLED'
      GROUP BY oi.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `).all();

    return sendSuccess(res, {
      total_revenue: revenueRow.total,
      total_orders: totalOrdersRow.total,
      pending_orders: pendingOrdersRow.total,
      processing_orders: processingOrdersRow.total,
      completed_orders: completedOrdersRow.total,
      active_products: totalProductsRow.total,
      low_stock_ingredients: lowStockRow.total,
      recent_orders: recentOrders,
      top_products: topProducts,
    });
  } catch (error: any) {
    console.error('Lỗi lấy thống kê:', error);
    return sendError(res, 'Lỗi lấy số liệu thống kê.', 500);
  }
};

export const getSettings = (req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value, description FROM settings').all() as any[];
    const settingsMap: Record<string, string> = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
    return sendSuccess(res, settingsMap);
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy cài đặt cửa hàng.', 500);
  }
};

const ALLOWED_SETTINGS = [
  'STORE_NAME', 'STORE_SLOGAN', 'DESIGN_SIGNATURE', 'STORE_PHONE', 'STORE_ADDRESS', 'STORE_HOURS',
  'DELIVERY_BASE_FEE', 'DELIVERY_FREE_THRESHOLD',
  'STORE_LOGO_URL', 'STORE_SHOWCASE_URL', 'STORE_CONCEPT_IMAGE_URL',
  'PAYMENT_QR_URL', 'PAYMENT_BANK_NAME', 'PAYMENT_ACCOUNT_NO', 'PAYMENT_ACCOUNT_NAME',
];
const NUMERIC_SETTINGS = ['DELIVERY_BASE_FEE', 'DELIVERY_FREE_THRESHOLD'];
const URL_SETTINGS = ['STORE_LOGO_URL', 'STORE_SHOWCASE_URL', 'STORE_CONCEPT_IMAGE_URL', 'PAYMENT_QR_URL'];

export const updateSettings = (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return sendError(res, 'Dữ liệu cài đặt không hợp lệ.', 400);
    }

    // Chỉ cho phép các khóa đã biết, kiểm tra giá trị trước khi ghi
    for (const [key, value] of Object.entries(settings)) {
      if (!ALLOWED_SETTINGS.includes(key)) {
        return sendError(res, `Khóa cài đặt không được phép: ${key}`, 400);
      }
      const str = String(value);
      if (str.length > 500) {
        return sendError(res, `Giá trị của ${key} quá dài.`, 400);
      }
      if (NUMERIC_SETTINGS.includes(key) && (!Number.isFinite(Number(str)) || Number(str) < 0)) {
        return sendError(res, `${key} phải là số không âm.`, 400);
      }
      // Chỉ nhận đường dẫn nội bộ hoặc https, chặn javascript:/data: URL
      if (URL_SETTINGS.includes(key) && str !== '' && !(str.startsWith('/') && !str.startsWith('//')) && !/^https:\/\//i.test(str)) {
        return sendError(res, `${key} phải là đường dẫn nội bộ hoặc https.`, 400);
      }
    }

    const updateStmt = db.prepare('INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP');
    for (const [key, value] of Object.entries(settings)) {
      updateStmt.run(key, String(value));
    }

    return sendSuccess(res, null, 'Cập nhật cài đặt cửa hàng thành công!');
  } catch (error: any) {
    return sendError(res, 'Lỗi cập nhật cài đặt.', 500);
  }
};
