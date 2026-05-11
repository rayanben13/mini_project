import prisma from '../lib/prisma.js';
import dayjs from '../config/dayjsTime.js';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const showMyNotifications = async (req, res) => {
  try {
    const Me = req.user;

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // 📌 جلب notifications مع count (بدون N+1 problem)
    let notifications = await prisma.notifications.findMany({
      where: {
        id_user: Me.id_user,
      },
      select: {
        id_notification: true,
        message: true,
        related_id: true,
        related_type: true,
        is_read: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    });

    notifications = notifications.map((notification) => ({
      ...notification,
      created_at: dayjs(notification.created_at).fromNow(),
    }));

    // 📌 total count
    const total_my_notifications = await prisma.notifications.count({
      where: {
        id_user: Me.id_user,
      },
    });

    // 📌 response
    return res.status(200).json({
      meta: {
        current_page: page,
        last_page: Math.ceil(total_my_notifications / limit),
        per_page: limit,
        total_my_notifications,
        from: total_my_notifications === 0 ? 0 : (page - 1) * limit + 1,
        to: (page - 1) * limit + notifications.length,
      },
      data: notifications,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const Me = req.user;
    const id_notification = Number(req.params.id_notification);

    if (isNaN(id_notification)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notificationExist = await prisma.notifications.findUnique({
      where: {
        id_notification,
        id_user: Me.id_user,
      },
    });

    if (!notificationExist) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notificationExist.is_read) {
      return res.status(400).json({ error: 'Notification already read' });
    }

    const notification = await prisma.notifications.update({
      where: {
        id_notification,
        id_user: Me.id_user,
      },
      data: {
        is_read: true,
      },
    });

    return res
      .status(200)
      .json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteAllMyNotifications = async (req, res) => {
  try {
    const Me = req.user;

    const notifications = await prisma.notifications.findMany({
      where: {
        id_user: Me.id_user,
      },
    });

    if (!notifications) {
      return res.status(404).json({ error: 'Notifications not found' });
    }

    await prisma.notifications.deleteMany({
      where: {
        id_user: Me.id_user,
      },
    });

    return res.status(200).json({ message: 'All notifications deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
