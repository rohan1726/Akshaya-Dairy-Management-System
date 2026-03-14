/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('driver_salaries', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('driver_id').notNullable(); // FK to drivers.id
    table.string('salary_code', 50).unique().notNullable();
    table.date('salary_month').notNullable(); // YYYY-MM-01
    table.decimal('base_salary', 10, 2).notNullable();
    table.decimal('overtime_amount', 10, 2).defaultTo(0);
    table.decimal('bonus', 10, 2).defaultTo(0);
    table.decimal('advance_deduction', 10, 2).defaultTo(0);
    table.decimal('other_deductions', 10, 2).defaultTo(0);
    table.decimal('final_amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'approved', 'paid', 'cancelled']).defaultTo('pending');
    table.text('salary_notes');
    table.string('transaction_id', 100);
    table.string('payment_method', 50);
    table.timestamp('paid_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.uuid('modified_by');

    // Foreign keys
    table.foreign('driver_id').references('id').inTable('drivers').onDelete('CASCADE');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('modified_by').references('id').inTable('users').onDelete('SET NULL');

    // Indexes
    table.index('driver_id');
    table.index('salary_month');
    table.index('status');
    table.index('salary_code');
    table.index(['driver_id', 'salary_month']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('driver_salaries');
};

