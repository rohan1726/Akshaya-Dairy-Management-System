const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash password for all users (default password: 'password123')
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin user
  const adminUser = {
    id: '00000000-0000-0000-0000-000000000001',
    mobile_no: '9876543210',
    email: 'admin@akshayadairy.com',
    password: hashedPassword,
    role: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    is_active: true,
    is_verified: true,
    created_at: knex.fn.now(),
    modified_at: knex.fn.now(),
  };

  // Driver users
  const driverUsers = [
    {
      id: '00000000-0000-0000-0000-000000000002',
      mobile_no: '9876543211',
      email: 'driver1@akshayadairy.com',
      password: hashedPassword,
      role: 'driver',
      first_name: 'Rajesh',
      last_name: 'Kumar',
      aadhar_card: '123456789012',
      is_active: true,
      is_verified: true,
      date_of_birth: '1990-05-15',
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      mobile_no: '9876543212',
      email: 'driver2@akshayadairy.com',
      password: hashedPassword,
      role: 'driver',
      first_name: 'Suresh',
      last_name: 'Patil',
      aadhar_card: '123456789013',
      is_active: true,
      is_verified: true,
      date_of_birth: '1988-08-20',
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
  ];

  // Vendor (Dairy Center) users
  const vendorUsers = [
    {
      id: '00000000-0000-0000-0000-000000000004',
      mobile_no: '9876543213',
      email: 'vendor1@akshayadairy.com',
      password: hashedPassword,
      role: 'vendor',
      first_name: 'Vikram',
      last_name: 'Shinde',
      is_active: true,
      is_verified: true,
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      mobile_no: '9876543214',
      email: 'vendor2@akshayadairy.com',
      password: hashedPassword,
      role: 'vendor',
      first_name: 'Mahesh',
      last_name: 'Jadhav',
      is_active: true,
      is_verified: true,
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      mobile_no: '9876543215',
      email: 'vendor3@akshayadairy.com',
      password: hashedPassword,
      role: 'vendor',
      first_name: 'Ramesh',
      last_name: 'Gaikwad',
      is_active: true,
      is_verified: true,
      created_at: knex.fn.now(),
      modified_at: knex.fn.now(),
    },
  ];

  await knex('users').insert([adminUser, ...driverUsers, ...vendorUsers]);
};

