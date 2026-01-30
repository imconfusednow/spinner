import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { imageUploadsDir, soundUploadsDir } from './constants.js';

const fieldMapping = {
    image_file: {
        dir: 'images',
        mimes: new Set([
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/svg+xml',
        ]),
    },
    music_file: {
        dir: 'sounds',
        mimes: new Set(['audio/mpeg', 'audio/wav', 'audio/ogg']),
    },
    ending_file: {
        dir: 'sounds',
        mimes: new Set(['audio/mpeg', 'audio/wav', 'audio/ogg']),
    },
};

export function validate(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const message = error.details.map((i) => i.message).join(', ');
            return res.status(400).json({ message: message });
        }
        next();
    };
}

const themeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const mapping = fieldMapping[file.fieldname];
        if (!mapping.mimes.has(file.mimetype)) {
            return cb(
                new Error(`Invalid file type ${file.mimetype} ${mapping.dir}`),
                false,
            );
        }
        const dir = path.join('uploads', 'themes', mapping.dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const ext = path.extname(file.originalname);
        const fileName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z]/g, '');
        cb(null, fileName + '-' + uniqueSuffix + ext);
    },
});

export const handleThemeFiles = multer({
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    storage: themeStorage,
});

export async function deleteUploadedFiles(theme) {
    deleteFile(path.join(imageUploadsDir, theme.image));
    deleteFile(path.join(soundUploadsDir, theme.music));
    deleteFile(path.join(soundUploadsDir, theme.ending));
}

export async function deleteFile(filePath) {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (e) {
        if (e.code === 'ENOENT') {
            throw new Error(`File ${filePath} does not exist`);
        } else {
            throw new Error(e);
        }
    }
}
