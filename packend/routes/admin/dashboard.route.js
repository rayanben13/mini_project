import express from 'express';

import {
  dashboardStatis,
  uplodesOfFilesGraphe,
  top10Contributors,
} from '../../controllers/admin/dashboard.controller.js';
import passport from 'passport';
import { checkAdmin } from '../../middleware/checkAdmin.js';

const router = express.Router();

router.get(
  '/dashboardStatis',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  dashboardStatis
);

router.get(
  '/uplodesOfFilesGraphe',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  uplodesOfFilesGraphe
);

router.get(
  '/top10Contributors',
  passport.authenticate('jwt', { session: false }),
  checkAdmin,
  top10Contributors
);

export default router;
