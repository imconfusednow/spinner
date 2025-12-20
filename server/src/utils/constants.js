import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const __basedir = path.resolve(__dirname + '../../../');

export const themesPath = __basedir + '/data/themes.json';
