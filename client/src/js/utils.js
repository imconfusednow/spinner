import { EMOJI } from '@/js/constants.js';

export function randomChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
}

export function randomEmoji() {
    return randomChoice(EMOJI);
}

export function captureCTRL(key, callback) {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === key) {
            e.preventDefault();
            callback();
        }
    });
}

export function saveParams(options) {
    const params = new URLSearchParams(document.location.search);
    const optionsString = options
        .map((option) => {
            return option;
        })
        .join(',');
    params.set('options', optionsString);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

export function loadParams() {
    const params = new URLSearchParams(document.location.search);
    const optionsString = params.get('options');
    if (!optionsString) {
        return;
    }
    const splitOptions = optionsString.split(',').join('\n');
    return splitOptions;
}

export async function startAnimationLoop(func) {
    function loop(timestamp) {
        func(timestamp);
        window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
}

export async function apiFetch(path, method = 'GET', payload) {
    const response = await fetch(`/api/${path}`, {
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(`Response status: ${response.status}. ${data.error}`);
    }
    return await response.json();
}

export function fuzzyMatch(string, search) {
    if (string == null) {
        string = '';
    }
    return string.toLowerCase().includes(search.toLowerCase());
}
