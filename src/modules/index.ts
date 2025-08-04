import { Router } from 'express';

// MIDDLEWARE
import AUTH from '../middleware/auth.js';
import upload from '../middleware/multer.js';

// FILES
import speech from './speech/speech.js';

const router = Router();

router
	.post('/stt', upload.single('audio'), speech.STT)
	.post('/tts', speech.TTS);

export default router;
