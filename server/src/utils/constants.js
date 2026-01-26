import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const __basedir = path.resolve(__dirname + '../../../');

export const uploadsDir = path.join(__basedir, 'uploads', 'themes');
export const imageUploadsDir = path.join(uploadsDir, 'images');
export const soundUploadsDir = path.join(uploadsDir, 'sounds');
