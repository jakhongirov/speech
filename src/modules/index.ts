import { Router } from 'express';

// MIDDLEWARE
import AUTH from '../middleware/auth.js';
import upload from '../middleware/multer.js';

// FILES
import speech from './speech/speech.js';

const router = Router();

router
	/**
	 * @swagger
	 * /stt:
	 *   post:
	 *     summary: Transcribe audio to text and convert it back to audio
	 *     tags:
	 *       - Speech
	 *     consumes:
	 *       - multipart/form-data
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               audio:
	 *                 type: string
	 *                 format: binary
	 *                 description: Audio file (.ogg, .mp3, etc.)
	 *     responses:
	 *       200:
	 *         description: Successfully transcribed audio
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 status:
	 *                   type: number
	 *                   example: 200
	 *                 text:
	 *                   type: string
	 *                   example: Salom, dunyo!
	 *       400:
	 *         description: Bad request (e.g. no file provided)
	 *       500:
	 *         description: Internal server error
	 */
	.post('/stt', upload.single('audio'), speech.STT)

	/**
	 * @swagger
	 * /tts:
	 *   post:
	 *     summary: Convert text to speech (audio file)
	 *     tags:
	 *       - Speech
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               text:
	 *                 type: string
	 *                 example: "Assalomu alaykum"
	 *     responses:
	 *       200:
	 *         description: Audio file created from text
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 text:
	 *                   type: string
	 *                   example: "Assalomu alaykum"
	 *                 ttsPath:
	 *                   type: string
	 *                   example: "https://example.com/typed_tts_1722516749582.mp3"
	 *       500:
	 *         description: Internal server error
	 */
	.post('/tts', speech.TTS);

export default router;
