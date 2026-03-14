import { Response } from 'express';
import db from '../config/database';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/types';

export class MilkCollectionAdminController {
  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can update collection status' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const [collection] = await db('milk_collections')
        .where('id', id)
        .update({
          status,
          modified_at: new Date(),
          modified_by: req.user.userId,
        })
        .returning('*');

      if (!collection) {
        res.status(404).json({ success: false, message: 'Collection not found' });
        return;
      }

      // Log activity
      await db('activity_logs').insert({
        user_id: req.user.userId,
        action: 'update_collection_status',
        entity_type: 'milk_collection',
        entity_id: collection.id,
        description: `Updated collection status to ${status}`,
        new_values: collection,
      });

      res.json({
        success: true,
        message: 'Collection status updated successfully',
        data: collection,
      });
    } catch (error: any) {
      logger.error('Update collection status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update collection status',
      });
    }
  }
}

export default new MilkCollectionAdminController();

