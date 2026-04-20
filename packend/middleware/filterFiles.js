const fileFilter = (req, file, cb) => {
  try {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  } catch (err) {
    cb(err, false);
  }
};

export default fileFilter;
