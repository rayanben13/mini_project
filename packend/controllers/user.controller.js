import prisma from '../lib/prisma.ts';

let isDevelopment = process.env.NODE_ENV?.trim() === 'development';

export const MyInformation = async (req, res) => {
  try {
    const user = req.user;

    const result = await prisma.users.findFirst({
      where: {
        id_user: user.id_user,
      },
      select: {
        username: true,
        fullname: true,
        img_user: true,
        email: true,
        role: true,
        user_information: true,
      },
    });
    if (!result) {
      return res.status(404).json({ message: 'information is not exist' });
    }
    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
