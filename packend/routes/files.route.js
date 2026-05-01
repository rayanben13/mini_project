import express from 'express';

import {
  showTopFilesForUser,
  showfilesLikes,
  showMyFiles,
  showDetailFile,
  UplodeNewFile,
  downloadFile,
  reportFile,
  addLikeOrDislike,
  saveFileToMyStudyList,
  deleteMeOwnfile,
  getShareLink,
  showFilesUserById,
} from '../controllers/files.controller.js';
import validate from '../middleware/validate.js';
import {
  shemaUploadFile,
  schemaReportFile,
  schemaLikeFile,
} from '../schemas/auth.schema.js';
// import { checkDuplicateFile } from '../middleware/checkDuplicateFile.js';
import '../config/passport.js';
import passport from 'passport';
import { UploadFiles } from '../config/Cloudinary.js';
import { requireUser } from '../middleware/checkUserInformation.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

router.get(
  '/showTopFilesForUser',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showTopFilesForUser
);

router.get(
  '/showfilesLikes',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showfilesLikes
);

router.get(
  '/showMyFiles',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showMyFiles
);

router.get('/showDetailFile/:id_file', optionalAuth, showDetailFile);

router.post(
  '/UplodeNewFile',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  UploadFiles.single('file'),
  validate(shemaUploadFile),

  // checkDuplicateFile,
  UplodeNewFile
);

router.get('/download/:id_file', downloadFile);

router.delete(
  '/deleteMeOwnfile/:id_file',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  deleteMeOwnfile
);

router.post(
  '/reportFile/:id_file',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  validate(schemaReportFile),
  reportFile
);

router.post(
  '/likeOrDislikeFile/:id_file',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  validate(schemaLikeFile),
  addLikeOrDislike
);

router.post(
  '/saveFileToStudyList/:id_file/:id_study_list',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  saveFileToMyStudyList
);

router.get('/getShareLink/:id_file', getShareLink);

router.get('/showFilesUserById/:id_user', showFilesUserById);

export default router;
