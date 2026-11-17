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

export const updateSettings = (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    const updateStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');

    for (const [key, value] of Object.entries(settings)) {
      updateStmt.run(key, String(value));
    }

    return sendSuccess(res, null, 'Cập nhật cài đặt cửa hàng thành công!');
  } catch (error: any) {
    return sendError(res, 'Lỗi cập nhật cài đặt.', 500);
  }
};
