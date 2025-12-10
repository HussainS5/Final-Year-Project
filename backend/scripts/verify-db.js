const db = require('../config/db');

async function verifyDb() {
    try {
        console.log('Verifying database tables...');
        const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('Tables found:', res.rows.map(r => r.table_name));

        if (res.rows.length > 0) {
            console.log('Database verification successful.');
            process.exit(0);
        } else {
            console.error('No tables found!');
            process.exit(1);
        }
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verifyDb();
