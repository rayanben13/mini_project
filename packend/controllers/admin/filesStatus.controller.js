import prisma from '../../lib/prisma.js';
import dayjs from '../../config/dayjsTime.js';
import { algeriaTime } from '../../config/dayjsTime.js';
import { io } from '../../config/socket.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const filesStatus = async (req, res) => {
  try {
    const now = dayjs().utc();
    const startOFDay = now.startOf('day');
    const endOFDay = now.endOf('day');

    const [pendingFiles, acceptedFilesToday, rejectedFilesToday] =
      await Promise.all([
        prisma.files.count({
          where: {
            status: 'pending',
            file_reports: {
              none: {
                status: 'reviewed',
              },
            },
          },
        }),
        prisma.files.count({
          where: {
            status: 'accepted',
            file_reports: {
              none: {
                status: 'reviewed',
              },
            },
            created_at: {
              gte: startOFDay.toDate(),
              lte: endOFDay.toDate(),
            },
          },
        }),
        prisma.files.count({
          where: {
            status: 'rejected',
            file_reports: {
              none: {
                status: 'reviewed',
              },
            },
            created_at: {
              gte: startOFDay.toDate(),
              lte: endOFDay.toDate(),
            },
          },
        }),
      ]);

    return res.status(200).json({
      pendingFiles,
      acceptedFilesToday,
      rejectedFilesToday,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const showFilesPanding = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const search = req.query.search || '';

    const whereCondition = {
      status: 'pending',
      file_reports: {
        none: {
          status: 'reviewed',
        },
      },
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { users: { username: { contains: search, mode: 'insensitive' } } },
          { users: { fullname: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const counts = await prisma.files.count({
      where: whereCondition,
    });

    const pendingFiles = await prisma.files.findMany({
      where: whereCondition,
      skip,
      take: limit,
      select: {
        id_file: true,
        title: true,
        type: true,
        status: true,
        users: {
          select: {
            id_user: true,
            fullname: true,
            username: true,
          },
        },
        subjects: {
          select: {
            id_subject: true,
            course: true,
          },
        },

        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const mappedFiles = pendingFiles.map((file) => ({
      ...file,
      created_at: algeriaTime(file.created_at).format('MMM DD, YYYY'),
    }));

    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(counts / limit),
        per_page: limit,
        total_files: counts,
        from: counts === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + mappedFiles.length,
      },
      mappedFiles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const AproveRejectFiles = async (req, res) => {
  try {
    const status = req.query.status;
    const id_file = Number(req.params.id_file);
    const reason = req.body.reason;

    const allowedStatus = ['approve', 'reject', 'approveAll'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // =========================
    // approve / reject ONE
    // =========================
    if (status === 'approve' || status === 'reject') {
      if (isNaN(id_file)) {
        return res.status(400).json({ error: 'Invalid file id' });
      }

      if (status === 'reject' && !reason) {
        return res.status(400).json({ error: 'Reason is required' });
      }

      const file = await prisma.files.findFirst({
        where: {
          id_file,
          status: 'pending',
          file_reports: {
            none: { status: 'reviewed' },
          },
        },
        select: {
          id_file: true,
          title: true,
          users: {
            select: {
              id_user: true,
              username: true,
            },
          },
        },
      });

      if (!file) {
        return res.status(404).json({
          error: 'File not found or already processed',
        });
      }

      const newStatus = status === 'approve' ? 'accepted' : 'rejected';

      await prisma.$transaction(async (tx) => {
        await tx.files.update({
          where: { id_file },
          data: {
            status: newStatus,
            reason_rejected: status === 'reject' ? reason : null,
            approved_at: new Date(),
          },
        });

        const ownerMessage = `Admin ${status}ed your file: ${file.title}${
          status === 'reject' && reason ? ` (reason: ${reason})` : ''
        }`;

        await tx.notifications.create({
          data: {
            id_user: file.users.id_user,
            message: ownerMessage,
            related_id: file.id_file,
            related_type: 'file',
          },
        });

        io.to(String(file.users.id_user)).emit('notification', {
          message: ownerMessage,
          related_id: file.id_file,
          related_type: 'file',
        });

        // =========================
        // 🔥 If approved → notify followers
        // =========================
        if (status === 'approve') {
          const followers = await tx.follows.findMany({
            where: {
              following_id: file.users.id_user,
            },
            select: {
              follower_id: true,
            },
          });

          if (followers.length > 0) {
            const notifData = followers.map((f) => ({
              id_user: f.follower_id,
              message: `${file.users.username} uploaded a new file: ${file.title}`,
              related_id: file.id_file,
              related_type: 'file',
            }));

            await tx.notifications.createMany({
              data: notifData,
            });

            followers.forEach((f) => {
              io.to(String(f.follower_id)).emit('notification', {
                message: `${file.users.username} uploaded a new file: ${file.title}`,
                related_id: file.id_file,
                related_type: 'file',
              });
            });
          }
        }
      });

      return res.status(200).json({
        message: `File ${status}d successfully`,
      });
    }

    // =========================
    // approve ALL
    // =========================
    if (status === 'approveAll') {
      const pendingFiles = await prisma.files.findMany({
        where: { status: 'pending' },
        select: {
          id_file: true,
          title: true,
          users: {
            select: {
              id_user: true,
              username: true,
            },
          },
        },
      });

      if (!pendingFiles.length) {
        return res.status(404).json({
          error: 'No pending files found',
        });
      }

      await prisma.$transaction(async (tx) => {
        // 1. Update all
        await tx.files.updateMany({
          where: { status: 'pending' },
          data: {
            status: 'accepted',
            approved_at: new Date(),
          },
        });

        // 2. Prepare notifications
        const notifications = pendingFiles.map((file) => ({
          id_user: file.users.id_user,
          message: `Admin approved your file: ${file.title}`,
          related_id: file.id_file,
          related_type: 'file',
        }));

        // 🔥 BULK INSERT
        await tx.notifications.createMany({
          data: notifications,
        });

        // 🔥 SOCKET
        pendingFiles.forEach((file) => {
          io.to(String(file.users.id_user)).emit('notification', {
            message: `Admin approved your file: ${file.title}`,
            related_id: file.id_file,
            related_type: 'file',
          });
        });
      });

      return res.status(200).json({
        message: 'All pending files approved successfully',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};
