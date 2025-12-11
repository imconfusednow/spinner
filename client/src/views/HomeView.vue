<script setup>
import { ref } from 'vue';
import { apiFetch } from '@/js/utils.js';
import OptionsInput from '@/components/OptionsInput.vue';
import SpinnerCanvas from '@/components/SpinnerCanvas.vue';
import FilterSelect from '@/components/FilterSelect.vue';
import { DateTime } from 'luxon';
import { useSpinnerStore } from '@/stores/spinner';

const spinnerStore = useSpinnerStore();

const themes = ref([]);
const randomTheme = {"label": "Random", "value": 999, colour: "#c79f2e"};


async function getThemes() {
    const url = "/api/themes";
    try {
        const response = await apiFetch(url);        
        themes.value = parseThemes(response);
    } catch (error) {
        console.error(error.message);
    }
}

function parseThemes(themes) {
    for (let theme of themes) {
        theme.value = theme.id;
        theme.label = theme.name;
        theme.colour = ( DateTime.fromISO(theme.created_at.replace(" ", "T")) > DateTime.now().minus({weeks: 1}) ) ? 'green': '';
        theme.colours = ( theme.colours ) ? theme.colours.split(',') : '';
    }
    return [...[randomTheme], ...themes];
}

getThemes();
</script>

<template>
    <div class="outer-div">
        <div class="spinner-div">
            <div class="theme-div"> 
                <FilterSelect v-model="spinnerStore.currentTheme" :options="themes" defaultText="Choose Theme" style="margin-left: auto;"  v-show="!spinnerStore.spinning"/>
            </div>
            <SpinnerCanvas :themes="themes" />
        </div>
        <OptionsInput v-model="spinnerStore.options" class="options-div" v-show="!spinnerStore.spinning"/>
    </div>
</template>

<style scoped>
.outer-div {
    height: 100%;
    display: flex;
}

.spinner-div {
    position: relative;
    min-width: 500px;
    flex: 1;
    width:100%;
    height: 100%;
}

.theme-div {
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.options-div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: start;
  padding-inline: 1rem;
  flex-basis: 500px;
  flex-shrink: 1;
}

@keyframes shrink {
    0% {
        width: 100%;
    }
    100% {
       width: 10px;
    }
}

</style>
