/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('driver_duty_logs', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('driver_id').notNullable(); // FK to drivers.id
    table.date('duty_date').notNullable(); // The date for this duty record
    table.string('shift', 20).notNullable(); // 'morning' or 'evening'
    table.boolean('is_on_duty').defaultTo(false); // Whether driver was on duty for this shift
    table.timestamp('duty_started_at'); // When duty started for this shift
    table.timestamp('duty_ended_at'); // When duty ended for this shift
    table.text('notes'); // Optional notes
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by'); // Who created this log (admin or driver)
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes for efficient queries
    table.index('driver_id');
    table.index('duty_date');
    table.index('shift');
    table.index(['driver_id', 'duty_date', 'shift']); // Unique constraint for one record per driver per date per shift
    table.unique(['driver_id', 'duty_date', 'shift']); // Ensure one record per driver per date per shift
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('driver_duty_logs');
};

