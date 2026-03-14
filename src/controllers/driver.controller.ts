import { Response } from 'express';
import driverService from '../services/driver.service';
import { validate, driverLocationSchema } from '../utils/validation';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export class DriverController {
  async updateDutyStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'driver') {
        res.status(403).json({ success: false, message: 'Only drivers can update duty status' });
        return;
      }

      const { is_on_duty } = req.body;
      const driver = await driverService.updateDutyStatus(req.user.userId, is_on_duty);

      res.json({
        success: true,
        message: `Duty ${is_on_duty ? 'started' : 'ended'} successfully`,
        data: driver,
      });
    } catch (error: any) {
      logger.error('Update duty status error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update duty status',
      });
    }
  }

  async saveLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'driver') {
        res.status(403).json({ success: false, message: 'Only drivers can save location' });
        return;
      }

      const locationData = {
        ...req.body,
        driver_id: req.user.userId,
      };

      const location = await driverService.saveLocation(locationData);

      res.json({
        success: true,
        message: 'Location saved successfully',
        data: location,
      });
    } catch (error: any) {
      logger.error('Save location error:', error);
      res.status(400).json({
        success: false,
        message: 'Failed to save location',
      });
    }
  }

  async getCurrentLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const driverId = req.query.driver_id as string || req.user.userId;
      
      // Only admin can view other drivers' locations
      if (driverId !== req.user.userId && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const location = await driverService.getCurrentLocation(driverId);

      res.json({
        success: true,
        data: location,
      });
    } catch (error: any) {
      logger.error('Get current location error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch location',
      });
    }
  }

  async getLocationHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const driverId = req.query.driver_id as string || req.user.userId;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;

      // Only admin can view other drivers' locations
      if (driverId !== req.user.userId && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }

      const locations = await driverService.getLocationHistory(driverId, date);

      res.json({
        success: true,
        data: locations,
      });
    } catch (error: any) {
      logger.error('Get location history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch location history',
      });
    }
  }

  async getAssignedCenters(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'driver') {
        res.status(403).json({ success: false, message: 'Only drivers can view assigned centers' });
        return;
      }

      const centers = await driverService.getAssignedCenters(req.user.userId);

      res.json({
        success: true,
        data: centers,
      });
    } catch (error: any) {
      logger.error('Get assigned centers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assigned centers',
      });
    }
  }

  async getAllDrivers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Only admin can view all drivers' });
        return;
      }

      const filters: any = {};
      if (req.query.is_on_duty !== undefined) {
        filters.is_on_duty = req.query.is_on_duty === 'true';
      }
      if (req.query.center_id) {
        filters.center_id = req.query.center_id as string;
      }

      const drivers = await driverService.getAllDrivers(filters);

      res.json({
        success: true,
        data: drivers,
      });
    } catch (error: any) {
      logger.error('Get all drivers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch drivers',
      });
    }
  }
}

export default new DriverController();

