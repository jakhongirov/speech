import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const app = express();
const server = http.createServer(app);
import PORT from './src/config.js';
import router from './src/modules/index.js';
import TelegramBot from 'node-telegram-bot-api';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicFolderPath = path.join(__dirname, 'public');
const audiosFolderPath = path.join(publicFolderPath, 'audios');

if (!fs.existsSync(publicFolderPath)) {
	fs.mkdirSync(publicFolderPath);
	console.log('Public folder created successfully.');
} else {
	console.log('Public folder already exists.');
}

if (!fs.existsSync(audiosFolderPath)) {
	fs.mkdirSync(audiosFolderPath);
	console.log('Audios folder created successfully.');
} else {
	console.log('Audios folder already exists within the public folder.');
}

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'SPEECh API documentation',
			version: '1.0.0',
			description: 'by Diyor Jaxongirov',
		},
		servers: [
			{
				url: 'https://speech.aiseller.uz/api/v1',
			},
		],
	},
	apis: ['./src/modules/index.ts'],
};

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
app.use(
	cors({
		origin: '*',
	}),
);
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	}),
);
app.use('/public', express.static(path.resolve(__dirname, '../public')));
app.use('/api/v1', router);

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
