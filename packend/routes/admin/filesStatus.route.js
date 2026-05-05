import express from 'express';

import {
  filesStatus,
  showFilesPanding,
  AproveRejectFiles,
} from '../../controllers/admin/filesStatus.controller.js';
import passport from 'passport';
import { checkAdmin } from '../../middleware/checkAdmin.js';

const router = express.Router();

router.get(
  '/filesStatus',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  filesStatus
);

router.get(
  '/pendingFiles',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  showFilesPanding
);

router.put(
  '/aproveRejectFiles/:id_file',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  AproveRejectFiles
);

export default router;
