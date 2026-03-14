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
      base_price: 36.00, // Base price for 3.5 FAT, 8.5 SNF (Cow milk)
      base_fat: 3.5, // Base FAT percentage
      base_snf: 8.5, // Base SNF percentage
      fat_rate: 5.0, // Rate per 1% FAT difference (0.50 per 0.1%)
      snf_rate: 5.0, // Rate per 1% SNF difference (0.50 per 0.1%)
      bonus: 1.00, // Bonus amount (+1 Rs)
      milk_type: 'cow',
      is_active: true,
      notes: 'Cow milk pricing - Base: 3.5 FAT, 8.5 SNF = 37 Rs/Litre (36 + 1)',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      price_date: todayStr,
      base_price: 51.00, // Base price for 6.0 FAT, 9.0 SNF (Buffalo milk)
      base_fat: 6.0, // Base FAT percentage
      base_snf: 9.0, // Base SNF percentage
      fat_rate: 5.0, // Rate per 1% FAT difference (0.50 per 0.1%)
      snf_rate: 5.0, // Rate per 1% SNF difference (0.50 per 0.1%)
      bonus: 1.00, // Bonus amount (+1 Rs)
      milk_type: 'buffalo',
      is_active: true,
      notes: 'Buffalo milk pricing - Base: 6.0 FAT, 9.0 SNF = 52 Rs/Litre (51 + 1)',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      price_date: todayStr,
      base_price: 40.00, // Base price for mix milk (average)
      base_fat: 4.5, // Base FAT percentage (average)
      base_snf: 8.75, // Base SNF percentage (average)
      fat_rate: 5.0, // Rate per 1% FAT difference
      snf_rate: 5.0, // Rate per 1% SNF difference
      bonus: 1.00, // Bonus amount
      milk_type: 'mix_milk',
      is_active: true,
      notes: 'Mixed milk pricing - Average of cow and buffalo',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
  ];

  await knex('milk_prices').insert(prices);
};

