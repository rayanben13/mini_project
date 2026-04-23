import prisma from '../lib/prisma.ts';

export const requireUser = async (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({
      message: 'You are not user',
    });
  }
  const info = await prisma.user_information.findUnique({
    where: { id_user: req.user.id_user },
  });

  if (!info) {
    return res.status(403).json({
      message: 'Complete your profile first',
    });
  }

  next();
};
