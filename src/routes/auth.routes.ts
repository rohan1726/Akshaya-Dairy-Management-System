import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, loginSchema, registerSchema } from '../utils/validation';

const router = Router();

router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;

