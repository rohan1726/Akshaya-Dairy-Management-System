import db from '../config/database';
import { CenterMilkPrice, MilkType } from '../models/types';
import logger from '../utils/logger';

export class CenterMilkPriceService {
  /**
   * Set or update center-specific milk price
   */
  async setCenterPrice(priceData: {
    center_id: string;
    price_date: Date;
    milk_type: MilkType;
    base_price: number;
    net_price?: number;
    base_fat: number;
    base_snf: number;
    fat_rate: number;
    snf_rate: number;
    bonus?: number;
    notes?: string;
    created_by: string;
  }): Promise<CenterMilkPrice> {
    const dateStr = new Date(priceData.price_date).toISOString().split('T')[0];

    // Check if price already exists
    const existing = await db('center_milk_prices')
      .where('center_id', priceData.center_id)
      .where('price_date', dateStr)
      .where('milk_type', priceData.milk_type)
      .first();

    if (existing) {
      // Store old prices before updating
      const oldBasePrice = existing.base_price;
      const oldNetPrice = existing.net_price;

      // Update existing price
      const [updated] = await db('center_milk_prices')
        .where('id', existing.id)
        .update({
          base_price: priceData.base_price,
          net_price: priceData.net_price || null,
          old_base_price: oldBasePrice !== priceData.base_price ? oldBasePrice : existing.old_base_price,
          old_net_price: oldNetPrice && oldNetPrice !== priceData.net_price ? oldNetPrice : existing.old_net_price,
          base_fat: priceData.base_fat,
          base_snf: priceData.base_snf,
          fat_rate: priceData.fat_rate,
          snf_rate: priceData.snf_rate,
          bonus: priceData.bonus || 0,
          notes: priceData.notes,
          modified_at: new Date(),
          modified_by: priceData.created_by,
        })
        .returning('*');

      // Log activity
      await db('activity_logs').insert({
        user_id: priceData.created_by,
        action: 'update_center_milk_price',
        entity_type: 'center_milk_price',
        entity_id: updated.id,
        description: `Updated ${priceData.milk_type} milk price for center on ${dateStr}`,
        old_values: existing,
        new_values: updated,
      });

      return updated;
    } else {
      // Create new price
      const [newPrice] = await db('center_milk_prices')
        .insert({
          ...priceData,
          price_date: dateStr,
          is_active: true,
        })
        .returning('*');

      // Log activity
      await db('activity_logs').insert({
        user_id: priceData.created_by,
        action: 'create_center_milk_price',
        entity_type: 'center_milk_price',
        entity_id: newPrice.id,
        description: `Created ${priceData.milk_type} milk price for center on ${dateStr}`,
        new_values: newPrice,
      });

      return newPrice;
    }
  }

  /**
   * Get center price for a specific date and milk type
   */
  async getCenterPrice(
    centerId: string,
    date: Date,
    milkType: MilkType
  ): Promise<CenterMilkPrice | null> {
    const dateStr = date.toISOString().split('T')[0];

    const price = await db('center_milk_prices')
      .where('center_id', centerId)
      .where('price_date', dateStr)
      .where('milk_type', milkType)
      .where('is_active', true)
      .first();

    return price || null;
  }

  /**
   * Get all center prices for a date range
   */
  async getCenterPrices(filters: {
    center_id?: string;
    start_date?: Date;
    end_date?: Date;
    milk_type?: MilkType;
  }): Promise<CenterMilkPrice[]> {
    let query = db('center_milk_prices').select('*').where('is_active', true);

    if (filters.center_id) {
      query = query.where('center_id', filters.center_id);
    }
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

    return await query.orderBy('price_date', 'desc').orderBy('milk_type', 'asc');
  }
}

export default new CenterMilkPriceService();

