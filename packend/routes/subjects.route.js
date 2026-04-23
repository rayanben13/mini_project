import express from 'express';

import '../config/passport.js';
import passport from 'passport';

import {
  yourSubjects,
  showDetailSubject,
} from '../controllers/subjects.controller.js';
import { requireUser } from '../middleware/checkUserInformation.js';
const router = express.Router();

router.get(
  '/your-subjects',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  yourSubjects
);

router.get(
  '/subject/:id_subject',

  showDetailSubject
);

export default router;
