import express from 'express';
import authLimiter from '../config/rateLimit.js';
import validate from '../middleware/validate.js';
import {
  authSchema,
  shemaPassword,
  schemaEmail,
  schemaUserInformation,
} from '../schemas/auth.schema.js';
import {
  register,
  login,
  logout,
  token,
  verify,
  forgotPassword,
  resetPassword,
  resendVerificationCode,
  SharchMoreInformation,
  addedUserInformation,
} from '../controllers/auth.controller.js';

import '../config/passport.js';
import passport from 'passport';

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validate(authSchema),
  register
);
router.post(
  '/resendVerificationCode',
  authLimiter,
  resendVerificationCode
);
router.post('/verify', authLimiter, verify);

router.post('/login', authLimiter, validate(shemaPassword), login);
router.post(
  '/forgotPassword',
  validate(schemaEmail),
  forgotPassword
);

router.patch(
  '/resetPassword/:resetTokenURL',
  validate(shemaPassword),
  resetPassword
);

router.post('/logout', logout);
router.post('/token', token);
router.get('/SharchMoreInformation', SharchMoreInformation);
router.post(
  '/addedUserInformation',
  validate(schemaUserInformation),
  passport.authenticate('jwt', { session: false }),
  addedUserInformation
);
export default router;
