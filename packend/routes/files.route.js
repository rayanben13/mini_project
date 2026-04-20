import express from 'express';

import {
  showTopFilesForUser,
  showfilesLikes,
  showMyFiles,
  showDetailFile,
  UplodeNewFile,
  downloadFile
} from '../controllers/files.controller.js';
import validate from '../middleware/validate.js';
import { shemaUploadFile } from '../schemas/auth.schema.js';
// import { checkDuplicateFile } from '../middleware/checkDuplicateFile.js';
import '../config/passport.js';
import passport from 'passport';
import { UploadFiles } from '../config/Cloudinary.js';

const router = express.Router();

router.get(
  '/showTopFilesForUser',
  passport.authenticate('jwt', { session: false }),
  showTopFilesForUser
);

router.get(
  '/showfilesLikes',
  passport.authenticate('jwt', { session: false }),
  showfilesLikes
);

router.get(
  '/showMyFiles',
  passport.authenticate('jwt', { session: false }),
  showMyFiles
);

router.get('/showDetailFile/:id_file', showDetailFile);

router.post(
  '/UplodeNewFile',
  passport.authenticate('jwt', { session: false }),
  UploadFiles.single('file'),
  validate(shemaUploadFile),

  // checkDuplicateFile,
  UplodeNewFile
);

router.get('/download/:id_file', downloadFile);

export default router;
