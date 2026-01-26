import { db } from '../db/index.js';
import fs from 'fs/promises';
import path from 'path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { deleteFile } from '../utils/functions.js';
import { imageUploadsDir, soundUploadsDir } from '../utils/constants.js';

const themes = db.prepare(`SELECT themes.* FROM themes`).all();

const fileNamesSet = new Set(
    themes.flatMap((theme) => {
        return [theme.image, theme.music, theme.ending];
    }),
);

const imageFiles = await fs.readdir(imageUploadsDir);
const soundFiles = await fs.readdir(soundUploadsDir);

let toDelete = new Set();

getOrphaned(imageUploadsDir, imageFiles);
getOrphaned(soundUploadsDir, soundFiles);

function getOrphaned(dir, files) {
    for (let file of files) {
        if (!fileNamesSet.has(file)) {
            toDelete.add(path.join(dir, file));
        }
    }
}

console.warn(`Will delete the following ${toDelete.size} files: `);
console.warn(toDelete);

const rl = readline.createInterface({ input, output });

const confirm = await rl.question('Accept delete?(y/N)');

if (confirm.toLowerCase() === 'y') {
    console.log('Confirmed Delete');
    for (let filePath of toDelete) {
        deleteFile(filePath);
    }
    console.log('Delete successful');
} else {
    console.log('Not Deleting');
}
rl.close();
