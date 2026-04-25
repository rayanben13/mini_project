import express from 'express';

import {
  MyInformation,
  ShowUserByid,
  addFollow,
  removeFollow,
  UpdateProfile,
} from '../controllers/user.controller.js';
import validate from '../middleware/validate.js';
import { schemaUpdateProfile } from '../schemas/auth.schema.js';
import { requireUser } from '../middleware/checkUserInformation.js';

import '../config/passport.js';
import passport from 'passport';
import { Upload } from '../config/Cloudinary.js';

const router = express.Router();

router.get(
  '/MyInformation',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  MyInformation
);

router.get(
  '/ShowUserByid/:id_user',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  ShowUserByid
);

router.post(
  '/addFollow/:id_user',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  addFollow
);

router.delete(
  '/removeFollow/:id_user',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  removeFollow
);

router.put(
  '/UpdateProfile',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  Upload.single('img_user'),
  validate(schemaUpdateProfile),
  UpdateProfile
);

export default router;
