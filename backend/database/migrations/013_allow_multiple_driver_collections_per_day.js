/**
 * Migration: Allow drivers to work multiple times per day (morning and evening)
 * This migration adds indexes to support efficient querying of driver collections
 * and ensures the database schema explicitly supports multiple collections per day.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    // Add composite index for efficient querying of driver collections by date and time
    // This allows drivers to have both morning and evening collections on the same day
    table.index(['driver_id', 'collection_date', 'collection_time'], 'idx_driver_date_time');
    
    // Add composite index for vendor collections by date and time
    table.index(['vendor_id', 'collection_date', 'collection_time'], 'idx_vendor_date_time');
    
    // Note: We intentionally do NOT add a unique constraint on (driver_id, collection_date, collection_time)
    // because drivers should be able to collect from multiple vendors/centers on the same day
    // However, we could add a unique constraint on (driver_id, vendor_id, collection_date, collection_time)
    // if we want to prevent duplicate collections from the same vendor on the same day/time
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    table.dropIndex(['driver_id', 'collection_date', 'collection_time'], 'idx_driver_date_time');
    table.dropIndex(['vendor_id', 'collection_date', 'collection_time'], 'idx_vendor_date_time');
  });
};

