import { Response } from 'express';
import { db } from '../database/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { restockOrder, canAccessOrder } from '../utils/inventory.js';

export const assignOrder = (req: AuthRequest, res: Response) => {
  try {
    const { order_id, shipper_id } = req.body;
    if (!order_id || !shipper_id) {
      return sendError(res, 'order_id và shipper_id là bắt buộc.', 400);
    }

    const shipper = db.prepare(`
      SELECT u.id, u.full_name, r.code as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND r.code = 'SHIPPER'
    `).get(shipper_id) as any;

    if (!shipper) {
      return sendError(res, 'Người dùng được chỉ định không phải là Shipper hợp lệ.', 400);
    }

    const order = db.prepare('SELECT id, status, order_code, fulfillment_type FROM orders WHERE id = ?').get(order_id) as any;
    if (!order) {
      return sendError(res, 'Không tìm thấy đơn hàng.', 404);
    }
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return sendError(res, 'Đơn hàng đã kết thúc, không thể điều phối.', 400);
    }
    if (order.fulfillment_type !== 'DELIVERY') {
      return sendError(res, 'Đơn lấy tại tiệm không cần shipper.', 400);
    }

    // Insert or update assignment
    db.prepare(`
      INSERT INTO delivery_assignments (order_id, shipper_id, status)
      VALUES (?, ?, 'ASSIGNED')
      ON CONFLICT(order_id) DO UPDATE SET
        shipper_id = excluded.shipper_id,
        status = 'ASSIGNED',
        assigned_at = CURRENT_TIMESTAMP
    `).run(order_id, shipper_id);

    // Update order status to READY_FOR_PICKUP or OUT_FOR_DELIVERY if needed
    db.prepare(`
      INSERT INTO order_events (order_id, event_type, old_status, new_status, note)
      VALUES (?, 'DELIVERY_ASSIGNED', ?, ?, ?)
    `).run(order_id, order.status, order.status, `Đã điều phối đơn cho shipper ${shipper.full_name}`);

    return sendSuccess(res, null, `Đã bàn giao đơn hàng ${order.order_code} cho Shipper ${shipper.full_name}`);
  } catch (error: any) {
    console.error('Lỗi điều phối giao hàng:', error);
    return sendError(res, 'Lỗi điều phối đơn hàng.', 500);
  }
};

export const getShipperTasks = (req: AuthRequest, res: Response) => {
  try {
    const shipperId = req.user?.userId;

    const tasks = db.prepare(`
      SELECT da.*,
             o.order_code, o.customer_name, o.customer_phone, o.delivery_address,
             o.total_amount, o.payment_method, o.payment_status, o.notes, o.status as order_status, o.created_at as order_created_at
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      WHERE da.shipper_id = ?
      ORDER BY da.assigned_at DESC
    `).all(shipperId);

    return sendSuccess(res, tasks);
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy danh sách đơn giao.', 500);
  }
};

export const updateTaskStatus = (req: AuthRequest, res: Response) => {
  try {
    const { assignment_id } = req.params;
    const { status, note } = req.body;
    const shipperId = req.user?.userId;

    const validStatuses = ['IN_TRANSIT', 'DELIVERED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Trạng thái giao hàng không hợp lệ.', 400);
    }

    const assignment = db.prepare(`
      SELECT da.*, o.order_code, o.status as order_status
      FROM delivery_assignments da
      JOIN orders o ON da.order_id = o.id
      WHERE da.id = ? AND da.shipper_id = ?
    `).get(assignment_id, shipperId) as any;

    if (!assignment) {
      return sendError(res, 'Không tìm thấy lượt giao hàng thuộc về bạn.', 404);
    }

    if (assignment.order_status === 'COMPLETED' || assignment.order_status === 'CANCELLED') {
      return sendError(res, 'Đơn hàng đã kết thúc, không thể cập nhật.', 400);
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare(`
        UPDATE delivery_assignments
        SET status = ?,
            completed_at = CASE WHEN ? IN ('DELIVERED', 'FAILED') THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE id = ?
      `).run(status, status, assignment.id);

      // Sync order status
      let orderNewStatus = 'OUT_FOR_DELIVERY';
      if (status === 'DELIVERED') orderNewStatus = 'COMPLETED';
      if (status === 'FAILED') orderNewStatus = 'CANCELLED';

      if (orderNewStatus === 'CANCELLED') {
        restockOrder(assignment.order_id, assignment.order_code);
      }

      db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(orderNewStatus, assignment.order_id);

      // Record event
      db.prepare(`
        INSERT INTO order_events (order_id, event_type, old_status, new_status, note)
        VALUES (?, 'DELIVERY_UPDATE', ?, ?, ?)
      `).run(assignment.order_id, assignment.order_status, orderNewStatus, note || `Shipper cập nhật trạng thái: ${status}`);

      db.exec('COMMIT;');

      return sendSuccess(res, null, 'Cập nhật tiến trình giao hàng thành công!');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    return sendError(res, 'Lỗi cập nhật tiến trình giao.', 500);
  }
};

export const recordLocation = (req: AuthRequest, res: Response) => {
  try {
    const { assignment_id, latitude, longitude } = req.body;
    const shipperId = req.user?.userId;

    if (!assignment_id || latitude === undefined || longitude === undefined) {
      return sendError(res, 'Thiếu thông tin tọa độ GPS hoặc lượt giao.', 400);
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return sendError(res, 'Tọa độ GPS không hợp lệ.', 400);
    }

    const assignment = db.prepare(`
      SELECT id FROM delivery_assignments
      WHERE id = ? AND shipper_id = ?
    `).get(assignment_id, shipperId);

    if (!assignment) {
      return sendError(res, 'Lượt giao không hợp lệ hoặc bạn không có quyền cập nhật.', 403);
    }

    db.prepare(`
      INSERT INTO delivery_locations (assignment_id, latitude, longitude)
      VALUES (?, ?, ?)
    `).run(assignment_id, Number(latitude), Number(longitude));

    return sendSuccess(res, null, 'Đã cập nhật vị trí thời gian thực.');
  } catch (error: any) {
    return sendError(res, 'Lỗi ghi nhận vị trí GPS.', 500);
  }
};

export const getLatestLocation = (req: AuthRequest, res: Response) => {
  try {
    const { order_id } = req.params;

    const orderRow = db.prepare('SELECT id, user_id FROM orders WHERE id = ?').get(order_id) as any;
    if (!orderRow) {
      return sendError(res, 'Không tìm thấy đơn hàng.', 404);
    }
    if (!canAccessOrder(req.user, orderRow)) {
      return sendError(res, 'Bạn không có quyền xem vị trí của đơn này.', 403);
    }

    const assignment = db.prepare('SELECT id, status FROM delivery_assignments WHERE order_id = ?').get(order_id) as any;
    if (!assignment) {
      return sendSuccess(res, {
        has_location: false,
        message: 'Chưa có dữ liệu vị trí giao hàng trực tiếp',
      });
    }

    const latest = db.prepare(`
      SELECT latitude, longitude, recorded_at
      FROM delivery_locations
      WHERE assignment_id = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(assignment.id) as any;

    if (!latest) {
      return sendSuccess(res, {
        has_location: false,
        message: 'Chưa có dữ liệu vị trí giao hàng trực tiếp',
      });
    }

    return sendSuccess(res, {
      has_location: true,
      latitude: latest.latitude,
      longitude: latest.longitude,
      recorded_at: latest.recorded_at,
    });
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy vị trí giao hàng.', 500);
  }
};
