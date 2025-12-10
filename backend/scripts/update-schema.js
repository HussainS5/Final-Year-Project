const db = require('../config/db');

async function updateSchema() {
    try {
        console.log('Adding missing columns to users table...');

        const queries = [
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS dream_job VARCHAR(150)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(100)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_expectation VARCHAR(100)',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS current_job_title VARCHAR(150)'
        ];

        for (const query of queries) {
            await db.query(query);
            console.log(`Executed: ${query}`);
        }

        console.log('Schema update completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
