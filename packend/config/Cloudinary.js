import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import filterFiles from '../middleware/filterFiles.js';
import filterImg from '../middleware/filterImg.js';

export { cloudinary };

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// إعداد multer + CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profileImg',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const storageFiles = multer.memoryStorage();

export const Upload = multer({ storage, fileFilter: filterImg });
export const UploadFiles = multer({
  storage: storageFiles,
  fileFilter: filterFiles,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (اختياري هنا)
  },
});

export function GetPublicId(url) {
  // الرابط: https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/prodactADD/filename.jpg
  // public_id = "prodactADD/filename"
  const parts = url.split('/');
  const filenameWithExt = parts[parts.length - 1]; // filename.jpg
  const filename = filenameWithExt.split('.')[0]; // filename
  const folder = parts[parts.length - 2]; // prodactADD
  return `${folder}/${filename}`;
}

// How to delete img in cloudinary

// cloudinary.uploader.destroy(publicId);

// ☁️ رفع ملف إلى Cloudinary بشكل يدوي (مفيد في حالة الـ Buffer)
export const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'files',
        resource_type: 'auto',
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};
