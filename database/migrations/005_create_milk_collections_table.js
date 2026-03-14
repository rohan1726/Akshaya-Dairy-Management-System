/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('milk_collections', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vendor_id').notNullable(); // FK to dairy_centers.id
    table.uuid('driver_id').notNullable(); // FK to drivers.id
    table.uuid('center_id').notNullable(); // FK to dairy_centers.id (same as vendor_id, but kept for clarity)
    table.string('collection_code', 50).unique().notNullable();
    table.date('collection_date').notNullable();
    table.enum('collection_time', ['morning', 'evening']).notNullable();
    table.enum('milk_type', ['cow', 'buffalo', 'mix_milk']).notNullable();
    table.decimal('milk_weight', 10, 2).notNullable(); // in kg
    table.decimal('base_value', 10, 2); // Base price per liter
    table.decimal('fat_percentage', 5, 2).notNullable();
    table.decimal('snf_percentage', 5, 2).notNullable();
    table.decimal('rate_per_liter', 10, 2).notNullable();
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('can_number', 50);
    table.decimal('can_weight_kg', 5, 2); // Empty can weight
    table.text('quality_notes');
    table.enum('status', ['collected', 'delivered', 'processed', 'rejected']).defaultTo('collected');
    table.boolean('is_synced').defaultTo(true); // For offline mode
    table.timestamp('collected_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('vendor_id').references('id').inTable('dairy_centers').onDelete('CASCADE');
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    table.foreign('center_id').references('id').inTable('dairy_centers').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('vendor_id');
    table.index('driver_id');
    table.index('collection_date');
    table.index('collection_time');
    table.index('status');
    table.index('collection_code');
    table.index(['collection_date', 'collection_time']);
    table.index(['vendor_id', 'collection_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('milk_collections');
};

