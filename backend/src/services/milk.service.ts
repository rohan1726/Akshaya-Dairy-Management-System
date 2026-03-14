import db from '../config/database';
import { MilkCollection, MilkPrice, CollectionTime, MilkType } from '../models/types';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import centerMilkPriceService from './center-milk-price.service';

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

  /**
   * Get center-specific price with fallback to global price
   */
  async getCenterPriceWithFallback(
    centerId: string,
    date: Date,
    milkType: MilkType
  ): Promise<MilkPrice | null> {
    // Ensure date is a valid Date object
    const validDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
    
    // First try to get center-specific price
    const centerPrice = await centerMilkPriceService.getCenterPrice(centerId, validDate, milkType);
    
    if (centerPrice) {
      // Convert CenterMilkPrice to MilkPrice format
      return {
        id: centerPrice.id,
        price_date: centerPrice.price_date,
        milk_type: centerPrice.milk_type as MilkType,
        base_price: centerPrice.base_price,
        base_fat: centerPrice.base_fat,
        base_snf: centerPrice.base_snf,
        fat_rate: centerPrice.fat_rate,
        snf_rate: centerPrice.snf_rate,
        bonus: centerPrice.bonus || 0,
        is_active: true,
        notes: centerPrice.notes || null,
        created_at: centerPrice.created_at,
        modified_at: centerPrice.modified_at,
        created_by: centerPrice.created_by || null,
        modified_by: centerPrice.modified_by || null,
      } as MilkPrice;
    }

    // Fallback to global price
    const dateStr = validDate.toISOString().split('T')[0];
    const globalPrice = await db('milk_prices')
      .where('price_date', dateStr)
      .where('milk_type', milkType)
      .where('is_active', true)
      .first();

    return globalPrice || null;
  }

  /**
   * Calculate milk price based on FAT and SNF percentages
   * Formula: Rate = Base Price + ((FAT - Base FAT) × FAT Rate) + ((SNF - Base SNF) × SNF Rate) + Bonus
   * 
   * Example for Buffalo (Base: 6.0 FAT, 9.0 SNF, Base Price: 51, Bonus: 1):
   * - For 6.0 FAT, 9.0 SNF: 51 + ((6.0-6.0)×5) + ((9.0-9.0)×5) + 1 = 52 Rs
   * - For 7.0 FAT, 9.0 SNF: 51 + ((7.0-6.0)×5) + ((9.0-9.0)×5) + 1 = 57 Rs
   * 
   * Example for Cow (Base: 3.5 FAT, 8.5 SNF, Base Price: 36, Bonus: 1):
   * - For 3.5 FAT, 8.5 SNF: 36 + ((3.5-3.5)×5) + ((8.5-8.5)×5) + 1 = 37 Rs
   * - For 4.0 FAT, 8.5 SNF: 36 + ((4.0-3.5)×5) + ((8.5-8.5)×5) + 1 = 39.5 Rs
   */
  async calculatePrice(
    basePrice: number,
    baseFat: number,
    baseSnf: number,
    fatRate: number,
    snfRate: number,
    bonus: number,
    fatPercentage: number,
    snfPercentage: number
  ): Promise<number> {
    // Calculate differences from base
    const fatDifference = fatPercentage - baseFat;
    const snfDifference = snfPercentage - baseSnf;
    
    // Calculate rate: Base Price + (FAT diff × FAT rate) + (SNF diff × SNF rate) + Bonus
    const rate = basePrice + (fatDifference * fatRate) + (snfDifference * snfRate) + bonus;
    
    // Round to 2 decimal places
    return Math.round(rate * 100) / 100;
  }

  async createCollection(collectionData: {
    // vendor_id: string; // Commented out - using center_id only, will be set automatically
    driver_id?: string; // Optional - can be null for admin-created collections
    center_id: string;
    collection_date: Date;
    collection_time: CollectionTime;
    milk_type: MilkType;
    milk_weight: number;
    fat_percentage?: number; // Optional - not needed if rate_per_liter is provided
    snf_percentage?: number; // Optional - not needed if rate_per_liter is provided
    rate_per_liter?: number; // Optional - if provided, use directly instead of calculating
    can_number?: string;
    can_weight_kg?: number;
    quality_notes?: string;
    created_by: string;
  }): Promise<MilkCollection> {
    // Note: Drivers can create multiple collections per day
    // - One collection in the morning
    // - One collection in the evening
    // - Multiple collections from different centers on the same day
    
    // Check if a collection already exists for this center, date, time, and milk type
    // If it exists, throw an error instead of creating a duplicate
    const existingCollection = await db('milk_collections')
      .where('center_id', collectionData.center_id)
      .where('collection_date', new Date(collectionData.collection_date).toISOString().split('T')[0])
      .where('collection_time', collectionData.collection_time)
      .where('milk_type', collectionData.milk_type)
      .first();
    
    if (existingCollection) {
      throw new Error(
        `Milk collection already exists for this center, date (${new Date(collectionData.collection_date).toISOString().split('T')[0]}), time (${collectionData.collection_time}), and milk type (${collectionData.milk_type}). Please change the date or update the existing collection.`
      );
    }
    
    // Set vendor_id = center_id (they are the same in the database)
    const vendor_id = collectionData.center_id;
    
    let ratePerLiter: number;
    let baseValue: number;
    
    // If rate_per_liter is provided directly, use it (no calculation needed)
    if (collectionData.rate_per_liter !== undefined && collectionData.rate_per_liter !== null) {
      ratePerLiter = collectionData.rate_per_liter;
      // Get base price for base_value field (for reference)
      const price = await this.getCenterPriceWithFallback(
        collectionData.center_id,
        collectionData.collection_date,
        collectionData.milk_type
      );
      baseValue = price?.base_price || ratePerLiter; // Use provided rate as base if no price found
    } else {
      // Calculate rate per liter from FAT/SNF (backward compatibility)
      // Get center-specific price with fallback to global price
      let price = await this.getCenterPriceWithFallback(
        collectionData.center_id,
        collectionData.collection_date,
        collectionData.milk_type
      );
      
      // If no price found, use default values based on milk type
      if (!price) {
        logger.warn(`No price found for ${collectionData.milk_type} milk on ${new Date(collectionData.collection_date).toISOString().split('T')[0]}. Using default values.`);
        
        // Default prices based on milk type
        const defaultPrices: Record<MilkType, Partial<MilkPrice>> = {
          cow: {
            base_price: 36.00,
            base_fat: 3.5,
            base_snf: 8.5,
            fat_rate: 5.0,
            snf_rate: 5.0,
            bonus: 1.00,
          },
          buffalo: {
            base_price: 51.00,
            base_fat: 6.0,
            base_snf: 9.0,
            fat_rate: 5.0,
            snf_rate: 5.0,
            bonus: 1.00,
          },
          mix_milk: {
            base_price: 40.00,
            base_fat: 4.5,
            base_snf: 8.75,
            fat_rate: 5.0,
            snf_rate: 5.0,
            bonus: 1.00,
          },
        };
        
        const defaults = defaultPrices[collectionData.milk_type];
        price = {
          id: '',
          price_date: collectionData.collection_date,
          milk_type: collectionData.milk_type,
          base_price: defaults.base_price!,
          base_fat: defaults.base_fat!,
          base_snf: defaults.base_snf!,
          fat_rate: defaults.fat_rate!,
          snf_rate: defaults.snf_rate!,
          bonus: defaults.bonus!,
          is_active: true,
          notes: `Default price used - no price set for this date`,
          created_at: new Date(),
          modified_at: new Date(),
          created_by: undefined,
          modified_by: undefined,
        } as MilkPrice;
      }

      // Validate FAT and SNF percentages if provided
      if (collectionData.fat_percentage !== undefined && collectionData.fat_percentage !== null) {
        if (collectionData.fat_percentage < 0 || collectionData.fat_percentage > 100) {
          throw new Error('FAT percentage must be between 0 and 100');
        }
      }
      if (collectionData.snf_percentage !== undefined && collectionData.snf_percentage !== null) {
        if (collectionData.snf_percentage < 0 || collectionData.snf_percentage > 100) {
          throw new Error('SNF percentage must be between 0 and 100');
        }
      }
      
      // Calculate rate per liter using base FAT/SNF formula
      ratePerLiter = await this.calculatePrice(
        price.base_price,
        price.base_fat || 0,
        price.base_snf || 0,
        price.fat_rate,
        price.snf_rate,
        price.bonus || 0,
        collectionData.fat_percentage || 0,
        collectionData.snf_percentage || 0
      );
      
      // Ensure rate per liter is not negative (use base price as minimum)
      ratePerLiter = Math.max(ratePerLiter, price.base_price);
      
      if (ratePerLiter < 0) {
        logger.warn(`Calculated negative rate per liter: ${ratePerLiter}. Using base price (${price.base_price}) instead.`);
        ratePerLiter = price.base_price;
      }
      
      baseValue = price.base_price;
    }

    // Calculate total amount (assuming 1kg = 1 liter for milk)
    // Total = weight (kg) × rate per liter
    const totalAmount = collectionData.milk_weight * ratePerLiter;
    // Round to 2 decimal places
    const roundedAmount = Math.round(totalAmount * 100) / 100;

    // Generate collection code
    const dateStr = new Date(collectionData.collection_date).toISOString().split('T')[0].replace(/-/g, '');
    const collectionCode = `MC-${dateStr}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create new collection
    const [collection] = await db('milk_collections')
      .insert({
        ...collectionData,
        driver_id: collectionData.driver_id || null, // Explicitly set to null if undefined
        vendor_id: vendor_id, // Set vendor_id = center_id automatically
        collection_code: collectionCode,
        base_value: baseValue,
        rate_per_liter: ratePerLiter, // Use provided or calculated rate
        total_amount: roundedAmount,
        fat_percentage: collectionData.fat_percentage !== undefined ? collectionData.fat_percentage : null, // Nullable
        snf_percentage: collectionData.snf_percentage !== undefined ? collectionData.snf_percentage : null, // Nullable
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
      description: `Milk collection added: ${collectionData.milk_weight}kg (${collectionData.milk_type}) - Center: ${collectionData.center_id}, Date: ${new Date(collectionData.collection_date).toISOString().split('T')[0]}, Time: ${collectionData.collection_time}`,
      new_values: collection,
    });

    return collection;
  }

  async getCollections(filters: {
    center_id?: string; // Changed from vendor_id to center_id
    driver_id?: string;
    collection_date?: Date | string;
    start_date?: string;
    end_date?: string;
    collection_time?: CollectionTime;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<MilkCollection[]> {
    let query = db('milk_collections')
      .leftJoin('dairy_centers as vendor_center', 'milk_collections.vendor_id', 'vendor_center.id')
      .leftJoin('dairy_centers as center', 'milk_collections.center_id', 'center.id')
      .leftJoin('users as driver_user', 'milk_collections.driver_id', 'driver_user.id')
      .select(
        'milk_collections.*',
        'vendor_center.dairy_name as vendor_name',
        'center.dairy_name as center_name',
        db.raw("CONCAT(driver_user.first_name, ' ', driver_user.last_name) as driver_name")
      );

    // Use center_id for filtering instead of vendor_id
    if (filters.center_id) {
      query = query.where('milk_collections.center_id', filters.center_id);
    }
    if (filters.driver_id) {
      query = query.where('milk_collections.driver_id', filters.driver_id);
    }
    if (filters.start_date && filters.end_date) {
      query = query.whereBetween('milk_collections.collection_date', [filters.start_date, filters.end_date]);
    } else if (filters.collection_date) {
      query = query.where('milk_collections.collection_date', filters.collection_date);
    }
    if (filters.collection_time) {
      query = query.where('milk_collections.collection_time', filters.collection_time);
    }
    if (filters.status) {
      query = query.where('milk_collections.status', filters.status);
    }

    // Order by center, date, time for proper grouping
    query = query
      .orderBy('milk_collections.center_id', 'asc')
      .orderBy('milk_collections.collection_date', 'desc')
      .orderBy('milk_collections.collection_time', 'asc')
      .orderBy('milk_collections.created_at', 'desc');

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getCollectionById(id: string): Promise<MilkCollection | null> {
    const collection = await db('milk_collections')
      .leftJoin('dairy_centers', 'milk_collections.vendor_id', 'dairy_centers.id')
      .leftJoin('users as driver_user', 'milk_collections.driver_id', 'driver_user.id')
      .where('milk_collections.id', id)
      .select(
        'milk_collections.*',
        'dairy_centers.dairy_name as vendor_name',
        db.raw("CONCAT(driver_user.first_name, ' ', driver_user.last_name) as driver_name")
      )
      .first();

    return collection || null;
  }

  async updateCollection(
    id: string,
    updateData: {
      fat_percentage?: number;
      snf_percentage?: number;
      rate_per_liter?: number;
      total_amount?: number;
      base_value?: number;
      net_price?: number;
      old_base_price?: number;
      old_net_price?: number;
    },
    modifiedBy: string
  ): Promise<MilkCollection> {
    // Get existing collection
    const existing = await db('milk_collections').where('id', id).first();
    if (!existing) {
      throw new Error('Collection not found');
    }

    // Store old prices if base_price or net_price is being updated
    const updateFields: any = {
      modified_at: new Date(),
      modified_by: modifiedBy,
    };

    if (updateData.fat_percentage !== undefined) {
      updateFields.fat_percentage = updateData.fat_percentage;
    }
    if (updateData.snf_percentage !== undefined) {
      updateFields.snf_percentage = updateData.snf_percentage;
    }
    if (updateData.rate_per_liter !== undefined) {
      updateFields.rate_per_liter = updateData.rate_per_liter;
    }
    if (updateData.total_amount !== undefined) {
      updateFields.total_amount = updateData.total_amount;
    }
    if (updateData.base_value !== undefined) {
      // Store old base price before updating
      if (existing.base_value && existing.base_value !== updateData.base_value) {
        updateFields.old_base_price = existing.base_value;
      }
      updateFields.base_value = updateData.base_value;
    }
    if (updateData.net_price !== undefined) {
      // Store old net price before updating
      if (existing.net_price && existing.net_price !== updateData.net_price) {
        updateFields.old_net_price = existing.net_price;
      }
      updateFields.net_price = updateData.net_price;
    }
    if (updateData.old_base_price !== undefined) {
      updateFields.old_base_price = updateData.old_base_price;
    }
    if (updateData.old_net_price !== undefined) {
      updateFields.old_net_price = updateData.old_net_price;
    }

    const [updated] = await db('milk_collections')
      .where('id', id)
      .update(updateFields)
      .returning('*');

    // Log activity
    await db('activity_logs').insert({
      user_id: modifiedBy,
      action: 'update_milk_collection',
      entity_type: 'milk_collection',
      entity_id: id,
      description: 'Milk collection updated',
      old_values: existing,
      new_values: updated,
    });

    return updated;
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

