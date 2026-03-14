/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('driver_center_assignments', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('driver_id').notNullable();
    table.uuid('center_id').notNullable();
    table.date('assigned_date').notNullable();
    table.date('unassigned_date'); // Null if currently assigned
    table.boolean('is_active').defaultTo(true);
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    table.foreign('center_id').references('id').inTable('dairy_centers').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('driver_id');
    table.index('center_id');
    table.index('is_active');
    table.index(['driver_id', 'is_active']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('driver_center_assignments');
};

