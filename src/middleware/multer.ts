import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.resolve(__dirname, '..', '..', 'public/audios'));
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname.split(' ').join(''));
	},
});
const upload = multer({ storage: storage });

export default upload;
