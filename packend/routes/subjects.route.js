import express from 'express';

import '../config/passport.js';
import passport from 'passport';

import {
  yourSubjects,
  showDetailSubject,
} from '../controllers/subjects.controller.js';
const router = express.Router();

router.get(
  '/your-subjects',
  passport.authenticate('jwt', { session: false }),
  yourSubjects
);

router.get(
  '/subject/:id_subject',
  passport.authenticate('jwt', { session: false }),
  showDetailSubject
);

export default router;
