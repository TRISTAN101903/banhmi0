import { Router } from 'express';
import { getCategories, createCategory, updateCategory } from '../controllers/category.controller.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, requireRoles('ADMIN'), createCategory);
router.put('/:id', authenticate, requireRoles('ADMIN'), updateCategory);

export default router;
