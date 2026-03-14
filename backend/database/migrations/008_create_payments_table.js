/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('payments', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('vendor_id').notNullable(); // FK to dairy_centers.id
    table.string('payment_code', 50).unique().notNullable();
    table.enum('payment_type', ['monthly_milk', 'driver_salary', 'advance', 'adjustment']).notNullable();
    table.date('payment_month'); // For monthly payments (YYYY-MM-01)
    table.decimal('total_amount', 10, 2).notNullable();
    table.decimal('advance_amount', 10, 2).defaultTo(0);
    table.decimal('previous_pending', 10, 2).defaultTo(0);
    table.decimal('deductions', 10, 2).defaultTo(0);
    table.decimal('final_amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'approved', 'paid', 'cancelled']).defaultTo('pending');
    table.text('payment_notes');
    table.string('transaction_id', 100); // Bank transaction ID
    table.string('payment_method', 50); // cash, bank_transfer, upi, etc.
    table.timestamp('paid_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('vendor_id').references('id').inTable('dairy_centers').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('vendor_id');
    table.index('payment_month');
    table.index('status');
    table.index('payment_code');
    table.index(['vendor_id', 'payment_month']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('payments');
};

