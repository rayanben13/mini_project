import { count } from 'node:console';
import prisma from '../lib/prisma.ts';
import { getUniversities } from '../service/univAPI.js';
import { io } from '../config/socket.js';
import {
  reminder_time_input,
  reminder_time_output,
} from '../config/dayjsTime.js';

import { cloudinary, uploadBufferToCloudinary } from '../config/Cloudinary.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const showRecommendedStudyList = async (req, res) => {
  try {
    const Me = req.user;

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 📌 جلب معلومات المستخدم
    const userInformation = await prisma.user_information.findUnique({
      where: { id_user: Me.id_user },
    });

    // 📌 جلب study lists مع count (بدون N+1 problem)
    const studyLists = await prisma.study_lists.findMany({
      where: {
        subjects: {
          academic_year: userInformation?.academic_year,
          major: userInformation?.major,
          specialization: userInformation?.specialization,
        },
        privacy: 'public',
      },
      select: {
        id_stuList: true,
        name: true,
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
      skip,
      take: limit,
    });

    // 📌 تحويل count
    const formattedStudyLists = studyLists.map((item) => ({
      id_stuList: item.id_stuList,
      name: item.name,
      users: item.users,
      count_files: item._count.study_list_files,
    }));

    // 📌 total count
    const total_recommended_study_list = await prisma.study_lists.count({
      where: {
        subjects: {
          academic_year: userInformation.academic_year,
          major: userInformation.major,
          specialization: userInformation.specialization,
        },
        privacy: 'public',
      },
    });

    // 📌 response
    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_recommended_study_list / limit),
        per_page: limit,
        total_recommended_study_list,
        from: total_recommended_study_list === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + formattedStudyLists.length,
      },
      data: formattedStudyLists,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const showMyStudyList = async (req, res) => {
  try {
    const Me = req.user;

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 📌 جلب study lists مع count (بدون N+1 problem)
    const studyLists = await prisma.study_lists.findMany({
      where: {
        id_user: Me.id_user,
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
      skip,
      take: limit,
    });

    // 📌 تحويل count
    const formattedStudyLists = studyLists.map((item) => ({
      id_stuList: item.id_stuList,
      name: item.name,
      users: item.users,
      count_files: item._count.study_list_files,
      privacy: item.privacy,
    }));

    // 📌 total count
    const total_my_study_list = await prisma.study_lists.count({
      where: {
        id_user: Me.id_user,
      },
    });

    // 📌 response
    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_my_study_list / limit),
        per_page: limit,
        total_my_study_list,
        from: total_my_study_list === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + formattedStudyLists.length,
      },
      data: formattedStudyLists,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const showStudyListUserById = async (req, res) => {
  try {
    const id_user = Number(req.params.id_user);

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    if (!id_user) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userExists = await prisma.users.findUnique({
      where: {
        id_user,
      },
    });

    if (!userExists || userExists.role == 'admin') {
      return res.status(404).json({ error: 'user not found' });
    }

    const studyLists = await prisma.study_lists.findMany({
      where: {
        id_user,
        privacy: 'public',
      },
      select: {
        id_stuList: true,
        name: true,
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
      skip,
      take: limit,
    });
    const formattedStudyLists = studyLists.map((item) => ({
      id_stuList: item.id_stuList,
      name: item.name,
      users: item.users,
      count_files: item._count.study_list_files,
    }));
    const total_study_list = await prisma.study_lists.count({
      where: {
        id_user,
        privacy: 'public',
      },
    });
    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_study_list / limit),
        per_page: limit,
        total_study_list,
        from: total_study_list === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + formattedStudyLists.length,
      },
      data: formattedStudyLists,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const showAddedStudyList = async (req, res) => {
  try {
    const Me = req.user;

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 📌 جلب study lists مع count (بدون N+1 problem)
    const studyLists = await prisma.saved_study_lists.findMany({
      where: {
        id_user: Me.id_user,
      },
      select: {
        id_user: true,
        study_lists: {
          select: {
            id_stuList: true,
            name: true,
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
        },
      },
      skip,
      take: limit,
    });

    // 📌 تحويل count
    const formattedStudyLists = studyLists.map((item) => ({
      id_user: item.id_user,
      id_stuList: item.study_lists.id_stuList,
      name: item.study_lists.name,
      users: item.study_lists.users,
      count_files: item.study_lists._count.study_list_files,
    }));

    // 📌 total count
    const total_added_study_list = await prisma.saved_study_lists.count({
      where: {
        id_user: Me.id_user,
      },
    });

    // 📌 response
    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_added_study_list / limit),
        per_page: limit,
        total_added_study_list,
        from: total_added_study_list === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + formattedStudyLists.length,
      },
      data: formattedStudyLists,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const showDetailStudyList = async (req, res) => {
  try {
    const Me = req.user;
    const id_stuList = Number(req.params.id_stuList);

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const isMyStudyList = await prisma.study_lists.findUnique({
      where: {
        id_stuList,
      },
      select: {
        id_user: true,
        privacy: true,
      },
    });

    if (
      isMyStudyList.privacy === 'private' &&
      isMyStudyList.id_user !== Me.id_user
    ) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to access this study list' });
    }

    // 🔍 جلب الدراسة مرة واحدة مع العلاقات
    const studyList = await prisma.study_lists.findUnique({
      where: { id_stuList },
      select: {
        id_stuList: true,
        name: true,
        description: true,
        privacy: true,
        created_at: true,

        users: {
          select: {
            id_user: true,
            fullname: true,
          },
        },

        _count: {
          select: {
            study_list_files: {
              where: {
                files: {
                  status: 'accepted',
                },
              },
            },
            studyList_likes: true,
          },
        },
      },
    });

    if (!studyList) {
      return res.status(404).json({ error: 'Study list not found' });
    }

    // 🔥 flags (تحسين باستخدام boolean مباشر)
    const isLoved =
      (await prisma.studyList_likes.findFirst({
        where: {
          id_user: Me.id_user,
          id_stuList,
        },
      })) !== null;

    const isOwner =
      (await prisma.study_lists.findFirst({
        where: {
          id_user: Me.id_user,
          id_stuList,
        },
      })) !== null;

    let isSaved = false;
    if (!isOwner) {
      isSaved =
        (await prisma.saved_study_lists.findFirst({
          where: {
            id_user: Me.id_user,
            id_stuList,
          },
        })) !== null;
    }

    const reminder = await prisma.daily_reminders.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
      select: {
        id: true,
        reminder_time: true,
      },
    });

    const isAddReminder = reminder !== null;
    const timeReminder = reminder ? reminder.reminder_time : null;

    // 📂 files (تصحيح include بدل خطأ files:)
    const showFilesStudylist = await prisma.study_list_files.findMany({
      where: {
        id_stuList,
        files: {
          status: 'accepted',
        },
      },
      include: {
        files: {
          select: {
            id_file: true,
            file_path: true,
            title: true,
            status: true,
            subjects: {
              select: {
                id_subject: true,
                major: true,
                specialization: true,
                course: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
    });

    const totalFilesStudyList = await prisma.study_list_files.count({
      where: {
        id_stuList,
        files: {
          status: 'accepted',
        },
      },
    });

    // 🧾 card
    const studyListCard = {
      id_stuList: studyList.id_stuList,
      name: studyList.name,
      description: studyList.description,
      privacy: studyList.privacy,
      created_at: studyList.created_at,
      users: studyList.users,
      count_files: studyList._count.study_list_files,
      count_loved: studyList._count.studyList_likes,
      isLoved,
      isOwner,
      isSaved,
      isAddReminder,
      reminder_time: reminder_time_output(timeReminder),
    };

    // 📦 files format
    const FilesStudylist = showFilesStudylist.map((item) => ({
      id_file: item.files.id_file,
      file_path: item.files.file_path,
      title: item.files.title,
      status: item.files.status,
      subjects: item.files.subjects,
    }));

    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(totalFilesStudyList / limit),
        per_page: limit,
        totalFilesStudyList,
        from: totalFilesStudyList === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + showFilesStudylist.length,
      },
      studyListCard,
      FilesStudylist,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const createStudyList = async (req, res) => {
  try {
    const Me = req.user;
    const { name, subject, description, privacy } = req.body;

    const subjectExist = await prisma.subjects.findFirst({
      where: {
        course: {
          equals: subject,
          mode: 'insensitive',
        },
      },
    });
    if (!subjectExist) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    const studyList = await prisma.study_lists.create({
      data: {
        name,
        description,
        privacy,
        subjects: {
          connect: {
            id_subject: subjectExist.id_subject,
          },
        },
        users: {
          connect: {
            id_user: Me.id_user,
          },
        },
      },
      select: {
        id_stuList: true,
        name: true,
        description: true,
        privacy: true,
        id_user: true,
        subjects: {
          select: {
            id_subject: true,
            course: true,
          },
        },
        created_at: true,
      },
    });

    return res
      .status(200)
      .json({ message: 'Study list created successfully', studyList });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const editStudyList = async (req, res) => {
  try {
    const Me = req.user;
    const id_stuList = Number(req.params.id_stuList);

    const { name, description, privacy } = req.body;

    const isOwner = await prisma.study_lists.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    if (!isOwner) {
      return res.status(403).json({
        error: 'You are not the owner of this study list',
      });
    }

    const data = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (privacy !== undefined) data.privacy = privacy;

    const studyList = await prisma.study_lists.update({
      where: {
        id_stuList,
      },
      data,
      select: {
        id_stuList: true,
        name: true,
        description: true,
        privacy: true,
        id_user: true,
        subjects: {
          select: {
            id_subject: true,
            course: true,
          },
        },
        created_at: true,
      },
    });

    return res
      .status(200)
      .json({ message: 'Study list updated successfully', studyList });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteStudyList = async (req, res) => {
  try {
    const Me = req.user;
    const id_stuList = Number(req.params.id_stuList);

    const isOwner = await prisma.study_lists.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    if (!isOwner) {
      return res.status(403).json({
        error: 'You are not the owner of this study list',
      });
    }

    const studyList = await prisma.study_lists.delete({
      where: {
        id_stuList,
      },
    });

    return res.status(200).json({ message: 'Study list deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const addStudylistToAddedSection = async (req, res) => {
  try {
    const Me = req.user;
    const id_stuList = Number(req.params.id_stuList);

    const isOwner = await prisma.study_lists.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    if (!isOwner) {
      return res.status(403).json({
        error:
          "You are not the owner of this study list you can't add it to added section",
      });
    }

    const isAdded = await prisma.saved_study_lists.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    if (isAdded) {
      return res.status(400).json({
        error: 'This study list is already added to added section',
      });
    }

    const studyList = await prisma.saved_study_lists.create({
      data: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    return res.status(200).json({
      message: 'Study list added to added section',
      studyList,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const loveStudyList = async (req, res) => {
  try {
    const Me = req.user;
    const id_stuList = Number(req.params.id_stuList);

    const ownerFile = await prisma.study_lists.findUnique({
      where: {
        id_stuList,
      },
    });

    if (!ownerFile) {
      return res.status(404).json({ error: 'Study list not found' });
    }

    const isLoved = await prisma.studyList_likes.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    if (isLoved) {
      await prisma.studyList_likes.deleteMany({
        where: {
          id_user: Me.id_user,
          id_stuList,
        },
      });

      return res.status(200).json({
        message: 'Study list unloved',
      });
    }

    const addLoveToStudyList = await prisma.studyList_likes.create({
      data: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    const message = `${Me.username} loved your study list ${ownerFile.name}`;

    await prisma.notifications.create({
      data: {
        id_user: ownerFile.id_user,
        message,
        related_id: Me.id_user,
        related_type: 'user',
      },
    });

    io.to(String(ownerFile.id_user)).emit('notification', {
      message,
      related_id: Me.id_user,
      related_type: 'user',
    });

    console.log('SOCKET DATA:', {
      message,
      related_id: Me.id_user,
      related_type: 'user',
    });

    return res.status(200).json({
      message: 'Study list loved',
      addLoveToStudyList,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const addSetReminder = async (req, res) => {
  try {
    const Me = req.user;
    const id_stuList = Number(req.params.id_stuList);
    const { date, time } = req.body;

    // Create a UTC date from the input
    // User requested "Global Time", so we append Z to ensure it's treated as UTC
    const reminder_time = reminder_time_input(date, time);

    if (isNaN(reminder_time.getTime())) {
      return res.status(400).json({
        error:
          'Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time.',
      });
    }

    // Check if the reminder is in the past
    if (reminder_time < new Date()) {
      return res
        .status(400)
        .json({ error: 'Reminder time must be in the future ' });
    }

    const studylistExist = await prisma.study_lists.findFirst({
      where: {
        id_stuList,
      },
    });

    if (
      !studylistExist ||
      (studylistExist.id_user !== Me.id_user &&
        studylistExist.privacy === 'private')
    ) {
      return res.status(404).json({
        error: 'Study list not found or you do not have permission.',
      });
    }

    const isAdded = await prisma.daily_reminders.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    if (isAdded) {
      // Update existing reminder instead of erroring, or keep it as is
      await prisma.daily_reminders.update({
        where: { id: isAdded.id },
        data: { reminder_time },
      });
      return res.status(200).json({
        message: 'Reminder updated successfully',
        reminder_time,
      });
    }

    const studyList = await prisma.daily_reminders.create({
      data: {
        id_user: Me.id_user,
        id_stuList,
        reminder_time,
      },
    });

    return res.status(200).json({
      message: 'Study list added to reminder',
      studyList,
    });
  } catch (err) {
    console.error('Error in addSetReminder:', err);
    return res
      .status(500)
      .json({ error: 'Server error while setting reminder' });
  }
};

export const deleteFileFromStudyList = async (req, res) => {
  try {
    const Me = req.user;
    const id_stuList = Number(req.params.id_stuList);
    const id_file = Number(req.params.id_file);

    if (!id_file || !id_stuList) {
      return res.status(400).json({
        error: 'Missing file or study list ID',
      });
    }

    const studyListExist = await prisma.study_lists.findFirst({
      where: {
        id_stuList,
      },
    });

    if (!studyListExist) {
      return res.status(404).json({
        error: 'Study list not found',
      });
    }

    const isOwner = await prisma.study_lists.findFirst({
      where: {
        id_user: Me.id_user,
        id_stuList,
      },
    });

    if (!isOwner) {
      return res.status(403).json({
        error: 'You are not the owner of this study list',
      });
    }

    const file = await prisma.study_list_files.findFirst({
      where: {
        id_file,
        id_stuList,
      },
    });

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
      });
    }

    await prisma.study_list_files.delete({
      where: {
        id_stuList_id_file: {
          id_stuList,
          id_file,
        },
      },
    });

    return res.status(200).json({
      message: 'File deleted successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
