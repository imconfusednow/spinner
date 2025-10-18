import express from 'express';
import path from 'path';
import htmlRoutes from './routes/htmlRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { __basedir } from './utils/constants.js';
import { create } from "express-handlebars";

const app = express();
const hbs = create({
        helpers: {
            json: (context) => JSON.stringify(context)
        },
        extname: 'hbs'
    }
    );
app.use(express.json());

app.engine('hbs', hbs.engine);

app.set('views', path.join(__basedir, 'src/views'));
app.set('view engine', 'hbs');

app.use('/', htmlRoutes);
app.use('/api', apiRoutes);



export default app;