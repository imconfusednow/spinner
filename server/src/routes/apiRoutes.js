import { Router } from 'express';
import Joi from 'joi';
import {
    validate,
    handleThemeFiles,
    deleteUploadedFiles,
} from '../utils/functions.js';
import { authenticateToken, generateToken } from '../utils/authentication.js';
import { db } from '../db/index.js';

const router = Router();

router.get('/themes', authenticateToken, async (req, res) => {
    const themes = db
        .prepare(
            `SELECT themes.*, animations.name AS animation FROM themes LEFT JOIN animations ON animations.id = themes.animation_id ORDER BY themes.name COLLATE NOCASE`,
        )
        .all();
    res.json(themes);
});

router.get('/animations', async (req, res) => {
    const animations = db
        .prepare(`SELECT * FROM animations ORDER BY animations.name`)
        .all();
    res.json(animations);
});

const themeSchema = Joi.object({
    name: Joi.string().required(),
    colours: Joi.string().allow(null),
    animation_id: Joi.number().allow(null),
}).options({ allowUnknown: false });

router.post(
    '/themes',
    handleThemeFiles.fields([
        { name: 'image_file', maxCount: 1 },
        { name: 'music_file', maxCount: 1 },
        { name: 'ending_file', maxCount: 1 },
    ]),
    validate(themeSchema),
    async (req, res) => {
        try {
            const body = req.body;
            const existing = db
                .prepare('SELECT id FROM themes WHERE name = ?')
                .get(body.name);

            if (existing) {
                const msg = `Theme ${body.name} already exists`;
                return res.status(409).json({ message: msg });
            }

            const insert = db.prepare(
                'INSERT INTO themes (name, music, image, ending, animation_id, colours) VALUES (?, ?, ?, ?, ?, ?)',
            );
            insert.run([
                body.name,
                req.files['music_file'][0].filename,
                req.files['image_file'][0].filename,
                req.files['ending_file'][0].filename,
                body.animation_id,
                body.colours,
            ]);

            res.status(201).json({ message: `Theme ${body.name} created!` });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: err.message });
        }
    },
);

router.delete('/themes/:id', (req, res) => {
    try {
        const id = req.params.id;

        const theme = db
            .prepare('SELECT themes.* FROM themes WHERE id = ?')
            .get(id);

        if (!theme) {
            const msg = `Theme ${id} not found`;
            return res.status(404).json({ message: msg });
        }

        deleteUploadedFiles(theme);

        const deleteStatement = db.prepare('DELETE FROM themes WHERE id = ?');
        deleteStatement.run([id]);

        res.status(200).json({ message: `Theme ${id} deleted!` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
}).options({ allowUnknown: false });

router.post('/login', validate(loginSchema), (req, res) => {
    try {
        const { username, password } = req.body;
        const payload = { username: req.body.username };
        const token = generateToken(payload);

        res.status(200).json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

export default router;
