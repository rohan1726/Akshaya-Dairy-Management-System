/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('milk_prices', function (table) {
    table.decimal('base_fat', 5, 2).defaultTo(0); // Base FAT percentage (e.g., 6.0 for buffalo, 3.5 for cow)
    table.decimal('base_snf', 5, 2).defaultTo(0); // Base SNF percentage (e.g., 9.0 for buffalo, 8.5 for cow)
    table.decimal('bonus', 10, 2).defaultTo(0); // Bonus amount (e.g., +1 Rs as shown in charts)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('milk_prices', function (table) {
    table.dropColumn('base_fat');
    table.dropColumn('base_snf');
    table.dropColumn('bonus');
  });
};



