import { Router } from 'express';
import * as fs from 'fs/promises';
import { themesPath } from '../utils/constants.js';

const router = Router();

router.get('/', async (req, res) => {
  const jsonData = JSON.parse(await fs.readFile(themesPath, 'utf-8'));
  const context = {
    title: 'Spinner',
    cssFile: 'spinner.css',
    themes: jsonData
  };
  res.render('index', context);
});

router.get('/themes', async (req, res) => {
  const jsonData = JSON.parse(await fs.readFile(themesPath, 'utf-8'));
  const context = {
    title: 'Themes',
    cssFile: 'themes.css',
    themes: jsonData
  };
  res.render('themes', context);
});

export default router;