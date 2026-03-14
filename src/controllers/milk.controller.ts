import { Response } from 'express';
import milkService from '../services/milk.service';
import { validate, milkCollectionSchema, milkPriceSchema } from '../utils/validation';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export class MilkController {
  async createCollection(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const collectionData = {
        ...req.body,
        driver_id: req.user.userId, // Get from authenticated user
        created_by: req.user.userId,
      };

      const collection = await milkService.createCollection(collectionData);

      res.status(201).json({
        success: true,
        message: 'Milk collection recorded successfully',
        data: collection,
      });
    } catch (error: any) {
      logger.error('Create collection error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create collection',
      });
    }
  }

  async getCollections(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const filters: any = {
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      // Role-based filtering
      if (req.user.role === 'driver') {
        filters.driver_id = req.user.userId;
      } else if (req.user.role === 'vendor') {
        // Get vendor's center_id
        const db = (await import('../config/database')).default;
        const center = await db('dairy_centers')
          .where('user_id', req.user.userId)
          .first();
        if (center) {
          filters.vendor_id = center.id;
        }
      }

      if (req.query.collection_date) {
        filters.collection_date = new Date(req.query.collection_date as string);
      }
      if (req.query.collection_time) {
        filters.collection_time = req.query.collection_time;
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }

      const collections = await milkService.getCollections(filters);

      res.json({
        success: true,
        data: collections,
      });
    } catch (error: any) {
      logger.error('Get collections error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch collections',
      });
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const stats = await milkService.getDashboardStats(date);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
      });
    }
  }

  async getTodayPrice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const milkType = (req.query.milk_type as any) || 'mix_milk';
      const price = await milkService.getTodayPrice(milkType);

      if (!price) {
        res.status(404).json({
          success: false,
          message: 'Milk price not set for today',
        });
        return;
      }

      res.json({
        success: true,
        data: price,
      });
    } catch (error: any) {
      logger.error('Get today price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch price',
      });
    }
  }
}

export default new MilkController();

