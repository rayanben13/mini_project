import {
  searchFiles,
  searchSubjects,
} from '../controllers/search.controller.js';
import express from 'express';

import '../config/passport.js';

const router = express.Router();

router.get('/searchFiles', searchFiles);

router.get('/searchSubjects', searchSubjects);

export default router;
