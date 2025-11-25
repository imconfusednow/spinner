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

export async function startAnimationLoop(func) {
    function loop(timestamp) {
        func(timestamp);
        window.requestAnimationFrame(loop);
        
    }
    window.requestAnimationFrame(loop);
}    

export async function apiFetch(path, method="get") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // const response = await fetch(`${protocol}//${hostname}:${port}${path}`);
    const response = await fetch(`${path}`);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();    
}

export function fuzzyMatch(string, search) {
    if (string == null) {
        string = "";
    }
    return string.toLowerCase().includes(search.toLowerCase());
}