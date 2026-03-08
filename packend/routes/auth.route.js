import express from 'express';
import validate from '../middleware/validate.js';
import {
  authSchema,
  shemaPassword,
  schemaEmail,
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
} from '../controllers/auth.controller.js';
import authLimiter from '../config/rateLimit.js';

import passport from 'passport';
import '../config/passport.js';

const router = express.Router();

router.post('/register', authLimiter, validate(authSchema), register);
router.post('/resendVerificationCode', authLimiter, resendVerificationCode);
router.post('/verify', authLimiter, verify);

router.post('/login', authLimiter, validate(shemaPassword), login);
router.post('/forgotPassword', validate(schemaEmail), forgotPassword);

router.patch(
  '/resetPassword/:resetTokenURL',
  validate(shemaPassword),
  resetPassword
);

router.post('/logout', logout);
router.post('/token', token);

export default router;
