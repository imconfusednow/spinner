import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

export const useSessionStore = defineStore('session', () => {
    const token = useStorage('jwt-token', '');

    return { token };
});
