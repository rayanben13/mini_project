import prisma from '../lib/prisma.ts';

export const checkAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not admin' });
    }

    req.admin = req.user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
