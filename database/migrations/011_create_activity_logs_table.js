/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('activity_logs', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.string('action', 100).notNullable(); // e.g., 'add_milk', 'edit_rate', 'deactivate_driver'
    table.string('entity_type', 50).notNullable(); // e.g., 'milk_collection', 'driver', 'payment'
    table.uuid('entity_id'); // ID of the affected entity
    table.text('description');
    table.jsonb('old_values'); // Previous state (for updates)
    table.jsonb('new_values'); // New state
    table.string('ip_address', 45);
    table.string('user_agent', 500);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Indexes
    table.index('user_id');
    table.index('action');
    table.index('entity_type');
    table.index('entity_id');
    table.index('created_at');
    table.index(['entity_type', 'entity_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('activity_logs');
};

