import { count } from 'node:console';
import prisma from '../lib/prisma.ts';
import { getUniversities } from '../service/univAPI.js';
import { io } from '../config/socket.js';

import { cloudinary, uploadBufferToCloudinary } from '../config/Cloudinary.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const showTopFilesForUser = async (req, res) => {
  try {
    const Me = req.user;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const userInformation = await prisma.user_information.findUnique({
      where: { id_user: Me.id_user },
    });

    if (!userInformation) {
      return res.status(404).json({ error: 'User information not found' });
    }
    console.log(userInformation);
    const total_files = await prisma.files.count({
      where: {
        status: 'accepted',
        subjects: {
          university: userInformation.university,
          academic_year: userInformation.academic_year,
          major: userInformation.major,
          specialization: userInformation.specialization,
        },
      },
    });
    // const files = await prisma.files.findMany({
    //   where: {
    //     status: 'accepted',
    //     subjects: {
    //       university: userInformation.university,
    //       academic_year: userInformation.academic_year,
    //       major: userInformation.major,
    //       specialization: userInformation.specialization ?? null,
    //     },
    //   },

    //   select: {
    //     id_file: true,
    //     file_path: true,
    //     title: true,
    //     type: true,
    //     status: true,

    //     subjects: {
    //       select: {
    //         major: true,
    //         specialization: true,
    //         academic_year: true,
    //         course: true,
    //       },
    //     },

    //     _count: {
    //       select: {
    //         files_likes: {
    //           where: {
    //             type: 'LIKE',
    //           },
    //         },
    //       },
    //     },
    //   },

    //   orderBy: {
    //     files_likes: {
    //       _count: 'desc',
    //     },
    //   },

    //   take: limit,
    //   skip: skip,
    // });
    const files = await prisma.$queryRaw`
     SELECT 
  f.id_file,
  f.file_path,
  f.title,
  f.type,

  s.major,
  s.specialization,
  s.academic_year,
  s.course,
  
  CAST(COUNT(i.id) AS INTEGER) AS likes_count ,
  f.status
FROM files f
INNER JOIN subjects s 
  ON s.id_subject = f.id_subject
LEFT JOIN files_likes i 
  ON i.id_file = f.id_file 
  AND i.type = 'LIKE'
WHERE 
  f.status = 'accepted'
  AND s.university = ${userInformation.university}
  AND s.academic_year = ${userInformation.academic_year}
  AND s.major = ${userInformation.major}
  AND s.specialization IS NOT DISTINCT FROM ${userInformation.specialization}
GROUP BY 
  f.id_file,
  f.title,
  f.type,
  s.major,
  s.specialization,
  s.academic_year,
  s.course,
  f.status
ORDER BY likes_count DESC
LIMIT ${limit}
OFFSET ${skip};
    `;

    res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_files / limit),
        per_page: limit,
        total_files,
        from: total_files === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + files.length,
      },
      data: files,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const showfilesLikes = async (req, res) => {
  try {
    const Me = req.user;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const total_files = await prisma.files_likes.count({
      where: {
        id_user: Me.id_user,
        type: 'LIKE',
        files: {
          status: 'accepted',
        },
      },
    });

    const filesLiked = await prisma.files_likes.findMany({
      where: {
        id_user: Me.id_user,
        type: 'LIKE',
        files: {
          status: 'accepted',
        },
      },
      select: {
        id: true,
        id_user: true,
        id_file: true,
        type: true,
        files: {
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
        },
      },
      skip,
      take: limit,
    });

    const formatted = filesLiked.map((item) => ({
      id: item.id,
      id_user: item.id_user,
      id_file: item.id_file,
      type: item.type,

      id_file: item.files.id_file,
      file_path: item.files.file_path,
      title: item.files.title,
      type_file: item.files.type,

      major: item.files.subjects?.major,
      specialization: item.files.subjects?.specialization,
      academic_year: item.files.subjects?.academic_year,
      course: item.files.subjects?.course,
      status: item.files.status,
    }));
    res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_files / limit),
        per_page: limit,
        total_files,
        from: total_files === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + filesLiked.length,
      },
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const showMyFiles = async (req, res) => {
  try {
    const Me = req.user;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const total_files = await prisma.files.count({
      where: {
        id_user: Me.id_user,
        status: 'accepted',
      },
    });

    const files = await prisma.files.findMany({
      where: {
        id_user: Me.id_user,
        status: 'accepted',
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
    res.status(200).json({
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

export const showDetailFile = async (req, res) => {
  try {
    const Me = req.user;
    const id_file = Number(req.params.id_file);
    console.log(id_file);
    if (!id_file) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    const fileExist = await prisma.files.findUnique({
      where: {
        id_file,
      },
    });

    if (!fileExist) {
      return res.status(404).json({ error: 'File not found' });
    }

    const like = await prisma.files_likes.count({
      where: {
        id_file,
        type: 'LIKE',
        files: {
          status: 'accepted',
        },
      },
    });

    const dislike = await prisma.files_likes.count({
      where: {
        id_file,
        type: 'DISLIKE',
        files: {
          status: 'accepted',
        },
      },
    });
    const file = await prisma.files.findUnique({
      where: {
        id_file,
      },

      select: {
        id_file: true,
        file_path: true,
        title: true,
        creation_year: true,
        type: true,
        status: true,
        approved_at: true,
        subjects: {
          select: {
            major: true,
            specialization: true,
            academic_year: true,
            course: true,
            university: true,
          },
        },
        users: {
          select: {
            id_user: true,
            fullname: true,
            username: true,
            img_user: true,
          },
        },
        files_likes: {
          where: {
            id_user: Me.id_user,
          },
          select: {
            type: true,
          },
        },
      },
    });
    if (!file) {
      return res.status(403).json({ error: 'File not found' });
    }
    const { files_likes, ...rest } = file;
    let statusLike = null;
    if (files_likes.length > 0) {
      statusLike = files_likes[0].type;
    }
    res.status(200).json({
      ...rest,
      like,
      dislike,
      statusLike,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const UplodeNewFile = async (req, res) => {
  try {
    const Me = req.user;

    const {
      title,
      univ,
      major,
      academic_year,
      spercialty,
      subject,
      type,
      creation_year,
    } = req.body;

    let file_hash = null;

    // 1. Check university
    const universities = await getUniversities(univ);

    if (!universities.length) {
      return res.status(404).json({ message: 'university is not exist' });
    }

    // 2. Validate subject info
    const infoExist = await prisma.university_majors.findFirst({
      where: {
        major: { equals: major, mode: 'insensitive' },
        specialization: { equals: spercialty || null, mode: 'insensitive' },
        academic_year,
        course: { equals: subject || null, mode: 'insensitive' },
      },
    });

    if (!infoExist) {
      return res.status(403).json({ message: 'information is not exist' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 3. Find or create subject
    const subjectExist = await prisma.subjects.findFirst({
      where: {
        major: infoExist.major,
        specialization: infoExist.specialization,
        academic_year: infoExist.academic_year,
        course: infoExist.course,
      },
    });

    // 4. Upload file to cloud
    const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer);

    const file_path = cloudinaryResult.secure_url;

    // 5. Create file
    const file = await prisma.files.create({
      data: {
        users: {
          connect: { id_user: Me.id_user },
        },
        title,
        creation_year: String(creation_year),
        type,
        file_hash,
        file_path,

        subjects: subjectExist
          ? {
              connect: { id_subject: subjectExist.id_subject },
            }
          : {
              create: {
                major: infoExist.major,
                specialization: infoExist.specialization,
                academic_year: infoExist.academic_year,
                course: infoExist.course,
                university: univ,
                course_description: infoExist.course_description,
              },
            },
      },
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
      file,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const id_file = Number(req.params.id_file);
    const fileRecord = await prisma.files.findFirst({
      where: { id_file, status: 'accepted' },
    });

    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found or not accepted' });
    }

    const fileUrl = fileRecord.file_path; // Cloudinary URL

    // To trigger an automatic download from Cloudinary, insert 'fl_attachment' into the URL parameters
    let downloadUrl = fileUrl;
    if (fileUrl.includes('/upload/')) {
      downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    // Redirect the user to the direct Cloudinary URL that forces download
    return res.redirect(downloadUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

export const deleteMeOwnfile = async (req, res) => {
  try {
    const Me = req.user;
    const id_file = Number(req.params.id_file);
    const owner = await prisma.files.findFirst({
      where: { id_file, id_user: Me.id_user, status: 'accepted' },
    });
    if (!owner) {
      return res
        .status(404)
        .json({ error: 'File not found or not accepted or not owner' });
    }
    await prisma.files.delete({
      where: { id_file },
    });
    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

export const reportFile = async (req, res) => {
  try {
    const Me = req.user;
    const id_file = Number(req.params.id_file);
    const { reason, details } = req.body;

    const fileExist = await prisma.files.findFirst({
      where: { id_file, status: 'accepted' },
    });

    if (!fileExist) {
      return res.status(404).json({ error: 'File not found or not accepted' });
    }

    if (fileExist.id_user === Me.id_user) {
      return res.status(403).json({ error: 'You cannot report your own file' });
    }

    const reportExist = await prisma.file_reports.findFirst({
      where: {
        id_user: Me.id_user,
        id_file,
      },
    });

    if (reportExist) {
      return res.status(400).json({ error: 'You already reported this file' });
    }

    const report = await prisma.file_reports.create({
      data: {
        users: {
          connect: { id_user: Me.id_user },
        },
        files: {
          connect: { id_file },
        },
        reason,
        details,
      },
    });
    return res.status(200).json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to report file' });
  }
};

// export const likeOrDislikeFile = async (req, res) => {
//   try {
//     const Me = req.user;
//     const id_file = Number(req.params.id_file);
//     const { type } = req.body;

//     const fileExist = await prisma.files.findFirst({
//       where: { id_file, status: 'accepted' },
//     });

//     if (!fileExist) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     const likeExist = await prisma.files_likes.findUnique({
//       where: {
//         id_user_id_file: {
//           id_user: Me.id_user,
//           id_file: id_file,
//         },
//       },
//     });

//     if (likeExist) {
//       return res.status(400).json({ error: 'You already liked this file' });
//     }

//     const like = await prisma.files_likes.create({
//       data: {
//         users: {
//           connect: { id_user: Me.id_user },
//         },
//         files: {
//           connect: { id_file },
//         },
//         type,
//       },
//     });

//     const ownerFile = await prisma.files.findUnique({
//       where: { id_file },
//     });

//     if (type === 'LIKE') {
//       await prisma.notifications.create({
//         data: {
//           id_user: ownerFile.id_user,
//           message: `${Me.username} liked your file: ${fileExist.title}`,
//           related_id: Me.id_user,
//           related_type: 'user',
//         },
//       });

//       io.to(ownerFile.id_user).emit('notification', {
//         message: `${Me.username} liked your file: ${fileExist.title}`,
//         related_id: Me.id_user,
//         related_type: 'user',
//       });

//       console.log('SOCKET DATA:', {
//         message: `${Me.username} liked your file: ${fileExist.title}`,
//         related_id: Me.id_user,
//         related_type: 'user',
//       });
//     }

//     return res.status(200).json(like);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to like file' });
//   }
// };

export const addLikeOrDislike = async (req, res) => {
  try {
    const Me = req.user;
    const id_file = Number(req.params.id_file);
    const { type } = req.body; // LIKE / DISLIKE

    const fileExist = await prisma.files.findFirst({
      where: { id_file, status: 'accepted' },
    });

    if (!fileExist) {
      return res.status(404).json({ error: 'File not found or not accepted' });
    }

    const existing = await prisma.files_likes.findUnique({
      where: {
        id_user_id_file: {
          id_user: Me.id_user,
          id_file,
        },
      },
    });

    // 🟡 نفس النوع → حذف (toggle)
    if (existing && existing.type === type) {
      await prisma.files_likes.delete({
        where: {
          id_user_id_file: {
            id_user: Me.id_user,
            id_file,
          },
        },
      });

      return res.status(201).json({ message: 'Reaction removed' });
    }

    // 🟢 إنشاء أو تحديث
    const like = await prisma.files_likes.upsert({
      where: {
        id_user_id_file: {
          id_user: Me.id_user,
          id_file,
        },
      },
      update: {
        type,
      },
      create: {
        id_user: Me.id_user,
        id_file,
        type,
      },
    });

    const ownerFile = await prisma.files.findUnique({
      where: { id_file },
      select: {
        id_user: true,
        title: true,
      },
    });

    // 🔥 notification فقط لل LIKE
    if (type === 'LIKE') {
      await prisma.notifications.create({
        data: {
          id_user: ownerFile.id_user,
          message: `${Me.username} liked your file: ${ownerFile.title}`,
          related_id: Me.id_user,
          related_type: 'user',
        },
      });

      io.to(String(ownerFile.id_user)).emit('notification', {
        message: `${Me.username} liked your file: ${ownerFile.title}`,
        related_id: Me.id_user,
        related_type: 'user',
      });

      console.log({
        'send notification to user': ownerFile.id_user,
        message: `${Me.username} liked your file: ${ownerFile.title}`,
        related_id: Me.id_user,
        related_type: 'user',
      });
    }

    return res.status(200).json({ message: 'processed successfully', like });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to process like' });
  }
};

export const saveFileToMyStudyList = async (req, res) => {
  try {
    const Me = req.user;
    const id_file = Number(req.params.id_file);
    const id_study_list = Number(req.params.id_study_list);

    const fileExist = await prisma.files.findFirst({
      where: { id_file, status: 'accepted' },
    });

    if (!fileExist) {
      return res.status(404).json({ error: 'File not found or not accepted' });
    }

    const MyStudyListExist = await prisma.study_lists.findFirst({
      where: { id_stuList: id_study_list, id_user: Me.id_user },
    });

    if (!MyStudyListExist) {
      return res.status(403).json({ error: 'this is not your study list' });
    }

    const fileAlreadySaved = await prisma.study_list_files.findUnique({
      where: {
        id_stuList_id_file: {
          id_stuList: id_study_list,
          id_file: id_file,
        },
      },
    });

    if (fileAlreadySaved) {
      return res
        .status(400)
        .json({ error: 'File already saved to study list' });
    }

    const savedFile = await prisma.study_list_files.create({
      data: {
        study_lists: {
          connect: { id_stuList: id_study_list },
        },
        files: {
          connect: { id_file },
        },
      },
    });

    return res
      .status(200)
      .json({ message: 'File saved to study list successfully', savedFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save file to study list' });
  }
};

export const getShareLink = async (req, res) => {
  try {
    const id_file = Number(req.params.id_file);

    const file = await prisma.files.findUnique({
      where: { id_file, status: 'accepted' },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found or not accepted' });
    }

    const link = `${process.env.FRONTEND_URL}/files/${id_file}`;

    return res.status(200).json({
      link,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
