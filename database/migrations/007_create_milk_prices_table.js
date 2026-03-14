/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('milk_prices', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.date('price_date').notNullable();
    table.decimal('base_price', 10, 2).notNullable(); // Base price per liter
    table.decimal('fat_rate', 10, 2).notNullable(); // Rate per fat percentage
    table.decimal('snf_rate', 10, 2).notNullable(); // Rate per SNF percentage
    table.enum('milk_type', ['cow', 'buffalo', 'mix_milk']).defaultTo('mix_milk');
    table.boolean('is_active').defaultTo(true);
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('price_date');
    table.index('is_active');
    table.unique(['price_date', 'milk_type']); // One price per day per milk type
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('milk_prices');
};

