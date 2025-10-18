import { EMOJI } from "/js/constants.js";

export function randomEmoji() {
    return EMOJI[Math.floor(Math.random() * EMOJI.length)];
}

export function captureCTRL(key, callback) {
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === key) {
            e.preventDefault();
            callback();            
        }
    });
}
