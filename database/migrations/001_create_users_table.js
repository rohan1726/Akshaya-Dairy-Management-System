/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('mobile_no', 15).unique().notNullable();
    table.string('email', 255).unique();
    table.string('password', 255).notNullable();
    table.enum('role', ['admin', 'driver', 'vendor']).notNullable();
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('aadhar_card', 12);
    table.string('pan_card', 10);
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.date('date_of_birth');
    table.jsonb('profile_image');
    table.jsonb('address');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Indexes
    table.index('mobile_no');
    table.index('email');
    table.index('role');
    table.index('is_active');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};

