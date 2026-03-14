/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('milk_plants', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('center_id').notNullable(); // FK to dairy_centers.id (source center)
    table.string('plant_name', 255).notNullable();
    table.jsonb('plant_address');
    table.string('contact_mobile', 15);
    table.enum('collection_time', ['morning', 'evening']);
    table.date('collection_date').notNullable();
    table.decimal('total_cows', 10, 2); // Total cow milk in kg
    table.decimal('total_buffaloes', 10, 2); // Total buffalo milk in kg
    table.enum('milk_type', ['cow', 'buffalo', 'mix_milk']).notNullable();
    table.decimal('milk_weight', 10, 2).notNullable(); // Total weight in kg
    table.decimal('base_value', 10, 2);
    table.decimal('fat_percentage', 5, 2).notNullable();
    table.decimal('snf_percentage', 5, 2).notNullable();
    table.decimal('rate_per_liter', 10, 2).notNullable();
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('can_number', 50);
    table.text('special_instructions');
    table.enum('status', ['pending', 'delivered', 'received']).defaultTo('pending');
    table.timestamp('delivered_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('center_id').references('id').inTable('dairy_centers').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('center_id');
    table.index('collection_date');
    table.index('status');
    table.index(['collection_date', 'collection_time']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('milk_plants');
};

