/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    table.decimal('net_price', 10, 2); // Net price (can be different from calculated)
    table.decimal('old_base_price', 10, 2); // Previous base price (for history)
    table.decimal('old_net_price', 10, 2); // Previous net price (for history)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('milk_collections', function (table) {
    table.dropColumn('net_price');
    table.dropColumn('old_base_price');
    table.dropColumn('old_net_price');
  });
};

