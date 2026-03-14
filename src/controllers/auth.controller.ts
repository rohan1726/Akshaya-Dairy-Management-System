import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { validate, loginSchema, registerSchema } from '../utils/validation';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { mobileOrEmail, password } = req.body;

      const result = await authService.login(mobileOrEmail, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const user = await authService.register(userData);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: user,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const user = await authService.getCurrentUser(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      logger.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information',
      });
    }
  }
}

export default new AuthController();

