import express from 'express';
import path from 'path';
import apiRoutes from './routes/apiRoutes.js';
import { __basedir } from './utils/constants.js';
import cors from 'cors';
import { runMigrations } from './db/index.js';
import multer from 'multer';
import 'dotenv/config';

runMigrations();

const app = express();

app.use(express.json());

app.use(cors());

app.use(express.static('../client/dist'));
app.use(express.static('../client/public'));
app.use('/uploads', express.static('uploads'));

app.set('views', path.join(__basedir, 'src/views'));

app.use('/api', apiRoutes);

app.get('/*splat', (req, res) => {
    res.sendFile('/index.html', { root: '../client/dist' });
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            code: err.code,
            message: err.message,
        });
    }

    if (err.status) {
        return res.status(err.status).json({
            success: false,
            code: err.code,
            message: err.message,
        });
    }

    console.error(err);
    res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message,
    });
});

export default app;
