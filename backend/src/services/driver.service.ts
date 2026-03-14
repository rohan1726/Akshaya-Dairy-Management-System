import db from '../config/database';
import { Driver, DriverLocation } from '../models/types';
import logger from '../utils/logger';

export class DriverService {
  /**
   * Determine shift based on current time
   * Morning: 00:00 - 14:00 (before 2 PM)
   * Evening: 14:00 - 23:59 (2 PM onwards)
   */
  private getCurrentShift(): 'morning' | 'evening' {
    const hour = new Date().getHours();
    return hour < 14 ? 'morning' : 'evening';
  }

  async updateDutyStatus(driverId: string, isOnDuty: boolean, createdBy?: string): Promise<Driver> {
    // Get driver record first to get the driver.id (not driver_id)
    const driverRecord = await db('drivers')
      .where('driver_id', driverId)
      .first();

    if (!driverRecord) {
      throw new Error('Driver not found');
    }

    // Update driver status
    const updated = await db('drivers')
      .where('driver_id', driverId)
      .update({ is_on_duty: isOnDuty, modified_at: new Date() })
      .returning('*');

    if (!updated || updated.length === 0) {
      throw new Error('Driver not found or update failed');
    }

    const driver = updated[0];
    
    // Verify the update was successful
    if (driver.is_on_duty !== isOnDuty) {
      logger.error(`Driver status update mismatch: expected ${isOnDuty}, got ${driver.is_on_duty}`);
      throw new Error('Status update failed - value mismatch');
    }

    logger.info(`Driver ${driverId} duty status updated to ${isOnDuty}`);

    // Log duty status to driver_duty_logs
    const today = new Date();
    const dutyDate = today.toISOString().split('T')[0];
    const shift = this.getCurrentShift();

    // Check if log entry exists for today's shift
    const existingLog = await db('driver_duty_logs')
      .where('driver_id', driverRecord.id)
      .where('duty_date', dutyDate)
      .where('shift', shift)
      .first();

    if (isOnDuty) {
      // Starting duty
      if (existingLog) {
        // Update existing log
        await db('driver_duty_logs')
          .where('id', existingLog.id)
          .update({
            is_on_duty: true,
            duty_started_at: new Date(),
            modified_at: new Date(),
            modified_by: createdBy || null,
          });
      } else {
        // Create new log
        await db('driver_duty_logs').insert({
          driver_id: driverRecord.id,
          duty_date: dutyDate,
          shift: shift,
          is_on_duty: true,
          duty_started_at: new Date(),
          created_by: createdBy || null,
        });
      }
    } else {
      // Ending duty
      if (existingLog) {
        // Update existing log
        await db('driver_duty_logs')
          .where('id', existingLog.id)
          .update({
            is_on_duty: false,
            duty_ended_at: new Date(),
            modified_at: new Date(),
            modified_by: createdBy || null,
          });
      } else {
        // Create log entry even if duty was ended (for tracking)
        await db('driver_duty_logs').insert({
          driver_id: driverRecord.id,
          duty_date: dutyDate,
          shift: shift,
          is_on_duty: false,
          duty_ended_at: new Date(),
          created_by: createdBy || null,
        });
      }
    }

    // Create notification
    await db('notifications').insert({
      user_id: driverId,
      user_role: 'driver',
      title: isOnDuty ? 'Duty Started' : 'Duty Ended',
      message: isOnDuty 
        ? `You have started your ${shift} duty. You can now collect milk.`
        : `You have ended your ${shift} duty for today.`,
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
        'users.email',
        'users.is_active' // Include is_active from users table
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

  /**
   * Get monthly duty statistics for a driver
   * Returns statistics for a specific month including:
   * - Total days on duty
   * - Morning shifts on duty
   * - Evening shifts on duty
   * - Morning leave days
   * - Evening leave days
   */
  async getMonthlyDutyStatistics(
    driverId: string,
    year: number,
    month: number
  ): Promise<{
    totalDays: number;
    morningOnDuty: number;
    eveningOnDuty: number;
    morningLeave: number;
    eveningLeave: number;
    dutyLogs: any[];
  }> {
    // Get driver record to get driver.id
    const driverRecord = await db('drivers')
      .where('driver_id', driverId)
      .first();

    if (!driverRecord) {
      throw new Error('Driver not found');
    }

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get all duty logs for the month
    const dutyLogs = await db('driver_duty_logs')
      .where('driver_id', driverRecord.id)
      .whereBetween('duty_date', [startDateStr, endDateStr])
      .orderBy('duty_date', 'asc')
      .orderBy('shift', 'asc');

    // Calculate statistics
    const morningOnDuty = dutyLogs.filter(
      log => log.shift === 'morning' && log.is_on_duty === true
    ).length;

    const eveningOnDuty = dutyLogs.filter(
      log => log.shift === 'evening' && log.is_on_duty === true
    ).length;

    // Count leave days (when driver was not on duty)
    const morningLeave = dutyLogs.filter(
      log => log.shift === 'morning' && log.is_on_duty === false
    ).length;

    const eveningLeave = dutyLogs.filter(
      log => log.shift === 'evening' && log.is_on_duty === false
    ).length;

    // Total unique days with any duty record
    const uniqueDays = new Set(dutyLogs.map(log => log.duty_date));
    const totalDays = uniqueDays.size;

    return {
      totalDays,
      morningOnDuty,
      eveningOnDuty,
      morningLeave,
      eveningLeave,
      dutyLogs,
    };
  }

  /**
   * Update duty status by driver record ID (used by admin)
   */
  async updateDutyStatusByDriverId(
    driverRecordId: string,
    isOnDuty: boolean,
    createdBy?: string
  ): Promise<Driver> {
    const driverRecord = await db('drivers')
      .where('id', driverRecordId)
      .first();

    if (!driverRecord) {
      throw new Error('Driver not found');
    }

    return this.updateDutyStatus(driverRecord.driver_id, isOnDuty, createdBy);
  }
}

export default new DriverService();

