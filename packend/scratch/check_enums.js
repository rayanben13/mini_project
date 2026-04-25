import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkEnums() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const enums = [
      'ReportStatus', 'FileType', 'FileStatus', 'FileLikeType', 
      'RelatedType', 'Privacy', 'AcademicYear', 'Roles'
    ];

    for (const enumName of enums) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_type WHERE typname = '${enumName}'
        );
      `);
      console.log(`Exists ${enumName}:`, result.rows[0].exists);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkEnums();
