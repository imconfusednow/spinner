import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import { hostname } from 'os';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

const port = process.env.PORT || 3000;

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: `http://${hostname()}:80`,
            },
            '/uploads': {
                target: `http://${hostname()}:80`,
            },
        },
    },
});
