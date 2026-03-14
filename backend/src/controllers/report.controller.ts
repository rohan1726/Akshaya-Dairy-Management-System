import { Response } from 'express';
import db from '../config/database';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/types';

export class ReportController {
  async getCenterCollections(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can view reports' });
        return;
      }

      const { center_id, start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({ success: false, message: 'start_date and end_date are required' });
        return;
      }

      let query = db('milk_collections')
        .join('dairy_centers', 'milk_collections.vendor_id', 'dairy_centers.id')
        .select(
          'milk_collections.*',
          'dairy_centers.dairy_name'
        )
        .whereBetween('milk_collections.collection_date', [start_date, end_date]);

      if (center_id) {
        query = query.where('milk_collections.vendor_id', center_id as string);
      }

      const collections = await query.orderBy('milk_collections.collection_date', 'desc');

      // Calculate totals
      const totals = collections.reduce((acc: any, col: any) => {
        acc.totalWeight += col.milk_weight || 0;
        acc.totalAmount += col.total_amount || 0;
        if (col.collection_time === 'morning') {
          acc.morningWeight += col.milk_weight || 0;
        } else {
          acc.eveningWeight += col.milk_weight || 0;
        }
        return acc;
      }, { totalWeight: 0, totalAmount: 0, morningWeight: 0, eveningWeight: 0 });

      res.json({
        success: true,
        data: {
          collections,
          totals,
          period: {
            start_date,
            end_date,
            center_id: center_id || null,
          },
        },
      });
    } catch (error: any) {
      logger.error('Get center collections error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch collections',
      });
    }
  }

  async getDriverSalary(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ success: false, message: 'Only admin can view driver salary' });
        return;
      }

      const { driver_id, start_date, end_date } = req.query;

      if (!driver_id || !start_date || !end_date) {
        res.status(400).json({ success: false, message: 'driver_id, start_date and end_date are required' });
        return;
      }

      // Get driver info
      const driver = await db('drivers')
        .join('users', 'drivers.driver_id', 'users.id')
        .where('drivers.id', driver_id as string)
        .select('drivers.*', 'users.first_name', 'users.last_name', 'users.mobile_no')
        .first();

      if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
      }

      // Get collections by this driver
      const collections = await db('milk_collections')
        .where('driver_id', driver.driver_id)
        .whereBetween('collection_date', [start_date, end_date])
        .orderBy('collection_date', 'desc');

      // Get salary info
      const salary = driver.salary_per_month || 0;
      const daysInPeriod = Math.ceil(
        (new Date(end_date as string).getTime() - new Date(start_date as string).getTime()) / (1000 * 60 * 60 * 24)
      );
      const baseSalary = (salary / 30) * daysInPeriod;

      // Calculate overtime, bonus, etc. (simplified)
      const overtime = 0;
      const bonus = 0;
      const deductions = 0;
      const finalAmount = baseSalary + overtime + bonus - deductions;

      res.json({
        success: true,
        data: {
          driver: {
            id: driver.id,
            name: `${driver.first_name} ${driver.last_name}`,
            mobile: driver.mobile_no,
            vehicle_number: driver.vehicle_number,
          },
          period: {
            start_date,
            end_date,
            days: daysInPeriod,
          },
          salary: {
            baseSalary,
            overtime,
            bonus,
            deductions,
            finalAmount,
          },
          collections: collections.length,
        },
      });
    } catch (error: any) {
      logger.error('Get driver salary error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch driver salary',
      });
    }
  }
}

export default new ReportController();

