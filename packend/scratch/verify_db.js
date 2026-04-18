import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL?.trim()}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
  const usersCount = await prisma.users.count();
  const filesCount = await prisma.files.count();
  const fileLikesCount = await prisma.files_likes.count();
  const listLikesCount = await prisma.studyList_likes.count();

  console.log('--- Verification Report ---');
  console.log(`Users: ${usersCount}`);
  console.log(`Files: ${filesCount}`);
  console.log(`File Likes: ${fileLikesCount}`);
  console.log(`Study List Likes: ${listLikesCount}`);
  console.log('---------------------------');
}

verify()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
