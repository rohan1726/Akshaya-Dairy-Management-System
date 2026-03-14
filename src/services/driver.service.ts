import db from '../config/database';
import { Driver, DriverLocation } from '../models/types';
import logger from '../utils/logger';

export class DriverService {
  async updateDutyStatus(driverId: string, isOnDuty: boolean): Promise<Driver> {
    const [driver] = await db('drivers')
      .where('driver_id', driverId)
      .update({ is_on_duty: isOnDuty, modified_at: new Date() })
      .returning('*');

    if (!driver) {
      throw new Error('Driver not found');
    }

    // Create notification
    await db('notifications').insert({
      user_id: driverId,
      user_role: 'driver',
      title: isOnDuty ? 'Duty Started' : 'Duty Ended',
      message: isOnDuty 
        ? 'You have started your duty. You can now collect milk.'
        : 'You have ended your duty for today.',
      type: 'duty_status',
      priority: 'medium',
      is_read: false,
    });

    return driver;
  }

  async saveLocation(locationData: {
    driver_id: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    address?: string;
  }): Promise<DriverLocation> {
    const [location] = await db('driver_locations')
      .insert({
        ...locationData,
        recorded_at: new Date(),
      })
      .returning('*');

    return location;
  }

  async getCurrentLocation(driverId: string): Promise<DriverLocation | null> {
    const location = await db('driver_locations')
      .where('driver_id', driverId)
      .orderBy('recorded_at', 'desc')
      .first();

    return location || null;
  }

  async getLocationHistory(
    driverId: string,
    date?: Date
  ): Promise<DriverLocation[]> {
    let query = db('driver_locations').where('driver_id', driverId);

    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      query = query.whereRaw('DATE(recorded_at) = ?', [dateStr]);
    }

    return await query.orderBy('recorded_at', 'desc').limit(100);
  }

  async getDriverById(driverId: string): Promise<Driver | null> {
    const driver = await db('drivers')
      .where('driver_id', driverId)
      .first();

    return driver || null;
  }

  async getAssignedCenters(driverId: string): Promise<any[]> {
    const assignments = await db('driver_center_assignments')
      .where('driver_id', driverId)
      .where('is_active', true)
      .join('dairy_centers', 'driver_center_assignments.center_id', 'dairy_centers.id')
      .select('dairy_centers.*');

    return assignments;
  }

  async getAllDrivers(filters: {
    is_on_duty?: boolean;
    center_id?: string;
    is_active?: boolean;
  }): Promise<any[]> {
    let query = db('drivers')
      .join('users', 'drivers.driver_id', 'users.id')
      .select(
        'drivers.*',
        'users.first_name',
        'users.last_name',
        'users.mobile_no',
        'users.email'
      );

    if (filters.is_on_duty !== undefined) {
      query = query.where('drivers.is_on_duty', filters.is_on_duty);
    }
    if (filters.center_id) {
      query = query.where('drivers.center_id', filters.center_id);
    }
    if (filters.is_active !== undefined) {
      query = query.where('users.is_active', filters.is_active);
    }

    return await query;
  }
}

export default new DriverService();

