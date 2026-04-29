import prisma from '../../lib/prisma.js';
import dayjs from '../../config/dayjsTime.js';
import { algeriaTime } from '../../config/dayjsTime.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const reportedFilesStatus = async (req, res) => {
  try {
    const now = dayjs().utc();
    const startOfDay = now.startOf('day');
    const endOfDay = now.endOf('day');
    const ReportRisk = 2;

    const [
      totalPendingReportedFiles,
      totalResolvedReportedFilesToday,
      higheRisqueReportedFiles,
    ] = await Promise.all([
      // 🔵 عدد الملفات اللي عندها reports pending (بدون تكرار)
      prisma.file_reports.groupBy({
        by: ['id_file'],
        where: {
          status: 'pending',
        },
      }),

      // 🟢 عدد الملفات اللي تم مراجعتها اليوم (بدون تكرار)
      prisma.file_reports.groupBy({
        by: ['id_file'],
        where: {
          status: 'reviewed',
          created_at: {
            gte: startOfDay.toDate(),
            lte: endOfDay.toDate(),
          },
        },
      }),

      // 🔴 الملفات الخطيرة (7 بلاغات أو أكثر)
      prisma.file_reports.groupBy({
        by: ['id_file'],
        where: {
          status: 'pending',
        },
        having: {
          id_file: {
            _count: {
              gte: ReportRisk,
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      totalPendingReportedFiles: totalPendingReportedFiles.length,
      totalResolvedReportedFilesToday: totalResolvedReportedFilesToday.length,
      higheRisqueReportedFilesCount: higheRisqueReportedFiles.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// export const showFilesReported = async (req, res) => {
//   try {
//     const limit = Math.min(Number(req.query.limit) || 10, 50);
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const skip = (page - 1) * limit;

//     const section = req.query.section;
//     const allowedSections = ['all', 'highRisk_Reports'];
//     if (!allowedSections.includes(section)) {
//       return res.status(400).json({ error: 'Invalid section' });
//     }

//     const counts = await prisma.file_reports.count({
//       distinct: ['id_file'],
//       where: {
//         status: 'pending',
//       },
//     });

//     const pendingFiles = await prisma.file_reports.groupBy({
//       by: ['id_file'],
//       where: {
//         status: 'pending',
//       },
//       select: {
//         id_report: true,
//         files: {
//           select: {
//             id_file: true,
//             title: true,
//             users: {
//               select: {
//                 id_user: true,
//                 username: true,
//                 fullname: true,
//               },
//             },
//           },
//         },
//       },

//       _count: {
//         _all: true,
//       },

//       ...(section === 'highRisk_Reports' && {
//         having: {
//           id_file: {
//             _count: {
//               gte: ReportRisk,
//               orderBy: {
//                 _all: 'desc',
//               },
//             },
//           },
//         },
//       }),
//       skip,
//       take: limit,
//     });

//     return res.status(200).json({
//       meta: {
//         current_page: page,
//         last_page: Math.ceil(counts / limit),
//         per_page: limit,
//         total_files: counts,
//         from: counts === 0 ? 0 : (page - 1) * limit + 1,
//         to: (page - 1) * limit + mappedFiles.length,
//       },
//       mappedFiles,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

export const showFilesReported = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const section = req.query.section;
    const allowedSections = ['all', 'highRisk_Reports'];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({ error: 'Invalid section' });
    }

    // 1️⃣ Group reports by file (stats only)
    const groupedReports = await prisma.file_reports.groupBy({
      by: ['id_file'],
      where: {
        status: 'pending',
      },
      _count: {
        _all: true,
      },
    });

    // 2️⃣ Extract file IDs
    const fileIds = groupedReports.map((g) => g.id_file);

    // 3️⃣ Get files + owner
    const files = await prisma.files.findMany({
      where: {
        id_file: {
          in: fileIds,
        },
      },
      include: {
        users: {
          select: {
            id_user: true,
            username: true,
            fullname: true,
          },
        },
      },
    });

    // 4️⃣ Merge data
    let result = groupedReports.map((report) => {
      const file = files.find((f) => f.id_file === report.id_file);

      return {
        id_file: report.id_file,
        reports_count: report._count._all,
        file: file || null,
      };
    });

    // 5️⃣ High risk filter
    if (section === 'highRisk_Reports') {
      const riskLevel = 2;

      result = result.filter((r) => r.reports_count >= riskLevel);
    }

    // 6️⃣ Pagination
    const paginated = result.slice(skip, skip + limit);

    // 7️⃣ Response
    return res.status(200).json({
      meta: {
        current_page: page,
        per_page: limit,
        total_files: result.length,
        last_page: Math.ceil(result.length / limit),
        from: result.length === 0 ? 0 : skip + 1,
        to: skip + paginated.length,
      },
      data: paginated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

export const showReportedDetails = async (req, res) => {
  try {
    const id_file = Number(req.params.id_file);
    if (!id_file) {
      return res.status(400).json({
        error: 'File not found',
      });
    }

    const fileExists = await prisma.files.findUnique({
      where: {
        id_file: id_file,
      },
    });

    if (!fileExists) {
      return res.status(404).json({
        error: 'File not found',
      });
    }

    const file = await prisma.file_reports.findMany({
      where: {
        id_file: id_file,
        status: 'pending',
      },
      select: {
        id_file: true,
        users: {
          select: {
            id_user: true,
            username: true,
            fullname: true,
          },
        },
        reason: true,
        details: true,
        created_at: true,
      },
    });

    const mappedFiles = file.map((file) => ({
      ...file,
      created_at: algeriaTime(file.created_at).format('MMM DD, YYYY'),
    }));

    return res.status(200).json({
      data: mappedFiles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};
