import { Response } from 'express';
import db from '../config/database';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/types';
import bcrypt from 'bcrypt';

export class DriverAdminController {
  async createDriver(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can create drivers' });
        return;
      }

      const {
        mobile_no,
        email,
        password,
        first_name,
        last_name,
        center_id,
        license_number,
        license_expiry,
        vehicle_number,
        vehicle_type,
        salary_per_month,
        joining_date,
        emergency_contact_name,
        emergency_contact_mobile,
      } = req.body;

      // Create user first
      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const [user] = await db('users')
        .insert({
          mobile_no,
          email: email || null,
          password: hashedPassword,
          role: 'driver',
          first_name,
          last_name,
          is_active: true,
          is_verified: true,
        })
        .returning('*');

      // Create driver
      const [driver] = await db('drivers')
        .insert({
          driver_id: user.id,
          center_id: center_id || null,
          license_number,
          license_expiry: license_expiry ? new Date(license_expiry) : null,
          vehicle_number,
          vehicle_type,
          salary_per_month: salary_per_month || 0,
          joining_date: joining_date ? new Date(joining_date) : new Date(),
          is_on_duty: false,
          emergency_contact_name,
          emergency_contact_mobile,
          created_by: req.user.userId,
        })
        .returning('*');

      // Create assignment if center_id provided
      if (center_id) {
        await db('driver_center_assignments').insert({
          driver_id: driver.id,
          center_id,
          assigned_date: new Date(),
          is_active: true,
          created_by: req.user.userId,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Driver created successfully',
        data: { ...driver, user },
      });
    } catch (error: any) {
      logger.error('Create driver error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create driver',
      });
    }
  }

  async updateDriver(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can update drivers' });
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      // Update driver
      const [driver] = await db('drivers')
        .where('id', id)
        .update({
          ...updateData,
          modified_at: new Date(),
          modified_by: req.user.userId,
        })
        .returning('*');

      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Driver updated successfully',
        data: driver,
      });
    } catch (error: any) {
      logger.error('Update driver error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update driver',
      });
    }
  }

  async toggleDriverDuty(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can toggle driver duty' });
        return;
      }

      const { id } = req.params;
      const driver = await db('drivers').where('id', id).first();

      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }

      // Use driver service to update duty status (which also logs to driver_duty_logs)
      const driverService = (await import('../services/driver.service')).default;
      const updated = await driverService.updateDutyStatusByDriverId(
        id,
        !driver.is_on_duty,
        req.user.userId
      );

      res.json({
        success: true,
        message: `Driver ${updated.is_on_duty ? 'set to on-duty' : 'set to off-duty'}`,
        data: updated,
      });
    } catch (error: any) {
      logger.error('Toggle driver duty error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle driver duty',
      });
    }
  }

  async toggleDriverStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can toggle driver status' });
        return;
      }

      const { id } = req.params;
      const driver = await db('drivers')
        .join('users', 'drivers.driver_id', 'users.id')
        .where('drivers.id', id)
        .select('drivers.*', 'users.is_active as user_is_active')
        .first();

      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }

      const newStatus = !driver.user_is_active;
      await db('users')
        .where('id', driver.driver_id)
        .update({ is_active: newStatus });

      res.json({
        success: true,
        message: `Driver ${newStatus ? 'activated' : 'deactivated'} successfully`,
        data: { is_active: newStatus },
      });
    } catch (error: any) {
      logger.error('Toggle driver status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle driver status',
      });
    }
  }

  async assignCenter(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can assign centers' });
        return;
      }

      const { id } = req.params;
      const { center_id } = req.body;

      const driver = await db('drivers').where('id', id).first();
      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }

      // Deactivate existing assignments
      await db('driver_center_assignments')
        .where('driver_id', id)
        .where('is_active', true)
        .update({ is_active: false, unassigned_date: new Date() });

      // Create new assignment
      if (center_id) {
        await db('driver_center_assignments').insert({
          driver_id: id,
          center_id,
          assigned_date: new Date(),
          is_active: true,
          created_by: req.user.userId,
        });

        // Update driver center_id
        await db('drivers')
          .where('id', id)
          .update({ center_id, modified_at: new Date() });
      }

      res.json({
        success: true,
        message: 'Center assigned successfully',
      });
    } catch (error: any) {
      logger.error('Assign center error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to assign center',
      });
    }
  }
}

export default new DriverAdminController();

