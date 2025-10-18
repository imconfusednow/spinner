
import { Router } from 'express';
import Joi from 'joi';
import { validate} from '../utils/functions.js';
import * as fs from 'fs/promises';
import {themesPath} from '../utils/constants.js';

const router = Router();

router.get('/api/themes', async (req, res)=>{  
  const jsonData = JSON.parse(await fs.readFile(themesPath, 'utf-8'));
  res.json(jsonData);
});


const themeSchema = Joi.object({
  name: Joi.string().required(),
  music: Joi.string().required(),
  image: Joi.string().required(),
  ending: Joi.string(),
  colours: Joi.string(),
  animation: Joi.string(),
  optionColour: Joi.string()
}).options({allowUnknown: false});

router.post('/api/themes', validate(themeSchema), async (req, res) => {
  try {
    const jsonData = JSON.parse(await fs.readFile(themesPath, 'utf-8'));

    const body = req.body;  
  
    jsonData.push(body);
    fs.writeFile(themesPath, JSON.stringify(jsonData, null, 4), 'utf8');
    res.status(201).json({message: `Theme ${body.name} created!`});
  }
  catch (err) {
    console.error(err);
  }
   
});

export default router;