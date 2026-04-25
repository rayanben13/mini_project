import prisma from '../lib/prisma.ts';

// import { schemaSearchFile } from '../schemas/auth.schema.js';

export const searchFiles = async (req, res) => {
  try {
    // const Me = req.user;

    // const { error, value } = schemaSearchFile.validate(req.query);

    // if (error) {
    //   return res.status(400).json({
    //     error: 'Invalid query',
    //     details: error.details.map((e) => e.message),
    //   });
    // }

    const title = req.query.title?.trim();
    const university = req.query.university?.trim();
    const major = req.query.major?.trim();
    const academic_year = req.query.academic_year?.trim();
    const specialization = req.query.specialization?.trim();
    const type = req.query.type?.trim();
    const year_creation = req.query.year_creation?.trim();

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 🟢 COUNT (نفس filters تاع search)
    const total_files = await prisma.files.count({
      where: {
        status: 'accepted',
        title: title
          ? {
              contains: title,
              mode: 'insensitive',
            }
          : undefined,

        subjects: {
          university: { mode: 'insensitive', equals: university || undefined },
          academic_year: {
            mode: 'insensitive',
            equals: academic_year || undefined,
          },
          major: { mode: 'insensitive', equals: major || undefined },
          specialization: {
            mode: 'insensitive',
            equals: specialization || undefined,
          },
        },

        type: type || undefined,
        year_creation: year_creation || undefined,
      },
    });

    // 🟢 FIND
    const files = await prisma.files.findMany({
      where: {
        status: 'accepted',

        title: title
          ? {
              contains: title,
              mode: 'insensitive',
            }
          : undefined,

        subjects: {
          university: university || undefined,
          academic_year: academic_year || undefined,
          major: major || undefined,
          specialization: specialization || undefined,
        },

        type: type || undefined,
        year_creation: year_creation || undefined,
      },

      select: {
        id_file: true,
        file_path: true,
        title: true,
        type: true,
        status: true,
        subjects: {
          select: {
            major: true,
            specialization: true,
            academic_year: true,
            course: true,
          },
        },
      },

      skip,
      take: limit,
    });

    const formatted = files.map((item) => ({
      id_file: item.id_file,
      file_path: item.file_path,
      title: item.title,
      type_file: item.type,
      major: item.subjects?.major,
      specialization: item.subjects?.specialization,
      academic_year: item.subjects?.academic_year,
      course: item.subjects?.course,
      status: item.status,
    }));

    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_files / limit),
        per_page: limit,
        total_files,
        from: total_files === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + files.length,
      },
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const searchSubjects = async (req, res) => {
  try {
    const course = req.query.course?.trim();
    const major = req.query.major?.trim();
    const academic_year = req.query.academic_year?.trim();
    const specialization = req.query.specialization?.trim();

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 🟢 COUNT (نفس filters تاع search)
    const total_subjects = await prisma.subjects.count({
      where: {
        course: course
          ? {
              contains: course,
              mode: 'insensitive',
            }
          : undefined,

        major: { mode: 'insensitive', equals: major || undefined },

        academic_year: {
          mode: 'insensitive',
          equals: academic_year || undefined,
        },

        specialization: {
          mode: 'insensitive',
          equals: specialization || undefined,
        },
      },
    });

    // 🟢 FIND
    const subjects = await prisma.subjects.findMany({
      where: {
        course: course
          ? {
              contains: course,
              mode: 'insensitive',
            }
          : undefined,

        major: { mode: 'insensitive', equals: major || undefined },

        academic_year: {
          mode: 'insensitive',
          equals: academic_year || undefined,
        },

        specialization: {
          mode: 'insensitive',
          equals: specialization || undefined,
        },
      },

      select: {
        id_subject: true,
        course: true,
        major: true,
        specialization: true,
        academic_year: true,

        _count: {
          select: {
            files: true,
          },
        },
      },

      skip,
      take: limit,
    });

    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_subjects / limit),
        per_page: limit,
        total_subjects,
        from: total_subjects === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + subjects.length,
      },
      data: subjects,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
