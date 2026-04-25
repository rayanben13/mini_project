import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL?.trim();
const pool = new Pool({ connectionString });

async function runSql(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    const client = await pool.connect();
    try {
        console.log(`Executing SQL from ${filePath}...`);
        await client.query(sql);
        console.log('✅ SQL executed successfully.');
    } catch (err) {
        console.error('❌ Error executing SQL:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

const file = process.argv[2];
if (!file) {
    console.error('Please provide a SQL file path.');
} else {
    runSql(file);
}
