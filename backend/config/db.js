const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.cdqppolfiyhkvcqhkivy:12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
    connectionString,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
