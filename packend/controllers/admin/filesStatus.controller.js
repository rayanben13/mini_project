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

    const counts = await prisma.files.count({
      where: {
        status: 'pending',
        file_reports: {
          none: {
            status: 'reviewed',
          },
        },
      },
    });

    const pendingFiles = await prisma.files.findMany({
      where: {
        status: 'pending',
        file_reports: {
          none: {
            status: 'reviewed',
          },
        },
      },
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
    // approve one / reject one
    // =========================
    if (status === 'approve' || status === 'reject') {
      if (isNaN(id_file)) {
        return res.status(400).json({ error: 'invalid file id' });
      }

      if (status === 'reject' && !reason) {
        return res.status(400).json({ error: 'reason is required' });
      }

      const fileExist = await prisma.files.findFirst({
        where: {
          id_file,
          status: 'pending',
          file_reports: {
            none: {
              status: 'reviewed',
            },
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

      if (!fileExist) {
        return res
          .status(404)
          .json({ error: 'File not found or already updated' });
      }

      const newStatus = status === 'approve' ? 'accepted' : 'rejected';

      await prisma.files.update({
        where: {
          id_file,
        },
        data: {
          status: newStatus,
          approved_at: new Date(),
        },
      });

      const message = `The admin ${status}ed your file: ${fileExist.title}${
        status === 'reject' && reason ? ` with reason: ${reason}` : ''
      }`;

      await prisma.notifications.create({
        data: {
          id_user: fileExist.users.id_user,
          message,
          related_id: fileExist.id_file,
          related_type: 'file',
        },
      });

      io.to(String(fileExist.users.id_user)).emit('notification', {
        message,
        related_id: fileExist.id_file,
        related_type: 'file',
      });

      console.log({
        'send notification to user': fileExist.users.id_user,
        message,
        related_id: fileExist.id_file,
        related_type: 'file',
      });

      return res.status(200).json({
        message: `File ${status}d successfully`,
      });
    }

    // =========================
    // approve all pending files
    // =========================
    if (status === 'approveAll') {
      const pendingFiles = await prisma.files.findMany({
        where: {
          status: 'pending',
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

      if (pendingFiles.length === 0) {
        return res.status(404).json({
          error: 'No pending files found',
        });
      }

      await prisma.files.updateMany({
        where: {
          status: 'pending',
        },
        data: {
          status: 'accepted',
          approved_at: new Date(),
        },
      });

      for (const file of pendingFiles) {
        const message = `The admin approved your file: ${file.title}`;

        await prisma.notifications.create({
          data: {
            id_user: file.users.id_user,
            message,
            related_id: file.id_file,
            related_type: 'file',
          },
        });

        io.to(String(file.users.id_user)).emit('notification', {
          message,
          related_id: file.id_file,
          related_type: 'file',
        });
      }

      return res.status(200).json({
        message: 'All pending files approved successfully',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};
