import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, requireRoles('ADMIN', 'STAFF'), createProduct);
router.put('/:id', authenticate, requireRoles('ADMIN', 'STAFF'), updateProduct);
router.delete('/:id', authenticate, requireRoles('ADMIN'), deleteProduct);

export default router;
