import cron from 'node-cron';
import prisma from '../lib/prisma.ts';
import { io } from '../config/socket.js';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  console.log(`[Cron] Checking reminders at ${now.toISOString()}`);

  try {
    const reminders = await prisma.daily_reminders.findMany({
      where: {
        reminder_time: { lte: now },
      },
      include: {
        study_lists: {
          select: {
            id_stuList: true,
            name: true,
          },
        },
        users: {
          select: {
            id_user: true,
            username: true,
          },
        },
      },
    });

    if (reminders.length > 0) {
      console.log(`⏰ Found ${reminders.length} reminder(s) to process`);
    }

    for (const reminder of reminders) {
      try {
        const message = `Reminder to study ${reminder.study_lists.name}`;

        // Create notification
        await prisma.notifications.create({
          data: {
            id_user: reminder.users.id_user,
            message,
            related_id: reminder.study_lists.id_stuList,
            related_type: 'study_list',
          },
        });

        // Emit via Socket
        const roomName = String(reminder.users.id_user);
        io.to(roomName).emit('notification', {
          message,
          related_id: reminder.study_lists.id_stuList,
          related_type: 'study_list',
        });

        console.log(`✅ Sent reminder to user ${reminder.users.username} (ID: ${reminder.users.id_user})`);

        // Delete processed reminder
        await prisma.daily_reminders.delete({
          where: { id: reminder.id },
        });

      } catch (itemErr) {
        console.error(`❌ Error processing reminder ${reminder.id}:`, itemErr);
      }
    }
  } catch (err) {
    console.error('❌ Error in reminder cron job:', err);
  }
});
