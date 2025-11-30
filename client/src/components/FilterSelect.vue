<script setup>
import { computed, ref, useTemplateRef, nextTick } from 'vue';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { fuzzyMatch } from '@/js/utils.js'

const props = defineProps(['options', 'defaultText']);
const model = defineModel();

const search = ref('');
const searching = ref(false);
const searchBox = useTemplateRef('search-box');


onClickOutside( searchBox, (event) => {
    searching.value = false;
});

onKeyStroke('Enter', (e) => {
  handleSelected(filteredOptions.value[0]);
}, { target: searchBox });

function handleSelected(optionValue) {
    model.value = optionValue;
    searching.value = false;
    search.value = '';
}

const filteredOptions = computed(() => {
    return props.options.filter((option) => {
        if (!search.value) {
            return true;
        }
        return fuzzyMatch(option.name, search.value);
    });
});

function setSearching() {
    searching.value = true;
    search.value = '';
    nextTick(()=>searchBox.value.focus());
}

const closedText = computed(() => {
    if (model.value) {
        return model.value.name;
    }
    if (props.defaultText) {
        return props.defaultText;
    }
    return 'Select Option';
});

</script>

<template>
    <div class="outer-div">
        <input v-model="search" v-show="searching" class="search-box" placeholder="Search themes" ref="search-box" />
        <input v-model="model" hidden />
        <button class="option-button" @click="setSearching" v-show="!searching">{{ closedText }}<span class="dropdown-v">V</span></button>
        <div class="pretend-select" v-show="searching">
            <button v-for="option in filteredOptions" class="option-button" @click="handleSelected(option)"
                :key="option.value" :style="{ backgroundColor: option.colour }">{{ option.label }}</button>
        </div>
    </div>
</template>

<style scoped>
#theme-select {
    background-color: #405c79;
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 5px;
    width: 100%;
    max-width: 250px;
    font-size: 1.2rem;

    &.error {
        background: orange;
    }
}

.outer-div {
    display: flex;
    position: relative;
    min-width: 30ch;
}

.pretend-select {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    top: 100%;

    .option-button {
        border-top: solid #223548 1px;
    }
}

.search-box {
    font-size: 1.2rem;
    max-width: 250px;
    width: 100%;
    border: none;
    min-height: 50px;
    outline: none;
    background-color: #3b4651;
    color: white;
    padding-inline: 1rem;
}

.option-button {
    background-color: #24303c;
    color: white;
    border: none;
    width: 100%;
    max-width: 250px;
    font-size: 1.4rem;
    min-height: 55px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 1rem;

    &:hover {
        filter: brightness(0.8);
        cursor: pointer;
    }
}

.dropdown-v {
    font-size: 0.8rem;
}

</style>
