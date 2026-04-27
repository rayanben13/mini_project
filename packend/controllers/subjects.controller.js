import prisma from '../lib/prisma.ts';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const yourSubjects = async (req, res) => {
  try {
    const Me = req.user;

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 📌 جلب معلومات المستخدم
    const userInformation = await prisma.user_information.findUnique({
      where: { id_user: Me.id_user },
    });

    // 📌 جلب subjects مع count (بدون N+1 problem)
    const subjects = await prisma.subjects.findMany({
      where: {
        academic_year: userInformation.academic_year,
        major: userInformation.major,
        specialization: userInformation.specialization,
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
        last_page: Math.ceil(subjects.length / limit),
        per_page: limit,
        total_subjects: subjects.length,
        from: subjects.length === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + subjects.length,
      },
      data: subjects,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const showDetailSubject = async (req, res) => {
  try {
    const Me = req.user;
    const id_subject = Number(req.params.id_subject);
    console.log(Me);
    if (isNaN(id_subject)) {
      return res.status(400).json({ error: 'Invalid subject ID' });
    }

    // 🟢 pagination files
    const pageFiles = Math.max(Number(req.query.page_files) || 1, 1);
    const limitFiles = Math.min(Number(req.query.limit_files) || 10, 50);
    const skipFiles = (pageFiles - 1) * limitFiles;

    // 🟢 subject
    const subject = await prisma.subjects.findUnique({
      where: { id_subject },
      select: {
        id_subject: true,
        course: true,
        major: true,
        specialization: true,
        academic_year: true,
        course_description: true,
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // 🟢 files
    const totalFiles = await prisma.files.count({
      where: { id_subject, status: 'accepted' },
    });

    const files = await prisma.files.findMany({
      where: { id_subject, status: 'accepted' },
      select: {
        id_file: true,
        file_path: true,
        title: true,
        type: true,
        status: true,
      },
      skip: skipFiles,
      take: limitFiles,
    });

    // 🟢 grouping
    const types = ['TD', 'TP', 'COURS', 'EF', 'CC', 'RESUME', 'OTHER'];
    const groupedFiles = {};
    types.forEach((t) => (groupedFiles[t] = []));

    files.forEach((file) => {
      const type = file.type?.toUpperCase();
      if (types.includes(type)) {
        groupedFiles[type].push(file);
      } else {
        groupedFiles['OTHER'].push(file);
      }
    });

    // 🟢 study lists ONLY for user
    let studyLists = [];
    let listsMeta = null;

    if (Me.role === 'user') {
      const pageLists = Math.max(Number(req.query.page_lists) || 1, 1);
      const limitLists = Math.min(Number(req.query.limit_lists) || 5, 50);
      const skipLists = (pageLists - 1) * limitLists;

      const totalLists = await prisma.study_lists.count({
        where: {
          id_subject,
          privacy: 'public',
        },
      });

      studyLists = await prisma.study_lists.findMany({
        where: {
          id_subject,
          privacy: 'public',
        },
        select: {
          id_stuList: true,
          name: true,
          privacy: true,
          users: {
            select: {
              id_user: true,
              fullname: true,
            },
          },
          _count: {
            select: {
              study_list_files: true,
            },
          },
        },
        skip: skipLists,
        take: limitLists,
      });

      listsMeta = {
        current_page: pageLists,
        last_page: Math.ceil(totalLists / limitLists),
        per_page: limitLists,
        total: totalLists,
        from: totalLists === 0 ? 0 : (pageLists - 1) * limitLists + 1,
        to: (pageLists - 1) * limitLists + studyLists.length,
      };
    }

    // 🟢 response
    return res.status(200).json({
      subject,

      files: groupedFiles,
      files_meta: {
        current_page: pageFiles,
        last_page: Math.ceil(totalFiles / limitFiles),
        per_page: limitFiles,
        total: totalFiles,
        from: totalFiles === 0 ? 0 : (pageFiles - 1) * limitFiles + 1,
        to: (pageFiles - 1) * limitFiles + files.length,
      },

      ...(Me.role === 'user' && {
        study_lists: studyLists,
        lists_meta: listsMeta,
      }),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
