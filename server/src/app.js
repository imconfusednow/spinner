import express from 'express';
import path from 'path';
import apiRoutes from './routes/apiRoutes.js';
import { __basedir } from './utils/constants.js';
import { create } from "express-handlebars";
import cors from 'cors';
import {runMigrations} from "./db/index.js";

runMigrations();

const app = express();
const hbs = create({
        helpers: {
            json: (context) => JSON.stringify(context)
        },
        extname: 'hbs'
    }
    );
app.use(express.json());

app.use(cors());

app.use(express.static('../client/dist'));
app.use(express.static('../client/public'));

app.engine('hbs', hbs.engine);

app.set('views', path.join(__basedir, 'src/views'));
app.set('view engine', 'hbs');

app.use('/api', apiRoutes);

export default app;