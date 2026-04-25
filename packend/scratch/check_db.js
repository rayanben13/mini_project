import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // Check if _prisma_migrations exists
    const migrationsTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `);
    console.log('Exists _prisma_migrations:', migrationsTable.rows[0].exists);

    if (migrationsTable.rows[0].exists) {
      const migrations = await client.query('SELECT * FROM _prisma_migrations');
      console.log('Migrations:', migrations.rows);
    }

    // Check for RelatedType
    const relatedType = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_type WHERE typname = 'RelatedType'
      );
    `);
    console.log('Exists RelatedType:', relatedType.rows[0].exists);

    // Check university_majors count
    const majorsCount = await client.query('SELECT COUNT(*) FROM university_majors');
    console.log('university_majors count:', majorsCount.rows[0].count);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkDb();
