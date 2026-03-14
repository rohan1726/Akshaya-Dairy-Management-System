/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('dairy_centers').del();

  const centers = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000004', // vendor1
      dairy_name: 'Shinde Dairy Farm',
      address: {
        street: 'Village Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        landmark: 'Near Temple'
      },
      contact_mobile: '9876543213',
      is_active: true,
      qr_code: 'DC-001-QR-CODE',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000005', // vendor2
      dairy_name: 'Jadhav Milk Center',
      address: {
        street: 'Main Street',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411002',
        landmark: 'Opposite School'
      },
      contact_mobile: '9876543214',
      is_active: true,
      qr_code: 'DC-002-QR-CODE',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      user_id: '00000000-0000-0000-0000-000000000006', // vendor3
      dairy_name: 'Gaikwad Dairy',
      address: {
        street: 'Farm Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411003',
        landmark: 'Near Market'
      },
      contact_mobile: '9876543215',
      is_active: true,
      qr_code: 'DC-003-QR-CODE',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
  ];

  await knex('dairy_centers').insert(centers);
};

