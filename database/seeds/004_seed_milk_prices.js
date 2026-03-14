/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('milk_prices').del();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const prices = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      price_date: todayStr,
      base_price: 40.00, // Base price per liter
      fat_rate: 2.50, // Rate per fat percentage
      snf_rate: 1.50, // Rate per SNF percentage
      milk_type: 'mix_milk',
      is_active: true,
      notes: 'Standard pricing for mixed milk',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      price_date: todayStr,
      base_price: 42.00,
      fat_rate: 2.75,
      snf_rate: 1.75,
      milk_type: 'cow',
      is_active: true,
      notes: 'Cow milk pricing',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      price_date: todayStr,
      base_price: 45.00,
      fat_rate: 3.00,
      snf_rate: 2.00,
      milk_type: 'buffalo',
      is_active: true,
      notes: 'Buffalo milk pricing',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
  ];

  await knex('milk_prices').insert(prices);
};

