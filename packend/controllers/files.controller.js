import { count } from 'node:console';
import prisma from '../lib/prisma.ts';

// import { GetPublicId } from '../config/Cloudinary.js';
// import { v2 as cloudinary } from 'cloudinary';
// import { getUniversities } from '../service/univAPI.js';
// import { io } from '../config/socket.js';
// import { type } from 'os';

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

    const files = await prisma.$queryRaw`
      SELECT 
        f.id_file,
        f.title,
        f.type,
        s.major,
        s.specialization,
        s.academic_year,
        s.university,
        CAST(COUNT(i.id) AS INTEGER) AS likes_count
      FROM files f
      LEFT JOIN subjects s 
        ON s.id_subject = f.id_subject
      LEFT JOIN files_likes i 
        ON i.id_file = f.id_file 
        AND i.type = 'LIKE'
      WHERE 
        f.status = 'accepted'
        AND s.university = ${userInformation.university}
        AND s.academic_year = ${userInformation.academic_year}
        AND s.major = ${userInformation.major}
        AND s.specialization = ${userInformation.specialization || null}
      GROUP BY 
        f.id_file,
        f.title,
        f.type,
        s.major,
        s.specialization,
        s.academic_year,
        s.university
      ORDER BY likes_count DESC
      LIMIT ${limit}
      OFFSET ${skip};
    `;

    return res.status(200).json({
      files,
      page,
      limit,
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

    const filesLiked = await prisma.files.findMany({
      where: {
        files_likes: {
          some: {
            id_user: Me.id_user,
            type: 'LIKE',
          },
        },
      },
      orderBy: {
        files_likes: {
          _count: 'desc',
        },
      },
      skip,
      take: limit,
    });

    return res.status(200).json({
      files,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
