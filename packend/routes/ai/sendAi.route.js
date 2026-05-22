import express from 'express';
import { sendMessageToAi, activateLibraryDocument, activateLocalDocument } from '../../controllers/ai/sendAiController.js';
import { UploadFiles } from '../../config/Cloudinary.js';
import { requireUser } from '../../middleware/checkUserInformation.js';
import validate from '../../middleware/validate.js';
import passport from 'passport';
import { schemaChatAi } from '../../schemas/auth.schema.js';

const router = express.Router();

router.post(
  '/sendAi',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  UploadFiles.single('file'),
  validate(schemaChatAi),
  sendMessageToAi
);

router.post(
  '/sendAi/:id_file',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  validate(schemaChatAi),
  sendMessageToAi
);

router.post(
  '/activate/:id_file',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  activateLibraryDocument
);

router.post(
  '/activate-local',
  passport.authenticate('jwt', { session: false }),
  requireUser,
  UploadFiles.single('file'),
  activateLocalDocument
);


export default router;
