import {
  showMyNotifications,
  markNotificationAsRead,
  deleteAllMyNotifications,
} from '../controllers/notification.controller.js';
import express from 'express';

import '../config/passport.js';
import passport from 'passport';

const router = express.Router();

router.get(
  '/showMyNotifications',
  passport.authenticate('jwt', { session: false }),
  showMyNotifications
);

router.put(
  '/markNotificationAsRead/:id_notification',
  passport.authenticate('jwt', { session: false }),
  markNotificationAsRead
);

router.delete(
  '/deleteAllMyNotifications',
  passport.authenticate('jwt', { session: false }),
  deleteAllMyNotifications
);

export default router;
