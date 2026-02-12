import multer from 'multer';
import config from '../config/storage.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

export const upload = multer({ storage });
