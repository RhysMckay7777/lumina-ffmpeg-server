import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the ffmpeg-playground
const rootDir = path.resolve(__dirname, '../../');

const uploadsDir = path.join(rootDir, 'uploads');
const outputsDir = path.join(rootDir, 'outputs');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);

export const config = {
  PORT: process.env.PORT || 3333,
  uploadsDir,
  outputsDir,
  rootDir
};

export default config;
