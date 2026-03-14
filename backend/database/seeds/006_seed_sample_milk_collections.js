/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('milk_collections').del();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const collections = [
    // Today's morning collections
    {
      id: '50000000-0000-0000-0000-000000000001',
      vendor_id: '10000000-0000-0000-0000-000000000001', // Shinde Dairy Farm
      driver_id: '20000000-0000-0000-0000-000000000001', // driver1
      center_id: '10000000-0000-0000-0000-000000000001',
      collection_code: 'MC-' + todayStr.replace(/-/g, '') + '-001',
      collection_date: todayStr,
      collection_time: 'morning',
      milk_type: 'mix_milk',
      milk_weight: 50.50,
      base_value: 40.00,
      fat_percentage: 4.5,
      snf_percentage: 8.5,
      rate_per_liter: 51.25, // base + (fat * 2.5) + (snf * 1.5)
      total_amount: 2588.13,
      can_number: 'CAN-001',
      can_weight_kg: 2.5,
      status: 'collected',
      collected_at: knex.fn.now(),
      created_by: '00000000-0000-0000-0000-000000000002', // driver1
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      vendor_id: '10000000-0000-0000-0000-000000000002', // Jadhav Milk Center
      driver_id: '20000000-0000-0000-0000-000000000002', // driver2
      center_id: '10000000-0000-0000-0000-000000000002',
      collection_code: 'MC-' + todayStr.replace(/-/g, '') + '-002',
      collection_date: todayStr,
      collection_time: 'morning',
      milk_type: 'cow',
      milk_weight: 45.75,
      base_value: 42.00,
      fat_percentage: 4.0,
      snf_percentage: 8.0,
      rate_per_liter: 52.75,
      total_amount: 2413.31,
      can_number: 'CAN-002',
      can_weight_kg: 2.5,
      status: 'collected',
      collected_at: knex.fn.now(),
      created_by: '00000000-0000-0000-0000-000000000003', // driver2
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    // Yesterday's collections
    {
      id: '50000000-0000-0000-0000-000000000003',
      vendor_id: '10000000-0000-0000-0000-000000000001',
      driver_id: '20000000-0000-0000-0000-000000000001',
      center_id: '10000000-0000-0000-0000-000000000001',
      collection_code: 'MC-' + yesterdayStr.replace(/-/g, '') + '-001',
      collection_date: yesterdayStr,
      collection_time: 'morning',
      milk_type: 'mix_milk',
      milk_weight: 48.25,
      base_value: 40.00,
      fat_percentage: 4.3,
      snf_percentage: 8.4,
      rate_per_liter: 50.95,
      total_amount: 2458.34,
      can_number: 'CAN-001',
      can_weight_kg: 2.5,
      status: 'delivered',
      collected_at: knex.raw("? - INTERVAL '1 day'", [knex.fn.now()]),
      created_by: '00000000-0000-0000-0000-000000000002',
      created_at: knex.raw("? - INTERVAL '1 day'", [knex.fn.now()]),
      modified_at: knex.raw("? - INTERVAL '1 day'", [knex.fn.now()]),
    },
    {
      id: '50000000-0000-0000-0000-000000000004',
      vendor_id: '10000000-0000-0000-0000-000000000001',
      driver_id: '20000000-0000-0000-0000-000000000001',
      center_id: '10000000-0000-0000-0000-000000000001',
      collection_code: 'MC-' + yesterdayStr.replace(/-/g, '') + '-002',
      collection_date: yesterdayStr,
      collection_time: 'evening',
      milk_type: 'buffalo',
      milk_weight: 35.50,
      base_value: 45.00,
      fat_percentage: 6.0,
      snf_percentage: 9.0,
      rate_per_liter: 66.00,
      total_amount: 2343.00,
      can_number: 'CAN-003',
      can_weight_kg: 3.0,
      status: 'delivered',
      collected_at: knex.raw("? - INTERVAL '1 day'", [knex.fn.now()]),
      created_by: '00000000-0000-0000-0000-000000000002',
      created_at: knex.raw("? - INTERVAL '1 day'", [knex.fn.now()]),
      modified_at: knex.raw("? - INTERVAL '1 day'", [knex.fn.now()]),
    },
  ];

  await knex('milk_collections').insert(collections);
};

