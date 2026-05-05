import prisma from '../../lib/prisma.js';
import dayjs from '../../config/dayjsTime.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const dashboardStatis = async (req, res) => {
  try {
    const totalUsers = await prisma.users.count({
      where: {
        is_active: true,
        role: 'user',
        user_information: {
          isNot: null,
        },
      },
    });
    const totalFiles = await prisma.files.count({
      where: {
        file_reports: {
          none: {
            status: 'reviewed',
          },
        },
      },
    });
    const totalStudyLists = await prisma.study_lists.count();

    return res.status(200).json({ totalUsers, totalFiles, totalStudyLists });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uplodesOfFilesGraphe = async (req, res) => {
  try {
    const stats = [];
    const now = dayjs().utc();
    for (let i = 6; i >= 0; i--) {
      const startOFDay = now.startOf('day').subtract(i, 'day');
      const endOFDay = now.endOf('day').subtract(i, 'day');
      const totalUplodesOfDate = await prisma.files.count({
        where: {
          created_at: {
            gte: startOFDay.toDate(),
            lte: endOFDay.toDate(),
          },
        },
      });
      stats.push({
        day: startOFDay.format('dddd'),
        date: startOFDay.format('YYYY-MM-DD'),
        totalUplodesOfDate,
      });
    }

    return res.status(200).json({ stats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const top10Contributors = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      where: {
        role: 'user',
        is_active: true,
        user_information: {
          isNot: null,
        },
      },
      select: {
        id_user: true,
        username: true,
        fullname: true,
      },
    });

    const result = await Promise.all(
      users.map(async (user) => {
        const [files, followers, studyLists, likes] = await Promise.all([
          prisma.files.count({
            where: {
              id_user: user.id_user,
              status: 'accepted',
              file_reports: {
                none: {
                  status: 'reviewed',
                },
              },
            },
          }),

          prisma.follows.count({
            where: {
              following_id: user.id_user,
            },
          }),

          prisma.study_lists.count({
            where: {
              id_user: user.id_user,
            },
          }),

          prisma.files_likes.count({
            where: {
              type: 'LIKE',
              files: {
                id_user: user.id_user,
                status: 'accepted',
                file_reports: {
                  none: {
                    status: 'reviewed',
                  },
                },
              },
            },
          }),
        ]);
        console.log(user.id_user, files, followers, studyLists, likes);

        const score = files + studyLists + followers + likes * 2;

        return {
          id: user.id_user,
          username: user.username,
          fullname: user.fullname,
          files,
          followers,
          studyLists,
          likes,
          score,
        };
      })
    );

    const top10 = result.sort((a, b) => b.score - a.score).slice(0, 10);

    return res.status(200).json({ top10 });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
