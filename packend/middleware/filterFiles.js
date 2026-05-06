const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  try {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Only PDF, images, and Word documents are accepted.'), false);
    }
  } catch (err) {
    cb(err, false);
  }
};

export default fileFilter;
