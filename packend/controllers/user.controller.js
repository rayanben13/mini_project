import prisma from '../lib/prisma.js';

import { v2 as cloudinary } from 'cloudinary';
import { GetPublicId } from '../config/Cloudinary.js';
import { io } from '../config/socket.js';
import { getUniversities } from '../service/univAPI.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const MyInformation = async (req, res) => {
  try {
    const user = req.user;

    const isProfileDropdown = req.query.ProfileDropdown === 'true';

    if (isProfileDropdown || user.role === 'admin') {
      const profileData = await prisma.users.findUnique({
        where: {
          id_user: user.id_user,
        },
        select: {
          id_user: true,
          username: true,
          fullname: true,
          img_user: true,
          email: true,
          role: true,
        },
      });

      if (!profileData) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ profileData });
    }

    const [information, following, followers, upload] = await Promise.all([
      prisma.users.findUnique({
        where: { id_user: user.id_user },
        select: {
          id_user: true,
          username: true,
          fullname: true,
          img_user: true,
          email: true,
          role: true,
          user_information: true,
        },
      }),

      prisma.follows.count({
        where: {
          follower_id: user.id_user,
        },
      }),

      prisma.follows.count({
        where: {
          following_id: user.id_user,
        },
      }),

      prisma.files.count({
        where: {
          id_user: user.id_user,
        },
      }),
    ]);

    if (!information) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = {
      information,
      stats: {
        following,
        followers,
        upload,
      },
    };

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const ShowUserByid = async (req, res) => {
  try {
    const { id_user } = req.params;
    const Me = req.user;

    const userId = Number(id_user);

    // Get user basic info
    const user = await prisma.users.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        username: true,
        fullname: true,
        img_user: true,
        email: true,
        role: true,
        user_information: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res
        .status(403)
        .json({ message: 'You are not authorized to view this profile' });
    }

    // Stats
    const following = await prisma.follows.count({
      where: { follower_id: userId },
    });

    const followers = await prisma.follows.count({
      where: { following_id: userId },
    });

    const upload = await prisma.files.count({
      where: { id_user: userId },
    });

    // Follow relations (Me ↔ User)
    let status = 'NONE';

    if (Me.id_user === userId) {
      status = 'ME';
    } else {
      const IFollowHim = await prisma.follows.findFirst({
        where: {
          follower_id: Me.id_user,
          following_id: userId,
        },
      });

      const HeFollowsMe = await prisma.follows.findFirst({
        where: {
          follower_id: userId,
          following_id: Me.id_user,
        },
      });

      if (IFollowHim && HeFollowsMe) {
        status = 'MUTUAL';
      } else if (IFollowHim) {
        status = 'FOLLOWING';
      } else if (HeFollowsMe) {
        status = 'FOLLOWED_BY';
      }
    }

    // Final response
    const result = {
      user,
      stats: {
        following,
        followers,
        upload,
      },
      status,
    };

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// export const addFollow = async (req, res) => {
//   try {
//     const { id_user } = req.params;
//     const Me = req.user;

//     const userId = Number(id_user);

//     const user = await prisma.users.findUnique({
//       where: { id_user: userId },
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (Me.id_user === userId) {
//       return res.status(400).json({ message: 'You cannot follow yourself' });
//     }

//     const isFollowing = await prisma.follows.findFirst({
//       where: {
//         follower_id: Me.id_user,
//         following_id: userId,
//       },
//     });

//     if (isFollowing) {
//       return res
//         .status(400)
//         .json({ message: 'You are already following this user' });
//     }

//     const following = await prisma.follows.create({
//       data: { follower_id: Me.id_user, following_id: userId },
//     });

//     return res.status(200).json({ message: 'Followed successfully' });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };

export const addFollow = async (req, res) => {
  try {
    const Me = req.user;
    const userId = Number(req.params.id_user);

    if (Me.id_user === userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const user = await prisma.users.findUnique({
      where: { id_user: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'user') {
      return res
        .status(403)
        .json({ message: 'You are not authorized to follow this user' });
    }

    const existing = await prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: Me.id_user,
          following_id: userId,
        },
      },
    });

    if (existing) {
      return res.status(200).json({ message: 'Already following' });
    }

    await prisma.follows.upsert({
      where: {
        follower_id_following_id: {
          follower_id: Me.id_user,
          following_id: userId,
        },
      },
      update: {},
      create: {
        follower_id: Me.id_user,
        following_id: userId,
      },
    });

    await prisma.notifications.create({
      data: {
        id_user: userId,
        message: `${Me.username} followed you`,
        related_id: Me.id_user,
        related_type: 'user',
      },
    });

    io.to(String(userId)).emit('notification', {
      message: `${Me.username} followed you`,
      type: 'user',
      related_id: Me.id_user,
    });

    console.log('SOCKET DATA:', {
      message: `${Me.username} followed you`,
      type: 'user',
      related_id: Me.id_user,
    });
    return res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const removeFollow = async (req, res) => {
  try {
    const Me = req.user;
    const userId = Number(req.params.id_user);

    if (Me.id_user === userId) {
      return res.status(400).json({ message: 'You can not unfollow yourself' });
    }
    const user = await prisma.users.findUnique({
      where: { id_user: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'user') {
      return res
        .status(403)
        .json({ message: 'You are not authorized to unfollow this user' });
    }

    const existing = await prisma.follows.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: Me.id_user,
          following_id: userId,
        },
      },
    });

    if (!existing) {
      return res
        .status(401)
        .json({ message: 'You are not following this user' });
    }

    await prisma.follows.delete({
      where: {
        follower_id_following_id: {
          follower_id: Me.id_user,
          following_id: userId,
        },
      },
    });

    return res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const img_user = req.file?.path || null;
    const { univ, major, specialty, academic_year, fullname } = req.body;
    const userID = req.user.id_user;

    const universities = await getUniversities(univ);
    if (!universities.length) {
      return res.status(401).json({ message: 'university is not exist' });
    }

    const infoExist = await prisma.university_majors.findFirst({
      where: {
        major: { equals: major, mode: 'insensitive' },
        specialization: { equals: specialty, mode: 'insensitive' },
        academic_year,
      },
    });

    if (!infoExist) {
      return res.status(402).json({ message: 'information is not exist' });
    }

    const olduser = await prisma.users.findUnique({
      where: { id_user: userID },
      select: {
        img_user: true,
      },
    });

    if (!olduser) {
      return res.status(403).json({ error: 'user is not exist' });
    }

    const user = await prisma.users.update({
      where: { id_user: userID },
      data: {
        img_user: img_user ?? olduser.img_user,
        fullname: fullname,
        user_information: {
          update: {
            university: universities[0],
            major: infoExist.major,
            specialization: infoExist.specialization || null,
            academic_year: infoExist.academic_year,
          },
        },
      },
      select: {
        id_user: true,
        username: true,
        fullname: true,
        img_user: true,
        email: true,
        role: true,
        user_information: true,
      },
    });

    if (img_user && olduser.img_user) {
      const publicId = GetPublicId(olduser.img_user);
      await cloudinary.uploader.destroy(publicId);
    }

    res.status(200).json(user);
  } catch (error) {
    console.log('❌ Error in UpdateProfile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
