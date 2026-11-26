import { Response } from 'express';
import { db } from '../database/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { restockOrder, canAccessOrder } from '../utils/inventory.js';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED'];
const MAX_QTY_PER_ITEM = 50;
const MAX_ITEMS = 30;
const PHONE_RE = /^[0-9+()\-\s.]{8,20}$/;

// Generate unique order code: BM0-YYMMDD-XXXX
const generateOrderCode = (): string => {
  const date = new Date();
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BM0-${y}${m}${d}-${randomPart}`;
};

export const createOrder = (req: AuthRequest, res: Response) => {
  try {
    const { customer_name, customer_phone, delivery_address, fulfillment_type, notes, items } = req.body;

    if (!customer_name || !customer_phone) {
      return sendError(res, 'Tên khách hàng và số điện thoại là bắt buộc.', 400);
    }

    if (typeof customer_name !== 'string' || customer_name.trim().length > 100) {
      return sendError(res, 'Tên khách hàng không hợp lệ.', 400);
    }
    if (typeof customer_phone !== 'string' || !PHONE_RE.test(customer_phone.trim())) {
      return sendError(res, 'Số điện thoại không hợp lệ.', 400);
    }
    if ((delivery_address && String(delivery_address).length > 300) || (notes && String(notes).length > 500)) {
      return sendError(res, 'Địa chỉ hoặc ghi chú quá dài.', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
      return sendError(res, `Giỏ hàng phải có từ 1 đến ${MAX_ITEMS} món.`, 400);
    }

    const fulfillment = fulfillment_type === 'PICKUP' ? 'PICKUP' : 'DELIVERY';
    if (fulfillment === 'DELIVERY' && !delivery_address) {
      return sendError(res, 'Vui lòng cung cấp địa chỉ giao hàng.', 400);
    }

    // Hình thức thanh toán: tiền mặt hoặc chuyển khoản (chỉ khi admin đã tải mã QR)
    const paymentMethod = req.body.payment_method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'COD';
    if (paymentMethod === 'BANK_TRANSFER') {
      const qr = db.prepare("SELECT value FROM settings WHERE key = 'PAYMENT_QR_URL'").get() as any;
      if (!qr || !qr.value) {
        return sendError(res, 'Cửa hàng chưa mở thanh toán chuyển khoản. Vui lòng chọn tiền mặt.', 400);
      }
    }

    // CRITICAL: SERVER-SIDE PRICE RECALCULATION
    // Query actual product prices from database
    let subtotal = 0;
    const validatedItems: Array<{
      product_id: number;
      product_name: string;
      unit_price: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const prod = db.prepare('SELECT id, name, price, is_available, is_active FROM products WHERE id = ?').get(item.product_id) as any;
      if (!prod || !prod.is_active || !prod.is_available) {
        return sendError(res, `Sản phẩm (ID: ${item.product_id}) hiện không khả dụng để đặt hàng.`, 400);
      }

      const qty = Math.min(MAX_QTY_PER_ITEM, Math.max(1, parseInt(item.quantity || 1, 10) || 1));
      const itemSubtotal = prod.price * qty;
      subtotal += itemSubtotal;

      validatedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        unit_price: prod.price,
        quantity: qty,
        subtotal: itemSubtotal,
      });
    }

    // Delivery fee policy from settings
    let delivery_fee = 0;
    if (fulfillment === 'DELIVERY') {
      const baseFeeSetting = db.prepare("SELECT value FROM settings WHERE key = 'DELIVERY_BASE_FEE'").get() as any;
      const freeThresholdSetting = db.prepare("SELECT value FROM settings WHERE key = 'DELIVERY_FREE_THRESHOLD'").get() as any;

      const baseFee = baseFeeSetting ? Number(baseFeeSetting.value) : 15000;
      const freeThreshold = freeThresholdSetting ? Number(freeThresholdSetting.value) : 150000;

      delivery_fee = subtotal >= freeThreshold ? 0 : baseFee;
    }

    const total_amount = subtotal + delivery_fee;
    const order_code = generateOrderCode();
    const userId = req.user?.userId || null;

    // Database transaction to write order and items
    db.exec('BEGIN TRANSACTION;');
    try {
      const orderStmt = db.prepare(`
        INSERT INTO orders (
          order_code, user_id, customer_name, customer_phone, delivery_address,
          fulfillment_type, notes, subtotal, delivery_fee, total_amount,
          payment_status, payment_method, status, is_inventory_deducted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 'PENDING', 0)
      `);

      const orderResult = orderStmt.run(
        order_code,
        userId,
        customer_name.trim(),
        customer_phone.trim(),
        delivery_address || null,
        fulfillment,
        notes || null,
        subtotal,
        delivery_fee,
        total_amount,
        paymentMethod
      );

      const orderId = Number(orderResult.lastInsertRowid);

      // Insert snapshot order items
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const vItem of validatedItems) {
        itemStmt.run(orderId, vItem.product_id, vItem.product_name, vItem.unit_price, vItem.quantity, vItem.subtotal);
      }

      // Record initial event
      db.prepare(`
        INSERT INTO order_events (order_id, event_type, old_status, new_status, note)
        VALUES (?, 'CREATED', NULL, 'PENDING', 'Khách hàng tạo đơn hàng qua website')
      `).run(orderId);

      db.exec('COMMIT;');

      return sendSuccess(res, {
        order_id: orderId,
        order_code,
        subtotal,
        delivery_fee,
        total_amount,
        fulfillment_type: fulfillment,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      }, 'Đặt hàng thành công! BÁNH MÌ 0 sẽ chuẩn bị món ngay cho bạn.', 201);
    } catch (err: any) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    console.error('Lỗi tạo đơn hàng:', error);
    return sendError(res, 'Không thể tạo đơn hàng. Vui lòng thử lại.', 500);
  }
};

export const getOrders = (req: AuthRequest, res: Response) => {
  try {
    const { status, code } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    let query = `
      SELECT o.*,
             COUNT(oi.id) as total_items,
             da.shipper_id,
             u_ship.full_name as shipper_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN delivery_assignments da ON o.id = da.order_id
      LEFT JOIN users u_ship ON da.shipper_id = u_ship.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Customers only see their own orders
    if (userRole === 'CUSTOMER') {
      query += ` AND o.user_id = ?`;
      params.push(userId);
    }

    // Shipper chỉ thấy đơn được giao cho mình
    if (userRole === 'SHIPPER') {
      query += ` AND da.shipper_id = ?`;
      params.push(userId);
    }

    if (status && typeof status === 'string') {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    if (code && typeof code === 'string') {
      query += ` AND o.order_code LIKE ?`;
      params.push(`%${code.trim()}%`);
    }

    query += ` GROUP BY o.id ORDER BY o.id DESC`;

    const orders = db.prepare(query).all(...params);
    return sendSuccess(res, orders);
  } catch (error: any) {
    console.error('Lỗi lấy danh sách đơn:', error);
    return sendError(res, 'Lỗi truy xuất danh sách đơn hàng.', 500);
  }
};

export const getOrderDetail = (req: AuthRequest, res: Response) => {
  try {
    const { identifier } = req.params; // Can be ID or order_code
    let order: any;

    if (!isNaN(Number(identifier))) {
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(identifier));
    } else {
      order = db.prepare('SELECT * FROM orders WHERE order_code = ?').get(identifier);
    }

    if (!order) {
      return sendError(res, 'Không tìm thấy đơn hàng.', 404);
    }

    // Access control: chỉ chủ đơn, nhân sự cửa hàng, hoặc shipper được giao mới xem được
    if (!canAccessOrder(req.user, order)) {
      return sendError(res, 'Bạn không có quyền xem đơn hàng này.', 403);
    }

    const items = db.prepare(`
      SELECT oi.*, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    const events = db.prepare(`
      SELECT * FROM order_events WHERE order_id = ? ORDER BY id ASC
    `).all(order.id);

    const delivery = db.prepare(`
      SELECT da.*, u.full_name as shipper_name, u.phone as shipper_phone
      FROM delivery_assignments da
      JOIN users u ON da.shipper_id = u.id
      WHERE da.order_id = ?
    `).get(order.id);

    return sendSuccess(res, {
      ...order,
      items,
      events,
      delivery: delivery || null,
    });
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy chi tiết đơn hàng.', 500);
  }
};

// UPDATE ORDER STATUS + SAFE SINGLE-DEDUCTION INVENTORY
export const updateOrderStatus = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Trạng thái đơn hàng không hợp lệ.', 400);
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return sendError(res, 'Không tìm thấy đơn hàng.', 404);
    }

    const oldStatus = order.status;

    // Shipper chỉ được cập nhật đơn được giao cho mình, và chỉ sang các trạng thái giao hàng
    if (req.user?.role === 'SHIPPER') {
      if (!canAccessOrder(req.user, order)) {
        return sendError(res, 'Bạn không được giao đơn hàng này.', 403);
      }
      if (!['OUT_FOR_DELIVERY', 'COMPLETED'].includes(status)) {
        return sendError(res, 'Shipper chỉ được chuyển đơn sang Đang giao hoặc Hoàn thành.', 403);
      }
    }

    // Máy trạng thái: đơn đã hoàn thành/hủy không đổi nữa; chỉ đi tiến hoặc hủy
    if (oldStatus === 'COMPLETED' || oldStatus === 'CANCELLED') {
      return sendError(res, 'Đơn hàng đã kết thúc, không thể đổi trạng thái.', 400);
    }
    if (status === oldStatus) {
      return sendError(res, 'Đơn hàng đã ở trạng thái này.', 400);
    }
    if (status !== 'CANCELLED' && STATUS_FLOW.indexOf(status) < STATUS_FLOW.indexOf(oldStatus)) {
      return sendError(res, 'Không thể lùi trạng thái đơn hàng.', 400);
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      // Check if we need to auto-deduct inventory
      // Condition: status transitions to CONFIRMED or PREPARING and is_inventory_deducted === 0
      const shouldDeduct = status !== 'CANCELLED' && order.is_inventory_deducted === 0;

      if (shouldDeduct) {
        // Query all order items
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(order.id) as any[];

        for (const it of items) {
          // Find recipe BOM for this product
          const recipe = db.prepare('SELECT ingredient_id, required_quantity FROM recipe_items WHERE product_id = ?').all(it.product_id) as any[];

          for (const ing of recipe) {
            const totalRequired = ing.required_quantity * it.quantity;
            const currentIng = db.prepare('SELECT id, current_stock FROM ingredients WHERE id = ?').get(ing.ingredient_id) as any;

            if (currentIng) {
              const prevStock = currentIng.current_stock;
              const newStock = Math.max(0, prevStock - totalRequired);

              // Update stock
              db.prepare('UPDATE ingredients SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(newStock, currentIng.id);

              // Log inventory movement
              db.prepare(`
                INSERT INTO inventory_movements (ingredient_id, order_id, movement_type, quantity, previous_stock, new_stock, reason)
                VALUES (?, ?, 'OUT', ?, ?, ?, ?)
              `).run(currentIng.id, order.id, totalRequired, prevStock, newStock, `Trừ kho theo công thức cho đơn ${order.order_code}`);
            }
          }
        }

        // Mark order inventory as deducted
        db.prepare('UPDATE orders SET is_inventory_deducted = 1 WHERE id = ?').run(order.id);
      }

      // Đơn tiền mặt hoàn thành nghĩa là đã thu tiền
      if (status === 'COMPLETED') {
        db.prepare("UPDATE orders SET payment_status = 'PAID' WHERE id = ? AND payment_method = 'COD'").run(order.id);
      }

      // Hủy đơn đã trừ kho -> hoàn kho
      if (status === 'CANCELLED') {
        restockOrder(order.id, order.order_code);
      }

      // Update order status
      db.prepare(`
        UPDATE orders
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, order.id);

      // Record audit event
      db.prepare(`
        INSERT INTO order_events (order_id, event_type, old_status, new_status, note)
        VALUES (?, 'STATUS_CHANGE', ?, ?, ?)
      `).run(order.id, oldStatus, status, note || `Cập nhật trạng thái thành ${status}`);

      db.exec('COMMIT;');

      const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
      return sendSuccess(res, updatedOrder, 'Cập nhật trạng thái đơn thành công!');
    } catch (err: any) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    console.error('Lỗi cập nhật trạng thái đơn:', error);
    return sendError(res, 'Lỗi cập nhật trạng thái đơn hàng.', 500);
  }
};

// Admin/Staff xác nhận đã nhận tiền (chuyển khoản hoặc tiền mặt)
export const updatePaymentStatus = (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    if (!['PAID', 'PENDING'].includes(payment_status)) {
      return sendError(res, 'Trạng thái thanh toán không hợp lệ.', 400);
    }
    const order = db.prepare('SELECT id, order_code, payment_status FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return sendError(res, 'Không tìm thấy đơn hàng.', 404);
    }
    if (order.payment_status !== payment_status) {
      db.prepare('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(payment_status, order.id);
      db.prepare(`
        INSERT INTO order_events (order_id, event_type, old_status, new_status, note)
        VALUES (?, 'PAYMENT_UPDATE', ?, ?, ?)
      `).run(order.id, order.payment_status, payment_status,
        payment_status === 'PAID' ? 'Cửa hàng đã xác nhận nhận tiền' : 'Hủy xác nhận thanh toán');
    }
    return sendSuccess(res, { id: order.id, payment_status }, 'Đã cập nhật thanh toán.');
  } catch (error: any) {
    console.error('Lỗi cập nhật thanh toán:', error);
    return sendError(res, 'Lỗi cập nhật thanh toán.', 500);
  }
};
