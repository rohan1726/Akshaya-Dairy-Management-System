import db from '../config/database';
import { MilkPrice, MilkType } from '../models/types';
import logger from '../utils/logger';

export class MilkPriceService {
  /**
   * Create or update daily milk price
   */
  async setDailyPrice(priceData: {
    price_date: Date;
    base_price: number;
    base_fat: number;
    base_snf: number;
    fat_rate: number;
    snf_rate: number;
    bonus: number;
    milk_type: MilkType;
    notes?: string;
    created_by: string;
  }): Promise<MilkPrice> {
    const dateStr = new Date(priceData.price_date).toISOString().split('T')[0];

    // Check if price already exists for this date and milk type
    const existing = await db('milk_prices')
      .where('price_date', dateStr)
      .where('milk_type', priceData.milk_type)
      .first();

    if (existing) {
      // Update existing price
      const [updated] = await db('milk_prices')
        .where('id', existing.id)
        .update({
          base_price: priceData.base_price,
          base_fat: priceData.base_fat,
          base_snf: priceData.base_snf,
          fat_rate: priceData.fat_rate,
          snf_rate: priceData.snf_rate,
          bonus: priceData.bonus,
          notes: priceData.notes,
          modified_at: new Date(),
          modified_by: priceData.created_by,
        })
        .returning('*');

      // Log activity
      await db('activity_logs').insert({
        user_id: priceData.created_by,
        action: 'update_milk_price',
        entity_type: 'milk_price',
        entity_id: updated.id,
        description: `Updated milk price for ${priceData.milk_type} on ${dateStr}`,
        old_values: existing,
        new_values: updated,
      });

      return updated;
    } else {
      // Create new price
      const [newPrice] = await db('milk_prices')
        .insert({
          ...priceData,
          price_date: dateStr,
          is_active: true,
        })
        .returning('*');

      // Log activity
      await db('activity_logs').insert({
        user_id: priceData.created_by,
        action: 'create_milk_price',
        entity_type: 'milk_price',
        entity_id: newPrice.id,
        description: `Created milk price for ${priceData.milk_type} on ${dateStr}`,
        new_values: newPrice,
      });

      // Create notification for all users
      await db('notifications').insert({
        user_role: 'all',
        title: 'Milk Rate Updated',
        message: `Today's ${priceData.milk_type} milk rate has been updated. Base: ₹${priceData.base_price}, FAT: ${priceData.base_fat}%, SNF: ${priceData.base_snf}%`,
        type: 'rate_update',
        priority: 'high',
        is_read: false,
      });

      return newPrice;
    }
  }

  /**
   * Get price for a specific date and milk type
   */
  async getPrice(date: Date, milkType: MilkType): Promise<MilkPrice | null> {
    const dateStr = date.toISOString().split('T')[0];

    const price = await db('milk_prices')
      .where('price_date', dateStr)
      .where('milk_type', milkType)
      .where('is_active', true)
      .first();

    return price || null;
  }

  /**
   * Get all prices for a date range
   */
  async getPrices(filters: {
    start_date?: Date;
    end_date?: Date;
    milk_type?: MilkType;
    limit?: number;
    offset?: number;
  }): Promise<MilkPrice[]> {
    let query = db('milk_prices').select('*').where('is_active', true);

    if (filters.start_date) {
      const startStr = new Date(filters.start_date).toISOString().split('T')[0];
      query = query.where('price_date', '>=', startStr);
    }

    if (filters.end_date) {
      const endStr = new Date(filters.end_date).toISOString().split('T')[0];
      query = query.where('price_date', '<=', endStr);
    }

    if (filters.milk_type) {
      query = query.where('milk_type', filters.milk_type);
    }

    query = query.orderBy('price_date', 'desc').orderBy('milk_type', 'asc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  /**
   * Calculate price preview for given FAT and SNF
   */
  async calculatePricePreview(
    milkType: MilkType,
    fatPercentage: number,
    snfPercentage: number,
    date?: Date
  ): Promise<{
    rate: number;
    price: MilkPrice;
  }> {
    const targetDate = date || new Date();
    const price = await this.getPrice(targetDate, milkType);

    if (!price) {
      throw new Error(`Milk price not set for ${milkType} on ${targetDate.toISOString().split('T')[0]}`);
    }

    // Calculate rate
    const fatDifference = fatPercentage - (price.base_fat || 0);
    const snfDifference = snfPercentage - (price.base_snf || 0);
    const rate = price.base_price + (fatDifference * price.fat_rate) + (snfDifference * price.snf_rate) + (price.bonus || 0);
    const roundedRate = Math.round(rate * 100) / 100;

    return {
      rate: roundedRate,
      price,
    };
  }
}

export default new MilkPriceService();



