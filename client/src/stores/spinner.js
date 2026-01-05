import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { DateTime } from 'luxon';
import { apiFetch } from '@/js/utils';

const randomTheme = { label: 'Random', value: 999, colour: '#c79f2e' };

export const useSpinnerStore = defineStore('spinner', () => {
    const spinning = ref(false);
    const options = useStorage('spinner-options', []);
    const themes = ref([]);
    const currentTheme = ref({});

    async function fetchThemes() {
        const url = 'themes';
        try {
            const response = await apiFetch(url);
            themes.value = parseThemes(response);
        } catch (error) {
            console.error(error.message);
        }
    }

    function parseThemes(themes) {
        for (let theme of themes) {
            theme.image = `/images/themes/${theme.image}`;
            theme.music = `/sounds/themes/${theme.music}`;
            theme.ending = `/sounds/themes/${theme.music}`;
            theme.value = theme.id;
            theme.label = theme.name;
            theme.colour =
                DateTime.fromISO(theme.created_at.replace(' ', 'T')) >
                DateTime.now().minus({ weeks: 1 })
                    ? 'green'
                    : '';
            theme.colours = theme.colours ? theme.colours.split(',') : '';
        }
        return [...[randomTheme], ...themes];
    }

    fetchThemes();

    return { spinning, options, currentTheme, themes, fetchThemes };
});
