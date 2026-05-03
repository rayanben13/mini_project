import express from 'express';

import {
  reportedFilesStatus,
  showFilesReported,
  showReportedDetails,
  DeleteOrIgnoreReportedFile,
} from '../../controllers/admin/ReportedFiles.controller.js';
import passport from 'passport';
import { checkAdmin } from '../../middleware/checkAdmin.js';

const router = express.Router();

router.get(
  '/ReportedFilesStatus',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  reportedFilesStatus
);

router.get(
  '/showFilesReported',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  showFilesReported
);

router.get(
  '/showReportedDetails/:id_file',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  showReportedDetails
);

router.patch(
  '/DeleteOrIgnoreReportedFile/:id_file',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  DeleteOrIgnoreReportedFile
);
export default router;
