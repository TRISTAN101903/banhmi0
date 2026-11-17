import { Router } from 'express';
import { assignOrder, getShipperTasks, updateTaskStatus, recordLocation, getLatestLocation } from '../controllers/delivery.controller.js';
import { authenticate, optionalAuthenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Admin assigns delivery
router.post('/assign', authenticate, requireRoles('ADMIN', 'STAFF'), assignOrder);

// Shipper views tasks
router.get('/tasks', authenticate, requireRoles('SHIPPER', 'ADMIN'), getShipperTasks);

// Shipper updates delivery progress
router.patch('/tasks/:assignment_id/status', authenticate, requireRoles('SHIPPER', 'ADMIN'), updateTaskStatus);

// Shipper updates GPS
router.post('/location', authenticate, requireRoles('SHIPPER'), recordLocation);

// Customer or Admin tracks live location
router.get('/location/:order_id', optionalAuthenticate, getLatestLocation);

export default router;
