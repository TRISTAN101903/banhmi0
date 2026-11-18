import { Router } from 'express';
import { register, login, getProfile, updateProfile, getStaffList } from '../controllers/auth.controller.js';
import { authenticate, requireRoles, loginRateLimiter } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', loginRateLimiter, register);
router.post('/login', loginRateLimiter, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/staff', authenticate, requireRoles('ADMIN'), getStaffList);

export default router;
