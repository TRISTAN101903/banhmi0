import { Router } from 'express';
import { getIngredients, createIngredient, updateIngredient, adjustStock, getMovements } from '../controllers/inventory.controller.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate, requireRoles('ADMIN', 'STAFF'));

router.get('/ingredients', getIngredients);
router.post('/ingredients', createIngredient);
router.put('/ingredients/:id', updateIngredient);
router.post('/adjust', adjustStock);
router.get('/movements', getMovements);

export default router;
