/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('notifications', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id'); // Nullable - can be broadcast to all users
    table.enum('user_role', ['admin', 'driver', 'vendor', 'all']).notNullable();
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.enum('type', [
      'duty_status',
      'milk_collection',
      'payment_released',
      'low_fat_alert',
      'license_expiry',
      'rate_update',
      'collection_confirmation',
      'general'
    ]).notNullable();
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.boolean('is_read').defaultTo(false);
    table.jsonb('metadata'); // Additional data (collection_id, payment_id, etc.)
    table.timestamp('read_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Indexes
    table.index('user_id');
    table.index('user_role');
    table.index('is_read');
    table.index('type');
    table.index('created_at');
    table.index(['user_id', 'is_read']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('notifications');
};

