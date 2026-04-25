import fs from 'fs';
const content = fs.readFileSync('prisma/full_schema.sql', 'utf16le');
fs.writeFileSync('prisma/full_schema_utf8.sql', content, 'utf8');
