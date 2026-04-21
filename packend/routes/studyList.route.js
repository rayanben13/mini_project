import express from 'express';

import '../config/passport.js';
import passport from 'passport';

import {
  showRecommendedStudyList,
  showMyStudyList,
  showAddedStudyList,
  showDetailStudyList,
  createStudyList,
  editStudyList,
  deleteStudyList,
  addStudylistToAddedSection,
  loveStudyList,
  addSetReminder,
  deleteFileFromStudyList,
} from '../controllers/studyList.controller.js';
import validate from '../middleware/validate.js';
import { schemaReminder } from '../schemas/auth.schema.js';

const router = express.Router();

router.get(
  '/showRecommendedStudyList',
  passport.authenticate('jwt', { session: false }),
  showRecommendedStudyList
);

router.get(
  '/showMyStudyList',
  passport.authenticate('jwt', { session: false }),
  showMyStudyList
);

router.get(
  '/showAddedStudyList',
  passport.authenticate('jwt', { session: false }),
  showAddedStudyList
);

router.get(
  '/showDetailStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  showDetailStudyList
);

router.post(
  '/createStudyList',
  passport.authenticate('jwt', { session: false }),
  createStudyList
);

router.patch(
  '/editStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  editStudyList
);

router.delete(
  '/deleteStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  deleteStudyList
);

router.post(
  '/addStudylistToAddedSection/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  addStudylistToAddedSection
);

router.post(
  '/loveStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  loveStudyList
);

router.post(
  '/addSetReminder/:id_stuList',
  validate(schemaReminder),
  passport.authenticate('jwt', { session: false }),
  addSetReminder
);

router.delete(
  '/deleteFileFromStudyList/:id_stuList/:id_file',
  passport.authenticate('jwt', { session: false }),
  deleteFileFromStudyList
);

export default router;
