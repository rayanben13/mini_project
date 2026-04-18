import express from 'express';

import { showTopFilesForUser } from '../controllers/files.controller.js';
import validate from '../middleware/validate.js';
import { schemaUpdateProfile } from '../schemas/auth.schema.js';

import '../config/passport.js';
import passport from 'passport';
import { Upload } from '../config/Cloudinary.js';

const router = express.Router();

router.get(
  '/showTopFilesForUser',
  passport.authenticate('jwt', { session: false }),
  showTopFilesForUser
);

export default router;
