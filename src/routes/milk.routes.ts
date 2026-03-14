import { Router } from 'express';
import milkController from '../controllers/milk.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, milkCollectionSchema } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.post('/collections', validate(milkCollectionSchema), milkController.createCollection.bind(milkController));
router.get('/collections', milkController.getCollections.bind(milkController));
router.get('/dashboard/stats', milkController.getDashboardStats.bind(milkController));
router.get('/price/today', milkController.getTodayPrice.bind(milkController));

export default router;

