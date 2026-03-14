/**
 * Make driver_id nullable in milk_collections table
 * This allows admin to create collections without specifying a driver
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    // Drop the foreign key constraint first
    table.dropForeign('driver_id');
    
    // Make driver_id nullable
    table.uuid('driver_id').nullable().alter();
    
    // Re-add the foreign key constraint with ON DELETE SET NULL
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    // Drop the foreign key constraint
    table.dropForeign('driver_id');
    
    // Make driver_id not nullable again
    // Note: This will fail if there are any NULL values
    table.uuid('driver_id').notNullable().alter();
    
    // Re-add the foreign key constraint with ON DELETE CASCADE
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
  });
};

