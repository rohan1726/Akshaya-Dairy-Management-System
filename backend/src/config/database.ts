import knex, { Knex } from 'knex';
import config from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment as keyof typeof config] || config.development;

if (!dbConfig) {
  throw new Error(`Database configuration not found for environment: ${environment}`);
}

const db: Knex = knex(dbConfig);

export default db;

