import prisma from '../lib/prisma.js';

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
    const years = ['L1', 'L2', 'L3', 'M1', 'M2'];
    const type_file = ['TD', 'TP', 'COURS', 'EF', 'CC', 'RESUME', 'OTHER'];

    const title = req.query.title?.trim();
    const university = req.query.university?.trim();
    const major = req.query.major?.trim();
    const academic_year = req.query.academic_year?.trim().toUpperCase();
    const specialization = req.query.specialization?.trim();
    const type = req.query.type?.trim().toUpperCase();
    const year_creation = req.query.year_creation?.trim();

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    if (
      !title &&
      !university &&
      !major &&
      !academic_year &&
      !specialization &&
      !type &&
      !year_creation
    ) {
      return res.status(200).json({
        data: [],
        meta: {
          current_page: 1,
          last_page: 0,
          per_page: limit,
          total_files: 0,
          from: 0,
          to: 0,
        },
      });
    }
    if (academic_year && !years.includes(academic_year)) {
      return res.status(400).json({ error: 'Invalid academic year' });
    }
    if (type && !type_file.includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // 🟢 COUNT (نفس filters تاع search)
    const total_files = await prisma.files.count({
      where: {
        status: 'accepted',
        file_reports: {
          none: {
            status: 'reviewed',
          },
        },
        title: title
          ? {
              contains: title,
              mode: 'insensitive',
            }
          : undefined,

        subjects: {
          university: university
            ? { mode: 'insensitive', equals: university }
            : undefined,
          academic_year: academic_year || undefined,
          major: major ? { mode: 'insensitive', equals: major } : undefined,
          specialization: specialization
            ? { mode: 'insensitive', equals: specialization }
            : undefined,
        },

        type: type || undefined,
        creation_year: year_creation || undefined,
      },
    });

    // 🟢 FIND
    const files = await prisma.files.findMany({
      where: {
        status: 'accepted',
        file_reports: {
          none: {
            status: 'reviewed',
          },
        },
        title: title
          ? {
              contains: title,
              mode: 'insensitive',
            }
          : undefined,

        subjects: {
          university: university
            ? { mode: 'insensitive', equals: university }
            : undefined,
          academic_year: academic_year || undefined,
          major: major ? { mode: 'insensitive', equals: major } : undefined,
          specialization: specialization
            ? { mode: 'insensitive', equals: specialization }
            : undefined,
        },

        type: type || undefined,
        creation_year: year_creation || undefined,
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
    const years = ['L1', 'L2', 'L3', 'M1', 'M2'];
    const course = req.query.course?.trim();
    const major = req.query.major?.trim();
    const academic_year = req.query.academic_year?.trim().toUpperCase();
    const specialization = req.query.specialization?.trim();

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    if (!course && !major && !academic_year && !specialization) {
      return res.status(200).json({
        data: [],
        meta: {
          current_page: 1,
          last_page: 0,
          per_page: limit,
          total_files: 0,
          from: 0,
          to: 0,
        },
      });
    }
    if (academic_year && !years.includes(academic_year)) {
      return res.status(400).json({ error: 'Invalid academic year' });
    }

    // 🟢 COUNT (نفس filters تاع search)
    const total_subjects = await prisma.subjects.count({
      where: {
        course: course
          ? {
              contains: course,
              mode: 'insensitive',
            }
          : undefined,

        major: major ? { mode: 'insensitive', equals: major } : undefined,

        academic_year: academic_year || undefined,

        specialization: specialization
          ? { mode: 'insensitive', equals: specialization }
          : undefined,
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

        major: major ? { mode: 'insensitive', equals: major } : undefined,

        academic_year: academic_year || undefined,

        specialization: specialization
          ? { mode: 'insensitive', equals: specialization }
          : undefined,
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
