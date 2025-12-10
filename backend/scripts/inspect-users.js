const db = require('../config/db');

async function inspectUsersTable() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Columns in users table:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error inspecting table:', err);
        process.exit(1);
    }
}

inspectUsersTable();
