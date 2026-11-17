import { Router } from 'express';
import { getDashboardStats, getSettings, updateSettings } from '../controllers/stats.controller.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/dashboard', authenticate, requireRoles('ADMIN', 'STAFF'), getDashboardStats);
router.get('/settings', getSettings);
router.put('/settings', authenticate, requireRoles('ADMIN'), updateSettings);

export default router;
