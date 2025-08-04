import { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { Model, Recognizer } from 'vosk';
import wav from 'wav';
import { EdgeTTS } from 'node-edge-tts';

dotenv.config();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const MODEL_PATH = path.resolve(
	__dirname,
	'../../../../vosk-model-small-uz-0.22',
);
const UPLOADS_DIR = path.resolve(__dirname, '../../../../public/audios');

const model = new Model(MODEL_PATH);

if (!fs.existsSync(MODEL_PATH)) {
	console.error('Model not found:', MODEL_PATH);
	process.exit(1);
}

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const STT = async (req: Request, res: Response) => {
	try {
		const inputPath = req.file!.path;
		const wavPath = inputPath + '.wav';
		execSync(
			`ffmpeg -y -i ${inputPath} -ar 16000 -ac 1 -c:a pcm_s16le ${wavPath}`,
		);
		const wfReader = new wav.Reader();
		const fileStream = fs.createReadStream(wavPath);
		fileStream.pipe(wfReader);

		wfReader.on('format', ({ sampleRate }) => {
			const rec = new Recognizer({ model, sampleRate });
			rec.setWords(true);

			wfReader.on('data', (data) => {
				rec.acceptWaveform(data);
			});

			wfReader.on('end', async () => {
				const result = rec.finalResult();
				fs.unlinkSync(inputPath);
				fs.unlinkSync(wavPath);

				const outputFile = path.resolve(
					__dirname,
					`../../../../public/audios/tts_${Date.now()}.mp3`,
				);
				const edge = new EdgeTTS({
					voice: 'uz-UZ-MadinaNeural',
					outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
				});

				await edge.ttsPromise(
					result.text || 'No speech detected',
					outputFile,
				);

				res.json({
					status: 200,
					text: result.text,
				});
				return;
			});
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 500,
			message: 'Interval Server Error',
		});
		return;
	}
};

const TTS = async (req: Request, res: Response) => {
	try {
		const text = req.body.text || 'No text provided';
		const audioFile = `typed_tts_${Date.now()}.mp3`;
		const outputFile = path.resolve(
			__dirname,
			`../../../../public/audios/${audioFile}`,
		);

		const tts = new EdgeTTS({
			// voice: "uz-UZ-SardorNeural"
			voice: 'uz-UZ-MadinaNeural',
			outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
		});

		await tts.ttsPromise(text, outputFile);

		res.status(200).json({
			text: text,
			ttsPath: `${process.env.URL}/${audioFile}`,
		});
		return;
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: 500,
			message: 'Interval Server Error',
		});
		return;
	}
};

export default {
	STT,
	TTS,
};
