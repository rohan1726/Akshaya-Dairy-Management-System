/**
 * Make fat_percentage and snf_percentage nullable in milk_collections table
 * This allows direct entry of rate_per_liter without requiring FAT/SNF calculation
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    // Make fat_percentage and snf_percentage nullable
    table.decimal('fat_percentage', 5, 2).nullable().alter();
    table.decimal('snf_percentage', 5, 2).nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    // Make fat_percentage and snf_percentage not nullable again
    // Note: This will fail if there are any NULL values
    table.decimal('fat_percentage', 5, 2).notNullable().alter();
    table.decimal('snf_percentage', 5, 2).notNullable().alter();
  });
};

