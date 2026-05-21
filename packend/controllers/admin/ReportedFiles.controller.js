import { cloudinary, GetPublicId } from "../../config/Cloudinary.js";
import dayjs, { algeriaTime } from "../../config/dayjsTime.js";
import prisma from "../../lib/prisma.js";

import { io } from "../../config/socket.js";

let isDevelopment = process.env.NODE_ENV?.trim() === "development";

export const reportedFilesStatus = async (req, res) => {
  try {
    const now = dayjs().utc();
    const startOfDay = now.startOf("day");
    const endOfDay = now.endOf("day");
    const ReportRisk = 2;

    const [
      totalPendingReportedFiles,
      totalResolvedReportedFilesToday,
      higheRisqueReportedFiles,
    ] = await Promise.all([
      // 🔵 عدد الملفات اللي عندها reports pending (بدون تكرار)
      prisma.file_reports.groupBy({
        by: ["id_file"],
        where: {
          status: "pending",
        },
      }),

      // 🟢 عدد الملفات اللي تم مراجعتها اليوم (بدون تكرار)
      prisma.file_reports.groupBy({
        by: ["id_file"],
        where: {
          status: { in: ["reviewed", "ignored"] },
          handled_at: {
            gte: startOfDay.toDate(),
            lte: endOfDay.toDate(),
          },
        },
      }),

      // 🔴 الملفات الخطيرة (7 بلاغات أو أكثر)
      prisma.file_reports.groupBy({
        by: ["id_file"],
        where: {
          status: "pending",
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
      error: "Internal server error",
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
    const allowedSections = ["all", "highRisk_Reports"];
    const riskLevel = 2;

    if (!allowedSections.includes(section)) {
      return res.status(400).json({ error: "Invalid section" });
    }

    // 1️⃣ Group reports by file (stats only)
    const groupedReports = await prisma.file_reports.groupBy({
      by: ["id_file"],
      where: {
        status: "pending",
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
        status: "accepted",
      },
      select: {
        id_file: true,
        id_user: true,
        id_subject: true,
        title: true,
        file_path: true,
        status: true,
        created_at: true,
        users: {
          select: {
            id_user: true,
            username: true,
            fullname: true,
          },
        },
      },
    });

    console.log(files);

    // 4️⃣ Merge data
    let result = groupedReports.map((report) => {
      const file = files.find((f) => f.id_file === report.id_file);

      if (file) {
        return {
          id_file: report.id_file,
          reports_count: report._count._all,
          file: file,
        };
      } else {
        return null;
      }
    });

    // Filter out null values (files that don't exist)
    result = result.filter((r) => r !== null);

    if (section === "all") {
      result = result.sort((a, b) => {
        return new Date(b.file.created_at) - new Date(a.file.created_at);
      });
    }

    // 5️⃣ High risk filter
    if (section === "highRisk_Reports" && result !== null) {
      result = result
        .filter((r) => r.reports_count >= riskLevel)
        .sort((a, b) => b.reports_count - a.reports_count);
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
      error: "Internal server error",
    });
  }
};

export const showReportedDetails = async (req, res) => {
  try {
    const id_file = Number(req.params.id_file);

    if (!id_file) {
      return res.status(400).json({
        error: "enter the file id",
      });
    }

    const fileExists = await prisma.files.findUnique({
      where: {
        id_file: id_file,
        status: "accepted",
      },
    });

    if (!fileExists) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const file = await prisma.file_reports.findMany({
      where: {
        id_file: id_file,
        status: "pending",
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
    if (file.length === 0) {
      return res.status(404).json({
        error: "This file has no reports or already reviewed",
      });
    }

    const mappedFiles = file.map((file) => ({
      ...file,
      created_at: algeriaTime(file.created_at).format("MMM DD, YYYY"),
    }));

    return res.status(200).json({
      data: mappedFiles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const DeleteOrIgnoreReportedFile = async (req, res) => {
  try {
    const id_file = Number(req.params.id_file);
    const action = req.query.action;
    const allowedActions = ["delete", "ignore"];
    const reason = req.body?.reason || null;

    //validate reason only when delete action
    if (action === "delete") {
      if (!reason) {
        return res.status(400).json({
          error: "Reason is required",
        });
      }
      if (reason.length < 3 || reason.length > 500) {
        return res.status(400).json({
          error: "Reason must be between 3 and 500 characters",
        });
      }
    }
    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        error: "Invalid action",
      });
    }
    if (!id_file) {
      return res.status(400).json({
        error: "File not found",
      });
    }

    const fileExists = await prisma.files.findFirst({
      where: {
        id_file: id_file,
        status: "accepted",
      },
      select: {
        file_path: true,
        title: true,
        users: {
          select: {
            id_user: true,
            username: true,
          },
        },
        file_reports: {
          select: {
            status: true,
          },
        },
      },
    });

    const hasPendingReport = fileExists.file_reports?.some(
      (r) => r.status === "pending",
    );

    if (!fileExists) {
      return res.status(404).json({ error: "File not found" });
    }

    if (fileExists.file_path === "/deleted") {
      return res.status(400).json({ error: "File already deleted" });
    }

    if (!hasPendingReport) {
      return res
        .status(400)
        .json({ error: "No pending reports for this file" });
    }

    if (action === "ignore") {
      const file = await prisma.file_reports.updateMany({
        where: {
          id_file: id_file,
          status: "pending",
        },
        data: {
          status: "ignored",
          handled_at: new Date(),
        },
      });
      return res.status(200).json({
        message: "file ignored successfully",
      });
    }

    if (action === "delete") {
      // 1️⃣ حذف من Cloud
      if (!isDevelopment) {
        const publicId = GetPublicId(fileExists.file_path);
        console.log(publicId);

        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });

        console.log(result);

        if (result.result !== "ok" && result.result !== "not found") {
          throw new Error("Cloudinary delete failed");
        }
      } else {
        console.log("delete file in cloduinary");
      }
      // 2️⃣ تحديث DB
      await prisma.$transaction([
        prisma.file_reports.updateMany({
          where: {
            id_file,
            status: "pending",
          },
          data: {
            status: "reviewed",
            action: "removed",
            handled_at: new Date(),
          },
        }),

        prisma.files.update({
          where: { id_file },
          data: {
            file_path: "/deleted",
          },
        }),
      ]);
      let message = `Your file "${fileExists.title}" has been removed by the admin. Reason: ${reason}`;

      const newNotification = await prisma.notifications.create({
        data: {
          id_user: fileExists.users.id_user,
          message,
          related_id: id_file,
          related_type: "file",
        },
      });

      io.to(String(fileExists.users.id_user)).emit("notification", {
        ...newNotification,
        message: `Your file "${fileExists.title}" has been removed by the admin. Reason: ${reason}`,
        related_id: id_file,
        related_type: "file",
      });

      console.log({
        "send notification to user": fileExists.users.id_user,
        message,
        related_id: id_file,
        related_type: "file",
      });

      return res.status(200).json({
        message: "file deleted successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
