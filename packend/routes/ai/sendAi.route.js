import express from 'express';

import { sendMessageToAi } from '../../controllers/ai/sendAiController.js';
import { UploadFiles } from '../../config/Cloudinary.js';

const router = express.Router();

// Route for direct file upload to RAM (with error handling)
router.post('/sendAi', UploadFiles.single('file'), sendMessageToAi);

// Route for existing file in database via id_file (no file upload expected)
router.post('/sendAi/:id_file', sendMessageToAi);

export default router;
