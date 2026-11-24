import { db } from '../database/db.js';

// Hoàn lại kho cho đơn đã bị trừ kho (gọi bên trong transaction của người gọi).
// Dựa trên chính các dòng xuất kho (OUT) đã ghi cho đơn này nên hoàn đúng số đã trừ.
export const restockOrder = (orderId: number, orderCode: string) => {
  const order = db.prepare('SELECT is_inventory_deducted FROM orders WHERE id = ?').get(orderId) as any;
  if (!order || order.is_inventory_deducted !== 1) return;

  const outs = db.prepare(
    "SELECT ingredient_id, quantity FROM inventory_movements WHERE order_id = ? AND movement_type = 'OUT'"
  ).all(orderId) as any[];

  for (const m of outs) {
    const ing = db.prepare('SELECT id, current_stock FROM ingredients WHERE id = ?').get(m.ingredient_id) as any;
    if (!ing) continue;
    const newStock = ing.current_stock + m.quantity;
    db.prepare('UPDATE ingredients SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStock, ing.id);
    db.prepare(`
      INSERT INTO inventory_movements (ingredient_id, order_id, movement_type, quantity, previous_stock, new_stock, reason)
      VALUES (?, ?, 'IN', ?, ?, ?, ?)
    `).run(ing.id, orderId, m.quantity, ing.current_stock, newStock, `Hoàn kho do hủy đơn ${orderCode}`);
  }
  db.prepare('UPDATE orders SET is_inventory_deducted = 0 WHERE id = ?').run(orderId);
};

// Quyền xem một đơn hàng: Admin/Staff xem tất cả, khách chỉ xem đơn của mình, shipper chỉ xem đơn được giao cho mình.
export const canAccessOrder = (user: { userId: number; role: string } | undefined, order: any): boolean => {
  if (!user || !order) return false;
  if (user.role === 'ADMIN' || user.role === 'STAFF') return true;
  if (user.role === 'CUSTOMER') return order.user_id === user.userId;
  if (user.role === 'SHIPPER') {
    const a = db.prepare('SELECT id FROM delivery_assignments WHERE order_id = ? AND shipper_id = ?').get(order.id, user.userId);
    return Boolean(a);
  }
  return false;
};
