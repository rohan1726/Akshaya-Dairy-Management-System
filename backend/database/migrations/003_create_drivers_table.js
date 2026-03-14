/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('drivers', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('driver_id').notNullable(); // FK to users.id
    table.uuid('center_id'); // Assigned center (nullable, can be reassigned)
    table.jsonb('aadhar_card');
    table.jsonb('pan_card');
    table.string('license_number', 50);
    table.date('license_expiry');
    table.string('vehicle_number', 20);
    table.string('vehicle_type', 50); // bike, auto, truck, etc.
    table.decimal('salary_per_month', 10, 2);
    table.date('joining_date');
    table.boolean('is_on_duty').defaultTo(false);
    table.string('emergency_contact_name', 100);
    table.string('emergency_contact_mobile', 15);
    table.jsonb('additional_info');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('driver_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('center_id').references('id').inTable('dairy_centers').onDelete('SET NULL');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('driver_id');
    table.index('center_id');
    table.index('is_on_duty');
    table.index('license_expiry');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('drivers');
};

