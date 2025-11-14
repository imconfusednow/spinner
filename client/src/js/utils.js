import { EMOJI } from "@/js/constants.js";

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

export function saveParams(options) {
    const params = new URLSearchParams(document.location.search);
    const optionsString = options.map((option)=>{return option}).join(',');
    params.set('options', optionsString);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

export function loadParams() {
    const params = new URLSearchParams(document.location.search);
    const optionsString = params.get("options");
    if (!optionsString) {
        return;
    }
    const splitOptions = optionsString.split(",").join("\n");
    return splitOptions;
}