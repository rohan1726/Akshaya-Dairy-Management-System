# Database Migrations & Seeds

This directory contains all database migration and seed files for the Akshaya Dairy Management System.

## 📁 Directory Structure

```
database/
├── migrations/          # Database schema migrations
│   ├── 001_create_users_table.js
│   ├── 002_create_dairy_centers_table.js
│   ├── 003_create_drivers_table.js
│   ├── 004_create_driver_locations_table.js
│   ├── 005_create_milk_collections_table.js
│   ├── 006_create_milk_plants_table.js
│   ├── 007_create_milk_prices_table.js
│   ├── 008_create_payments_table.js
│   ├── 009_create_driver_salaries_table.js
│   ├── 010_create_notifications_table.js
│   ├── 011_create_activity_logs_table.js
│   └── 012_create_driver_center_assignments_table.js
└── seeds/               # Sample data seeds
    ├── 001_seed_users.js
    ├── 002_seed_dairy_centers.js
    ├── 003_seed_drivers.js
    ├── 004_seed_milk_prices.js
    ├── 005_seed_driver_center_assignments.js
    ├── 006_seed_sample_milk_collections.js
    └── 007_seed_sample_notifications.js
```

## 🚀 Setup Instructions

### Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** and **npm** installed
3. **Knex.js** installed globally (optional): `npm install -g knex`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=akshaya_dairy
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install

# Install Knex.js CLI globally (optional)
npm install -g knex
```

## 📊 Running Migrations

### Create Database

First, create the PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE akshaya_dairy;
\q
```

### Run All Migrations

```bash
# Using npm script (if configured in package.json)
npm run migrate

# Or using Knex CLI directly
npx knex migrate:latest

# Or using Knex CLI with environment
NODE_ENV=development npx knex migrate:latest
```

### Rollback Migrations

```bash
# Rollback last batch
npx knex migrate:rollback

# Rollback all migrations
npx knex migrate:rollback --all
```

### Check Migration Status

```bash
npx knex migrate:status
```

## 🌱 Running Seeds

### Run All Seeds

```bash
# Using npm script (if configured in package.json)
npm run seed

# Or using Knex CLI directly
npx knex seed:run

# Or using Knex CLI with environment
NODE_ENV=development npx knex seed:run
```

### Run Specific Seed

```bash
npx knex seed:run --specific=001_seed_users.js
```

### Reset Database (Rollback + Re-run)

```bash
# Rollback all migrations
npx knex migrate:rollback --all

# Run all migrations again
npx knex migrate:latest

# Run all seeds
npx knex seed:run
```

## 📋 Migration Files Overview

### 001_create_users_table.js
- Stores all user accounts (admin, driver, vendor)
- Includes authentication fields, profile data, and role management

### 002_create_dairy_centers_table.js
- Dairy center/vendor information
- Includes QR code for driver scanning

### 003_create_drivers_table.js
- Driver-specific information
- Vehicle details, license, salary, duty status

### 004_create_driver_locations_table.js
- GPS tracking data for drivers
- Stores location history with timestamps

### 005_create_milk_collections_table.js
- Main milk collection records
- Includes fat/SNF percentages, pricing, and status tracking

### 006_create_milk_plants_table.js
- Milk plant delivery tracking
- Records deliveries to processing plants

### 007_create_milk_prices_table.js
- Daily milk pricing configuration
- Base price, fat rate, SNF rate per milk type

### 008_create_payments_table.js
- Payment records for dairy centers
- Monthly payments, advances, adjustments

### 009_create_driver_salaries_table.js
- Driver salary management
- Monthly salary calculations with overtime and deductions

### 010_create_notifications_table.js
- System notifications
- User-specific and broadcast notifications

### 011_create_activity_logs_table.js
- Audit trail for all system activities
- Tracks who did what and when

### 012_create_driver_center_assignments_table.js
- Driver-to-center assignment history
- Tracks assignment changes over time

## 🌱 Seed Files Overview

### 001_seed_users.js
- Creates 1 admin user
- Creates 2 driver users
- Creates 3 vendor (dairy center) users
- Default password for all: `password123`

### 002_seed_dairy_centers.js
- Creates 3 sample dairy centers
- Links to vendor users

### 003_seed_drivers.js
- Creates 2 sample drivers
- Links to driver users and centers

### 004_seed_milk_prices.js
- Creates today's milk prices for all milk types
- Sets base price, fat rate, and SNF rate

### 005_seed_driver_center_assignments.js
- Assigns drivers to centers
- Creates assignment records

### 006_seed_sample_milk_collections.js
- Creates sample milk collection records
- Includes today's and yesterday's collections

### 007_seed_sample_notifications.js
- Creates sample notifications
- Different types and priorities

## 🔑 Default Login Credentials

After running seeds, you can login with:

### Admin
- **Mobile/Email**: `9876543210` or `admin@akshayadairy.com`
- **Password**: `password123`

### Driver 1
- **Mobile/Email**: `9876543211` or `driver1@akshayadairy.com`
- **Password**: `password123`

### Driver 2
- **Mobile/Email**: `9876543212` or `driver2@akshayadairy.com`
- **Password**: `password123`

### Vendor 1
- **Mobile/Email**: `9876543213` or `vendor1@akshayadairy.com`
- **Password**: `password123`

### Vendor 2
- **Mobile/Email**: `9876543214` or `vendor2@akshayadairy.com`
- **Password**: `password123`

### Vendor 3
- **Mobile/Email**: `9876543215` or `vendor3@akshayadairy.com`
- **Password**: `password123`

## 📝 Adding New Migrations

To create a new migration:

```bash
npx knex migrate:make migration_name
```

This will create a new file in `database/migrations/` with timestamp prefix.

## 📝 Adding New Seeds

To create a new seed:

```bash
npx knex seed:make seed_name
```

This will create a new file in `database/seeds/` with timestamp prefix.

## ⚠️ Important Notes

1. **UUID Generation**: All tables use UUID primary keys with PostgreSQL's `gen_random_uuid()` function
2. **Foreign Keys**: All foreign keys have appropriate CASCADE or SET NULL actions
3. **Indexes**: Important columns are indexed for query performance
4. **Timestamps**: All tables include `created_at` and `modified_at` timestamps
5. **Soft Deletes**: Consider adding `deleted_at` columns if soft delete functionality is needed
6. **Password Hashing**: Seed file uses bcrypt to hash passwords (ensure bcrypt is installed)

## 🔧 Troubleshooting

### Migration Fails
- Check PostgreSQL is running
- Verify database exists
- Check connection credentials in `.env`
- Ensure user has proper permissions

### Seed Fails
- Ensure all migrations have run successfully
- Check foreign key relationships
- Verify UUIDs match between seed files

### UUID Extension Missing
If you get an error about `gen_random_uuid()`, enable the extension:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Or use PostgreSQL 13+ which has it built-in.

## 📚 Additional Resources

- [Knex.js Documentation](https://knexjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [UUID Extension](https://www.postgresql.org/docs/current/uuid-ossp.html)

