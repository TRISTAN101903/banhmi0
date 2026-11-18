import { Router } from 'express';
import { createOrder, getOrders, getOrderDetail, updateOrderStatus } from '../controllers/order.controller.js';
import { authenticate, optionalAuthenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Phải đăng nhập mới được đặt hàng
router.post('/', authenticate, createOrder);

// Authenticated user gets orders list (filtered by role)
router.get('/', authenticate, getOrders);

// Tracking or detail by ID or order_code
router.get('/:identifier', optionalAuthenticate, getOrderDetail);

// Updating order status (Admin, Staff, or Shipper)
router.patch('/:id/status', authenticate, requireRoles('ADMIN', 'STAFF', 'SHIPPER'), updateOrderStatus);

export default router;
