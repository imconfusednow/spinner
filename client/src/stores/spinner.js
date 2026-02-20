import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { DateTime } from 'luxon';
import { apiFetch } from '@/js/utils';
import { showToast } from '@/js/modals';

const randomTheme = { label: 'Random', value: 999, colour: '#c79f2e' };

export const useSpinnerStore = defineStore('spinner', () => {
    const spinning = ref(false);
    const options = useStorage('spinner-options', []);
    const themes = ref([]);
    const currentTheme = ref({});
    const fps = ref(100);

    async function fetchThemes() {
        const url = 'themes?hidden=true';
        try {
            const response = await apiFetch(url);
            themes.value = parseThemes(response);
        } catch (error) {
            showToast(error.message, 3000, ['error']);
        }
    }

    function parseThemes(themes) {
        for (let theme of themes) {
            theme.image = `/uploads/themes/images/${theme.image}`;
            theme.music = `/uploads/themes/sounds/${theme.music}`;
            theme.ending = `/uploads/themes/sounds/${theme.ending}`;
            theme.value = theme.id;
            theme.label = theme.name;
            theme.tag =
                DateTime.fromISO(theme.created_at.replace(' ', 'T')) >
                DateTime.now().minus({ weeks: 1 })
                    ? 'New'
                    : '';
            theme.colours = theme.colours ? theme.colours.split(',') : '';
        }
        return [...[randomTheme], ...themes];
    }

    fetchThemes();

    return { spinning, options, currentTheme, themes, fps, fetchThemes };
});
