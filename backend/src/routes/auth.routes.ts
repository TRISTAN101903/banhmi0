import { Router } from 'express';
import { register, login, getProfile, updateProfile, getStaffList, createShipper, resetShipperPassword } from '../controllers/auth.controller.js';
import { authenticate, requireRoles, loginRateLimiter } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', loginRateLimiter, register);
router.post('/login', loginRateLimiter, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/staff', authenticate, requireRoles('ADMIN'), getStaffList);

router.post('/staff', authenticate, requireRoles('ADMIN'), createShipper);
router.put('/staff/:id/password', authenticate, requireRoles('ADMIN'), resetShipperPassword);

export default router;
