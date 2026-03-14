import db from '../config/database';
import { MilkCollection, MilkPrice, CollectionTime, MilkType } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export class MilkService {
  async getTodayPrice(milkType: MilkType = MilkType.MIX_MILK): Promise<MilkPrice | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const price = await db('milk_prices')
      .where('price_date', today)
      .where('milk_type', milkType)
      .where('is_active', true)
      .first();

    return price || null;
  }

  async calculatePrice(
    basePrice: number,
    fatRate: number,
    snfRate: number,
    fatPercentage: number,
    snfPercentage: number
  ): Promise<number> {
    // Price = Base Price + (Fat × fatRate) + (SNF × snfRate)
    return basePrice + (fatPercentage * fatRate) + (snfPercentage * snfRate);
  }

  async createCollection(collectionData: {
    vendor_id: string;
    driver_id: string;
    center_id: string;
    collection_date: Date;
    collection_time: CollectionTime;
    milk_type: MilkType;
    milk_weight: number;
    fat_percentage: number;
    snf_percentage: number;
    can_number?: string;
    can_weight_kg?: number;
    quality_notes?: string;
    created_by: string;
  }): Promise<MilkCollection> {
    // Get today's price
    const price = await this.getTodayPrice(collectionData.milk_type);
    if (!price) {
      throw new Error('Milk price not set for today. Please contact admin.');
    }

    // Calculate rate per liter
    const ratePerLiter = await this.calculatePrice(
      price.base_price,
      price.fat_rate,
      price.snf_rate,
      collectionData.fat_percentage,
      collectionData.snf_percentage
    );

    // Calculate total amount (assuming 1kg = 1 liter for milk)
    const totalAmount = (collectionData.milk_weight * ratePerLiter) / 100;

    // Generate collection code
    const dateStr = new Date(collectionData.collection_date).toISOString().split('T')[0].replace(/-/g, '');
    const collectionCode = `MC-${dateStr}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const [collection] = await db('milk_collections')
      .insert({
        ...collectionData,
        collection_code: collectionCode,
        base_value: price.base_price,
        rate_per_liter: ratePerLiter,
        total_amount: totalAmount,
        status: 'collected',
        is_synced: true,
        collected_at: new Date(),
      })
      .returning('*');

    // Log activity
    await db('activity_logs').insert({
      user_id: collectionData.created_by,
      action: 'add_milk',
      entity_type: 'milk_collection',
      entity_id: collection.id,
      description: `Milk collection added: ${collectionData.milk_weight}kg`,
      new_values: collection,
    });

    return collection;
  }

  async getCollections(filters: {
    vendor_id?: string;
    driver_id?: string;
    collection_date?: Date;
    collection_time?: CollectionTime;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<MilkCollection[]> {
    let query = db('milk_collections').select('*');

    if (filters.vendor_id) {
      query = query.where('vendor_id', filters.vendor_id);
    }
    if (filters.driver_id) {
      query = query.where('driver_id', filters.driver_id);
    }
    if (filters.collection_date) {
      query = query.where('collection_date', filters.collection_date);
    }
    if (filters.collection_time) {
      query = query.where('collection_time', filters.collection_time);
    }
    if (filters.status) {
      query = query.where('status', filters.status);
    }

    query = query.orderBy('created_at', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getDashboardStats(date?: Date): Promise<{
    todayTotalMilk: number;
    morningMilk: number;
    eveningMilk: number;
    thisMonthMilk: number;
    lastMonthMilk: number;
  }> {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    const lastMonthStart = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);

    // Today's total
    const todayTotal = await db('milk_collections')
      .where('collection_date', dateStr)
      .sum('milk_weight as total')
      .first();

    // Morning milk
    const morningMilk = await db('milk_collections')
      .where('collection_date', dateStr)
      .where('collection_time', 'morning')
      .sum('milk_weight as total')
      .first();

    // Evening milk
    const eveningMilk = await db('milk_collections')
      .where('collection_date', dateStr)
      .where('collection_time', 'evening')
      .sum('milk_weight as total')
      .first();

    // This month
    const thisMonth = await db('milk_collections')
      .whereBetween('collection_date', [
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
      ])
      .sum('milk_weight as total')
      .first();

    // Last month
    const lastMonth = await db('milk_collections')
      .whereBetween('collection_date', [
        lastMonthStart.toISOString().split('T')[0],
        lastMonthEnd.toISOString().split('T')[0]
      ])
      .sum('milk_weight as total')
      .first();

    return {
      todayTotalMilk: parseFloat(todayTotal?.total || '0'),
      morningMilk: parseFloat(morningMilk?.total || '0'),
      eveningMilk: parseFloat(eveningMilk?.total || '0'),
      thisMonthMilk: parseFloat(thisMonth?.total || '0'),
      lastMonthMilk: parseFloat(lastMonth?.total || '0'),
    };
  }
}

export default new MilkService();

