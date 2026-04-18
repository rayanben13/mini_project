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

import '../config/passport.js';
import passport from 'passport';
import { Upload } from '../config/Cloudinary.js';

const router = express.Router();

router.get(
  '/MyInformation',
  passport.authenticate('jwt', { session: false }),
  MyInformation
);

router.get(
  '/ShowUserByid/:id_user',
  passport.authenticate('jwt', { session: false }),
  ShowUserByid
);

router.post(
  '/addFollow/:id_user',
  passport.authenticate('jwt', { session: false }),
  addFollow
);

router.delete(
  '/removeFollow/:id_user',
  passport.authenticate('jwt', { session: false }),
  removeFollow
);

router.put(
  '/UpdateProfile',
  passport.authenticate('jwt', { session: false }),
  Upload.single('img_user'),
  validate(schemaUpdateProfile),
  UpdateProfile
);

export default router;
