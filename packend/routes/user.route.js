import express from 'express';

import { MyInformation } from '../controllers/user.controller.js';

import '../config/passport.js';
import passport from 'passport';

const router = express.Router();

router.get(
  '/MyInformation',
  passport.authenticate('jwt', { session: false }),
  MyInformation
);

export default router;
