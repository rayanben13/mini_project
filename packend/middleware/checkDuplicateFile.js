import { generateFileHash } from '../service/hash.js';
import prisma from '../lib/prisma.js';

export const checkDuplicateFile = async (req, res, next) => {
  try {
    const file = req.file;
    const { title } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const titleExist = await prisma.files.findFirst({
      where: {
        title: { equals: title, mode: 'insensitive' },
        status: 'accepted',
      },
    });
    if (titleExist) {
      return res.status(404).json({ message: 'title is exist' });
    }

    // 🔐 حساب hash من الـ Buffer الموجود في الذاكرة
    const fileHash = await generateFileHash(file.buffer);

    // 🔍 البحث في DB باستخدام findFirst لأن file_hash ليس @unique
    const exist = await prisma.files.findFirst({
      where: { file_hash: fileHash },
    });

    if (exist) {
      return res.status(400).json({
        message: 'File already exists (duplicate)',
      });
    }

    // نخزن hash لاستخدامه لاحقًا
    req.fileHash = fileHash;

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Error checking file',
    });
  }
};
