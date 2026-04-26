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
import { requireUser } from '../middleware/checkUserInformation.js';

const router = express.Router();

router.get(
  '/showRecommendedStudyList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showRecommendedStudyList
);

router.get(
  '/showMyStudyList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showMyStudyList
);

router.get(
  '/showAddedStudyList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showAddedStudyList
);

router.get(
  '/showDetailStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showDetailStudyList
);

router.post(
  '/createStudyList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  createStudyList
);

router.patch(
  '/editStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  editStudyList
);

router.delete(
  '/deleteStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  deleteStudyList
);

router.post(
  '/addStudylistToAddedSection/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  addStudylistToAddedSection
);

router.post(
  '/loveStudyList/:id_stuList',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  loveStudyList
);

router.post(
  '/addSetReminder/:id_stuList',
  validate(schemaReminder),
  passport.authenticate('jwt', { session: false }),
  requireUser,
  addSetReminder
);

router.delete(
  '/deleteFileFromStudyList/:id_stuList/:id_file',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  deleteFileFromStudyList
);

export default router;
