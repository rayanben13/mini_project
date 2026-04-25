import prisma from '../lib/prisma.ts';

async function main() {
  try {
    const user = await prisma.users.findFirst({ select: { id_user: true } });
    if (!user) {
      console.log('⚠️ No users found in database. Skipping notification creation.');
      return;
    }
    const id_user = user.id_user;

    const notification = await prisma.notifications.create({
      data: {
        message: 'This is a test to verify the enum fix.',
        id_user: id_user,
        related_id: 1,
        related_type: 'study_list',
        is_read: false
      }
    });
    console.log('✅ Success! Notification created:', notification);
    
    // Clean up
    await prisma.notifications.delete({
      where: { id: notification.id }
    });
    console.log('🗑️ Test notification deleted.');
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
