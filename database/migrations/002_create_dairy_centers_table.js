/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('dairy_centers', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('dairy_name', 255).notNullable();
    table.jsonb('address');
    table.string('contact_mobile', 15);
    table.boolean('is_active').defaultTo(true);
    table.jsonb('center_image');
    table.string('qr_code', 255).unique(); // QR code for driver scanning
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('user_id');
    table.index('is_active');
    table.index('qr_code');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('dairy_centers');
};

