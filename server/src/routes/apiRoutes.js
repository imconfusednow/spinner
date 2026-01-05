import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../utils/functions.js';
import { db } from '../db/index.js';

const router = Router();

router.get('/themes', async (req, res) => {
    const themes = db
        .prepare(
            `SELECT themes.*, animations.name AS animation FROM themes LEFT JOIN animations ON animations.id = themes.animation_id ORDER BY themes.name`,
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
    music_file: Joi.string().required(),
    image_file: Joi.string().required(),
    ending_file: Joi.string(),
    colours: Joi.string(),
    animation_id: Joi.number().allow(null),
}).options({ allowUnknown: false });

router.post('/themes', validate(themeSchema), async (req, res) => {
    try {
        const body = req.body;
        const existing = db
            .prepare('SELECT id FROM themes WHERE name = ?')
            .get(body.name);

        if (existing) {
            return res
                .status(409)
                .json({ message: `Theme ${body.name} already exists` });
        }

        const insert = db.prepare(
            'INSERT INTO themes (name, music, image, ending, animation_id, colours) VALUES (?, ?, ?, ?, ?, ?)',
        );
        insert.run([
            body.name,
            body.music,
            body.image,
            body.ending,
            body.animation_id,
            body.colours,
        ]);

        res.status(201).json({ message: `Theme ${body.name} created!` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/themes/:id', (req, res) => {
    try {
        const id = req.params.id;

        const deleteStatement = db.prepare('DELETE FROM themes WHERE id = ?');
        deleteStatement.run([id]);

        res.status(200).json({ message: `Theme ${id} deleted!` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

export default router;
