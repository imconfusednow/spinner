<script setup>
import { ref } from 'vue';
import OptionsInput from '@/components/optionsInput.vue';
import SpinnerCanvas from '@/components/SpinnerCanvas.vue';

const themes = ref([]);
const options = ref();
const currentTheme = ref("");

async function getThemes() {
    const url = "http://localhost:80/api/themes";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        themes.value = result;
    } catch (error) {
        console.error(error.message);
    }
}

getThemes();
</script>

<template>
    <span id="debug-text"></span>
    <div class="two-cols">
        <div class="spinner-div">
            <div id="theme-div">
                <select id="theme-select" v-model="currentTheme">
                    <option selected value="">Select Theme</option>
                    <option v-for="(theme, i) in themes" :value="i">{{ theme.name }}</option>
                </select>
                <a id="manage-themes-link" href="/themes">Manage Themes</a>
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


#theme-select {
    background-color: #405c79;
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 5px;
    width: 50%;
    max-width: 250px;
    font-size: 1.2rem;

    &.error {
        background: orange;
    }
}

#manage-themes-link {}
</style>
