import { Response } from 'express';
import db from '../config/database';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export class DairyCenterController {
  async createCenter(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can create centers' });
        return;
      }

      const { dairy_name, contact_mobile, email, password, address, first_name, last_name } = req.body;

      // Create user first
      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const [user] = await db('users')
        .insert({
          mobile_no: contact_mobile,
          email: email || null,
          password: hashedPassword,
          role: 'vendor',
          first_name: first_name || dairy_name,
          last_name: last_name || '',
          is_active: true,
          is_verified: true,
        })
        .returning('*');

      // Create center
      const qrCode = `DC-${uuidv4().substring(0, 8).toUpperCase()}`;
      const [center] = await db('dairy_centers')
        .insert({
          user_id: user.id,
          dairy_name,
          contact_mobile,
          address: address || {},
          qr_code: qrCode,
          is_active: true,
          created_by: req.user.userId,
        })
        .returning('*');

      // Log activity
      await db('activity_logs').insert({
        user_id: req.user.userId,
        action: 'create_dairy_center',
        entity_type: 'dairy_center',
        entity_id: center.id,
        description: `Created dairy center: ${dairy_name}`,
        new_values: center,
      });

      res.status(201).json({
        success: true,
        message: 'Dairy center created successfully',
        data: { ...center, user },
      });
    } catch (error: any) {
      logger.error('Create center error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create dairy center',
      });
    }
  }

  async updateCenter(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can update centers' });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      const [center] = await db('dairy_centers')
        .where('id', id)
        .update({
          ...updateData,
          modified_at: new Date(),
          modified_by: req.user.userId,
        })
        .returning('*');

      if (!center) {
        res.status(404).json({ success: false, message: 'Dairy center not found' });
        return;
      }

      // Log activity
      await db('activity_logs').insert({
        user_id: req.user.userId,
        action: 'update_dairy_center',
        entity_type: 'dairy_center',
        entity_id: center.id,
        description: `Updated dairy center: ${center.dairy_name}`,
        new_values: center,
      });

      res.json({
        success: true,
        message: 'Dairy center updated successfully',
        data: center,
      });
    } catch (error: any) {
      logger.error('Update center error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update dairy center',
      });
    }
  }

  async toggleStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can toggle center status' });
        return;
      }

      const { id } = req.params;
      const center = await db('dairy_centers').where('id', id).first();

      if (!center) {
        res.status(404).json({ success: false, message: 'Dairy center not found' });
        return;
      }

      const [updated] = await db('dairy_centers')
        .where('id', id)
        .update({
          is_active: !center.is_active,
          modified_at: new Date(),
          modified_by: req.user.userId,
        })
        .returning('*');

      // Also update user status
      await db('users')
        .where('id', center.user_id)
        .update({ is_active: !center.is_active });

      res.json({
        success: true,
        message: `Center ${updated.is_active ? 'activated' : 'deactivated'} successfully`,
        data: updated,
      });
    } catch (error: any) {
      logger.error('Toggle center status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle center status',
      });
    }
  }

  async getAllCenters(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can view all centers' });
        return;
      }

      const centers = await db('dairy_centers')
        .join('users', 'dairy_centers.user_id', 'users.id')
        .select(
          'dairy_centers.*',
          'users.first_name',
          'users.last_name',
          'users.email',
          'users.mobile_no as user_mobile'
        )
        .orderBy('dairy_centers.created_at', 'desc');

      res.json({
        success: true,
        data: centers,
      });
    } catch (error: any) {
      logger.error('Get all centers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch centers',
      });
    }
  }

  async getCenterById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const center = await db('dairy_centers')
        .join('users', 'dairy_centers.user_id', 'users.id')
        .where('dairy_centers.id', id)
        .select(
          'dairy_centers.*',
          'users.first_name',
          'users.last_name',
          'users.email',
          'users.mobile_no as user_mobile'
        )
        .first();

      if (!center) {
        res.status(404).json({ success: false, message: 'Dairy center not found' });
        return;
      }

      res.json({
        success: true,
        data: center,
      });
    } catch (error: any) {
      logger.error('Get center by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch center',
      });
    }
  }
}

export default new DairyCenterController();

