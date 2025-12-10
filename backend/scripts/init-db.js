const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const schemaPath = path.resolve(__dirname, '../../nextgenai_db_schema.sql');

async function runSchema() {
    try {
        console.log('Reading schema file...');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await db.query(schemaSql);

        console.log('Schema executed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error executing schema:', err);
        process.exit(1);
    }
}

runSchema();
