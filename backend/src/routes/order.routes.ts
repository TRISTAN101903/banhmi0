import { Router } from 'express';
import { createOrder, getOrders, getOrderDetail, updateOrderStatus, updatePaymentStatus } from '../controllers/order.controller.js';
import { authenticate, optionalAuthenticate, requireRoles, guestOrderLimiter, trackLimiter } from '../middlewares/auth.middleware.js';

const router = Router();

// Khách không cần đăng nhập vẫn đặt hàng được (có giới hạn tần suất)
router.post('/', guestOrderLimiter, optionalAuthenticate, createOrder);

// Authenticated user gets orders list (filtered by role)
router.get('/', authenticate, getOrders);

// Tracking or detail by ID or order_code
// Khách vãng lai tra cứu bằng mã đơn + số điện thoại đặt hàng
router.get('/:identifier', trackLimiter, optionalAuthenticate, getOrderDetail);

// Updating order status (Admin, Staff, or Shipper)
router.patch('/:id/status', authenticate, requireRoles('ADMIN', 'STAFF', 'SHIPPER'), updateOrderStatus);

// Xác nhận thanh toán (Admin, Staff)
router.patch('/:id/payment', authenticate, requireRoles('ADMIN', 'STAFF'), updatePaymentStatus);

export default router;
