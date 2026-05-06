import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL?.trim()}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Fetch university_majors (Constraint: DO NOT MODIFY this table)
  const allMajors = await prisma.university_majors.findMany();

  if (allMajors.length === 0) {
    console.warn('⚠️ No university_majors found in the database.');
    console.warn(
      'Please ensure university_majors table is populated before running the seed script.'
    );
  }

  // 2. Clear existing data
  console.log('🧹 Cleaning existing data (excluding university_majors)...');
  await prisma.notifications.deleteMany({});
  await prisma.daily_reminders.deleteMany({});
  await prisma.file_reports.deleteMany({});
  await prisma.files_likes.deleteMany({});
  await prisma.studyList_likes.deleteMany({});
  await prisma.saved_study_lists.deleteMany({});
  await prisma.study_list_files.deleteMany({});
  await prisma.study_lists.deleteMany({});
  await prisma.files.deleteMany({});
  await prisma.follows.deleteMany({});
  await prisma.user_information.deleteMany({});
  await prisma.subjects.deleteMany({});
  await prisma.users.deleteMany({});

  // 3. Create Users
  console.log('👤 Creating users...');
  const users = [];
  const hashedPassword = await bcrypt.hash('password123', 12);

  for (let i = 0; i < 10; i++) {
    const user = await prisma.users.create({
      data: {
        username: faker.internet.username(),
        fullname: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        is_active: true,
        role: i === 0 ? 'admin' : 'user',
      },
    });
    users.push(user);

    // 4. Create User Information (consistent with university_majors)
    if (allMajors.length > 0) {
      const randomMajor = faker.helpers.arrayElement(allMajors);
      await prisma.user_information.create({
        data: {
          id_user: user.id_user,
          major: randomMajor.major || 'Unknown Major',
          academic_year: randomMajor.academic_year,
          specialization: randomMajor.specialization,
          university: 'Université Abou Bekr Belkaid, Tlemcen',
        },
      });
    }
  }

  // 5. Create Subjects (based on university_majors)
  console.log('📚 Creating subjects...');
  const subjects = [];
  if (allMajors.length > 0) {
    // Group by course to have unique subjects
    const uniqueCourses = [];
    const seenCourses = new Set();

    for (const m of allMajors) {
      if (m.course && !seenCourses.has(m.course)) {
        uniqueCourses.push(m);
        seenCourses.add(m.course);
      }
    }

    for (const m of uniqueCourses.slice(0, 15)) {
      // Limit to 15 subjects
      const subject = await prisma.subjects.create({
        data: {
          university: 'Université Abou Bekr Belkaid, Tlemcen',
          academic_year: m.academic_year,
          major: m.major || 'General',
          specialization: m.specialization,
          course: m.course,
        },
      });
      subjects.push(subject);
    }
  } else {
    // Fallback if no majors exist (though user said they should exist)
    for (let i = 0; i < 5; i++) {
      const subject = await prisma.subjects.create({
        data: {
          academic_year: 'L' + faker.number.int({ min: 1, max: 3 }),
          major: 'Informatique',
          course: faker.company.buzzNoun(),
        },
      });
      subjects.push(subject);
    }
  }

  // 6. Create Files
  console.log('📄 Creating files...');
  const files = [];
  for (let i = 0; i < 30; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomSubject = faker.helpers.arrayElement(subjects);
    const status = faker.helpers.arrayElement([
      'pending',
      'accepted',
      'rejected',
    ]);
    const file = await prisma.files.create({
      data: {
        id_user: randomUser.id_user,
        id_subject: randomSubject.id_subject,
        title: faker.commerce.productName() + ' Lecture Notes',
        creation_year: faker.date.past({ years: 3 }).getFullYear().toString(),
        file_path: faker.helpers.arrayElement([
          'https://res.cloudinary.com/dtgvaabon/image/upload/v1777764469/files/poawxknvn41vkjozb2rm.pdf',

          'https://res.cloudinary.com/dtgvaabon/image/upload/v1777764590/files/foa4sa8z11jcm5rkhfj9.pdf',

          'https://res.cloudinary.com/dtgvaabon/image/upload/v1777764664/files/rd4t47f4cxtu3nqvkcbq.pdf',

          'https://res.cloudinary.com/dtgvaabon/image/upload/v1777764702/files/ga0qklhciswqewefborb.pdf',

          'https://res.cloudinary.com/dtgvaabon/image/upload/v1777764763/files/mpcg0zwdcvbhqsferptm.pdf',

          'https://res.cloudinary.com/dtgvaabon/image/upload/v1777764792/files/ebh8nvmvrnpp1b9rreis.pdf',
        ]),
        type: faker.helpers.arrayElement([
          'TD',
          'TP',
          'COURS',
          'EF',
          'CC',
          'RESUME',
          'OTHER',
        ]),
        status: status,
        ...(status === 'rejected' && {
          reason_rejected: faker.lorem.sentence(),
        }),
        approved_at:
          status === 'accepted' || status === 'rejected' ? new Date() : null,
      },
    });
    files.push(file);
  }

  // 7. Create Study Lists
  console.log('📂 Creating study lists...');
  for (let i = 0; i < 10; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomSubject = faker.helpers.arrayElement(subjects);
    const studyList = await prisma.study_lists.create({
      data: {
        id_user: randomUser.id_user,
        id_subject: randomSubject.id_subject,
        name: faker.commerce.productAdjective() + ' Study Guide',
        description: faker.lorem.sentence(),
        privacy: faker.helpers.arrayElement(['public', 'private']),
      },
    });

    // Add some files to the study list
    const randomFiles = faker.helpers.arrayElements(files, { min: 2, max: 5 });
    for (const file of randomFiles) {
      if (file.status !== 'accepted') {
        continue;
      }
      await prisma.study_list_files.create({
        data: {
          id_stuList: studyList.id_stuList,
          id_file: file.id_file,
        },
      });
    }
  }

  const allStudyLists = await prisma.study_lists.findMany();

  // 8. Create Interactions (Likes/Bookmarks)
  console.log('✨ Creating interactions (likes/dislikes)...');
  for (let i = 0; i < 50; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomFile = faker.helpers.arrayElement(files);

    try {
      await prisma.files_likes.create({
        data: {
          id_user: randomUser.id_user,
          id_file: randomFile.id_file,
          type: faker.helpers.arrayElement(['LIKE', 'DISLIKE']),
        },
      });
    } catch (e) {
      // Skip if unique constraint violated (user already liked file)
    }
  }

  console.log('🔖 Creating study list likes...');
  for (let i = 0; i < 20; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomList = faker.helpers.arrayElement(allStudyLists);

    try {
      await prisma.studyList_likes.create({
        data: {
          id_user: randomUser.id_user,
          id_stuList: randomList.id_stuList,
        },
      });
    } catch (e) {
      // Skip duplicates
    }
  }

  // 9. Create Follows
  console.log('👥 Creating follows...');
  const followPairs = new Set();
  for (let i = 0; i < 20; i++) {
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(users);

    if (follower.id_user !== following.id_user) {
      const pair = `${follower.id_user}-${following.id_user}`;
      if (!followPairs.has(pair)) {
        await prisma.follows.create({
          data: {
            follower_id: follower.id_user,
            following_id: following.id_user,
          },
        });
        followPairs.add(pair);
      }
    }
  }

  // 10. Create File Reports
  console.log('🚩 Creating file reports...');
  for (let i = 0; i < 10; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomFile = faker.helpers.arrayElement(files);
    await prisma.file_reports.create({
      data: {
        id_user: randomUser.id_user,
        id_file: randomFile.id_file,
        reason: faker.helpers.arrayElement([
          'Inappropriate content',
          'COPYRIGHT issuse',
          'Spam or misleading',
          'Incorrect information',
          'Other',
        ]),
        details: faker.lorem.sentence(),
        status: 'pending',
      },
    });
  }

  // 11. Create Saved Study Lists
  console.log('🔖 Creating saved study lists...');
  const savedListPairs = new Set();

  for (let i = 0; i < 15; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const randomList = faker.helpers.arrayElement(allStudyLists);

    // Ensure user is not saving their own list (optional but realistic)
    if (randomUser.id_user !== randomList.id_user) {
      const pair = `${randomUser.id_user}-${randomList.id_stuList}`;
      if (!savedListPairs.has(pair)) {
        await prisma.saved_study_lists.create({
          data: {
            id_user: randomUser.id_user,
            id_stuList: randomList.id_stuList,
          },
        });
        savedListPairs.add(pair);
      }
    }
  }

  console.log('🚀 Seeding finished successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
