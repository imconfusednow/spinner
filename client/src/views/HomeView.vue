<script setup>
import { ref } from 'vue';
import { apiFetch } from '@/js/utils.js';
import OptionsInput from '@/components/OptionsInput.vue';
import SpinnerCanvas from '@/components/SpinnerCanvas.vue';
import FilterSelect from '@/components/FilterSelect.vue';
import { DateTime } from 'luxon';

const themes = ref([]);
const options = ref([]);
const currentTheme = ref(null);
const showMenu = ref(false);

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
    }
    return themes;
}

getThemes();
</script>

<template>
    <span id="debug-text"></span>
    <div class="two-cols">
        <div class="spinner-div">
            <div id="theme-div">
                <button class="btn btn-light"><img src="/images/menu.svg" class="menu-icon" @click="showMenu = true"></img></button>
                <FilterSelect v-model="currentTheme" :options="themes" defaultText="Choose Theme" />                         
            </div>
            <SpinnerCanvas :options="options" :currentTheme="currentTheme" :themes="themes" />
        </div>
        <OptionsInput v-model="options" />
    </div>
</template>

<style scoped>
.spinner-div {
    position: relative;
}

#theme-div {
    position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.menu-icon {
    width: 2rem;
}

</style>
