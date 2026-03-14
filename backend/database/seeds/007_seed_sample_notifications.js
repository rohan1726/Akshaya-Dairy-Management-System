/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('notifications').del();

  const notifications = [
    {
      id: '60000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002', // driver1
      user_role: 'driver',
      title: 'Welcome to Akshaya Dairy',
      message: 'You have been assigned to Shinde Dairy Farm. Start your duty to begin collecting milk.',
      type: 'general',
      priority: 'medium',
      is_read: false,
      created_at: knex.fn.now(),
    },
    {
      id: '60000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000004', // vendor1
      user_role: 'vendor',
      title: 'Milk Collection Completed',
      message: 'Your morning milk collection has been recorded. Total: 50.5 kg',
      type: 'milk_collection',
      priority: 'low',
      is_read: false,
      metadata: {
        collection_id: '50000000-0000-0000-0000-000000000001',
        weight: 50.5,
        amount: 2588.13
      },
      created_at: knex.fn.now(),
    },
    {
      id: '60000000-0000-0000-0000-000000000003',
      user_role: 'all',
      title: 'Daily Milk Rate Updated',
      message: 'Today\'s milk base price has been set to ₹40.00 per liter',
      type: 'rate_update',
      priority: 'high',
      is_read: false,
      created_at: knex.fn.now(),
    },
  ];

  await knex('notifications').insert(notifications);
};

