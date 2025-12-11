import { Router } from "express";
import Joi from "joi";
import { validate } from "../utils/functions.js";
import { db } from "../db/index.js";

const router = Router();

router.get("/themes", async (req, res) => {
  const themes = db
    .prepare(
      `SELECT themes.*, animations.name AS animation FROM themes LEFT JOIN animations ON animations.id = themes.animation_id ORDER BY themes.name`
    )
    .all();
  res.json(themes);
});

const themeSchema = Joi.object({
  name: Joi.string().required(),
  music: Joi.string().required(),
  image: Joi.string().required(),
  ending: Joi.string(),
  colours: Joi.string(),
  animation_name: Joi.string(),
}).options({ allowUnknown: false });

router.post("/themes", validate(themeSchema), async (req, res) => {
  try {
      const body = req.body
      const existing = db
        .prepare("SELECT id FROM themes WHERE name = ?")
        .get(body.name);

      if (existing) {
        return res
          .status(409)
          .json({ message: `Theme ${body.name} already exists` });
      }

      let animation = null;

      if (body.animation_name) {
        animation = db
          .prepare("SELECT id FROM animations WHERE name = ?")
          .get(body.animation_name);
        if (!animation) {
          // return res.status(409).json({message: `Animation ${body.animation_name} not found`});
          const insert = db.prepare("INSERT INTO animations (name) VALUES (?)");
          insert.run([body.animation_name]);
          animation = db
            .prepare("SELECT id FROM animations WHERE name = ?")
            .get(body.animation_name);
        }
      }
      const insert = db.prepare(
        "INSERT INTO themes (name, music, image, ending, animation_id, colours) VALUES (?, ?, ?, ?, ?, ?)"
      );
      insert.run([
        body.name,
        body.music,
        body.image,
        body.ending,
        animation?.id,
        body.colours
      ]);
    
    res.status(201).json({ message: `Theme ${body.name} created!` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
