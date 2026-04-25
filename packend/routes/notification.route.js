import {
  showMyNotifications,
  markNotificationAsRead,
  deleteAllMyNotifications,
} from '../controllers/notification.controller.js';
import express from 'express';

import '../config/passport.js';
import passport from 'passport';
import { requireUser } from '../middleware/checkUserInformation.js';

const router = express.Router();

router.get(
  '/showMyNotifications',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  showMyNotifications
);

router.put(
  '/markNotificationAsRead/:id_notification',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  markNotificationAsRead
);

router.delete(
  '/deleteAllMyNotifications',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  deleteAllMyNotifications
);

export default router;
