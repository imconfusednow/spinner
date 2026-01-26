import { EMOJI } from '@/js/constants.js';
import { useSessionStore } from '@/stores/session';

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

export async function apiFetch(
    path,
    method = 'GET',
    payload = null,
    contentType = 'application/json',
) {
    const sessionStore = useSessionStore();
    const opts = {
        method: method,
        headers: {
            Accept: contentType,
            authorization: `Bearer ${sessionStore.token}`,
        },
    };

    if (payload) {
        if (contentType === 'application/json') {
            opts.body = JSON.stringify(payload);
            opts.headers['Content-Type'] = contentType;
        } else {
            opts.body = payload;
        }
    }
    const response = await fetch(`/api/${path}`, opts);
    if (!response.ok) {
        const data = await response.json();
        throw new Error(`Response status: ${response.status}. ${data.message}`);
    }
    return await response.json();
}

export function createFormData(json) {
    const formData = new FormData();

    Object.entries(json).forEach(([key, value]) => {
        if (value === undefined || value === '') {
            return;
        }
        formData.append(key, value);
    });

    return formData;
}

export function fuzzyMatch(string, search) {
    if (string == null) {
        string = '';
    }
    return string.toLowerCase().includes(search.toLowerCase());
}
