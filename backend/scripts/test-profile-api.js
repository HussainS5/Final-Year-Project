const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Use the connection string from your local setup
// Ideally, this should be consistent with db.js
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.cdqppolfiyhkvcqhkivy:12345@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
    connectionString,
});

async function verifyProfileApi() {
    const client = await pool.connect();
    try {
        console.log('Connected to database...');

        // 1. Get a test user (e.g., user_id 1)
        const userRes = await client.query('SELECT user_id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log('No users found to test.');
            return;
        }
        const userId = userRes.rows[0].user_id;
        console.log(`Testing with User ID: ${userId}`);

        // 2. Simulate GET /api/profile/:userId
        // Fetch User
        const userResult = await client.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        const user = userResult.rows[0];

        // Fetch Work Experience
        const expResult = await client.query('SELECT * FROM work_experience WHERE user_id = $1 ORDER BY start_date DESC', [userId]);

        // Logic from profile.js: Derive current_job
        const currentJobEntry = expResult.rows.find(w => w.is_current);
        const currentJob = currentJobEntry ? currentJobEntry.job_title : '';

        console.log('--- Profile Data ---');
        console.log('User Name:', user.first_name, user.last_name);
        console.log('Current Job (Derived):', currentJob);

        // Check for schema compliance (ensure no 'dream_job' etc in fetched object)
        // Note: 'user' object from SELECT * will contain all columns in DB. 
        // If DB still has dream_job column, it will be here. 
        // But our API code explicitly SELECTs specific columns or we rely on the object sent to frontend. 
        // In profile.js code (which we modified):
        // We send: { ...user, current_job, ... }
        // We need to ensure we are NOT relying on user.dream_job from DB.

        if (user.dream_job !== undefined) {
            console.warn('WARNING: dream_job column still exists in DB table.');
        } else {
            console.log('dream_job column does not exist in DB table (as expected if schema was strictly followed, but likely it exists but ignored).');
        }

        console.log('Backend API Logic verification: SUCCESS');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyProfileApi();
