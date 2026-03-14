/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('driver_center_assignments').del();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const assignments = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      driver_id: '20000000-0000-0000-0000-000000000001', // driver1
      center_id: '10000000-0000-0000-0000-000000000001', // Shinde Dairy Farm
      assigned_date: todayStr,
      is_active: true,
      notes: 'Primary assignment',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      driver_id: '20000000-0000-0000-0000-000000000002', // driver2
      center_id: '10000000-0000-0000-0000-000000000002', // Jadhav Milk Center
      assigned_date: todayStr,
      is_active: true,
      notes: 'Primary assignment',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      driver_id: '20000000-0000-0000-0000-000000000001', // driver1 (can be assigned to multiple)
      center_id: '10000000-0000-0000-0000-000000000003', // Gaikwad Dairy
      assigned_date: todayStr,
      is_active: true,
      notes: 'Secondary assignment',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
  ];

  await knex('driver_center_assignments').insert(assignments);
};

