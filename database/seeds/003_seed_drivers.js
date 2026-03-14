/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('drivers').del();

  const drivers = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      driver_id: '00000000-0000-0000-0000-000000000002', // driver1 user
      center_id: '10000000-0000-0000-0000-000000000001', // Shinde Dairy Farm
      aadhar_card: {
        number: '123456789012',
        front_image: null,
        back_image: null
      },
      pan_card: {
        number: 'ABCDE1234F',
        image: null
      },
      license_number: 'DL-1234567890',
      license_expiry: '2025-12-31',
      vehicle_number: 'MH-12-AB-1234',
      vehicle_type: 'bike',
      salary_per_month: 15000.00,
      joining_date: '2024-01-01',
      is_on_duty: false,
      emergency_contact_name: 'Ramesh Kumar',
      emergency_contact_mobile: '9876543210',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      driver_id: '00000000-0000-0000-0000-000000000003', // driver2 user
      center_id: '10000000-0000-0000-0000-000000000002', // Jadhav Milk Center
      aadhar_card: {
        number: '123456789013',
        front_image: null,
        back_image: null
      },
      pan_card: {
        number: 'FGHIJ5678K',
        image: null
      },
      license_number: 'DL-0987654321',
      license_expiry: '2026-06-30',
      vehicle_number: 'MH-12-CD-5678',
      vehicle_type: 'auto',
      salary_per_month: 18000.00,
      joining_date: '2024-02-01',
      is_on_duty: false,
      emergency_contact_name: 'Laxman Patil',
      emergency_contact_mobile: '9876543211',
      created_by: '00000000-0000-0000-0000-000000000001', // admin
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
  ];

  await knex('drivers').insert(drivers);
};

