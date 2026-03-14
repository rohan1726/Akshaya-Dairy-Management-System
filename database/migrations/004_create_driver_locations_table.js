/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('driver_locations', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('driver_id').notNullable();
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.decimal('accuracy', 10, 2); // in meters
    table.decimal('speed', 10, 2); // in km/h
    table.text('address'); // Reverse geocoded address
    table.timestamp('recorded_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('CASCADE');

    // Indexes for efficient location queries
    table.index('driver_id');
    table.index('recorded_at');
    table.index(['driver_id', 'recorded_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('driver_locations');
};

