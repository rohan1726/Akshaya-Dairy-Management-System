/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('center_milk_prices', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('center_id').notNullable(); // FK to dairy_centers.id
    table.date('price_date').notNullable(); // Date for which price is set
    table.string('milk_type', 20).notNullable(); // 'cow' or 'buffalo'
    table.decimal('base_price', 10, 2).notNullable(); // Base price per liter
    table.decimal('net_price', 10, 2); // Net price (can be different from calculated)
    table.decimal('old_base_price', 10, 2); // Previous base price (for history)
    table.decimal('old_net_price', 10, 2); // Previous net price (for history)
    table.decimal('base_fat', 5, 2).notNullable(); // Base FAT percentage
    table.decimal('base_snf', 5, 2).notNullable(); // Base SNF percentage
    table.decimal('fat_rate', 10, 2).notNullable(); // Rate per 1% FAT difference
    table.decimal('snf_rate', 10, 2).notNullable(); // Rate per 1% SNF difference
    table.decimal('bonus', 10, 2).defaultTo(0); // Bonus amount
    table.text('notes'); // Optional notes
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by'); // Who set this price
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('center_id').references('id').inTable('dairy_centers').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('center_id');
    table.index('price_date');
    table.index('milk_type');
    table.index(['center_id', 'price_date', 'milk_type']); // Unique constraint
    table.unique(['center_id', 'price_date', 'milk_type']); // One price per center per date per type
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('center_milk_prices');
};

