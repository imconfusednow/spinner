<script setup>
import { computed, ref, useTemplateRef, nextTick } from 'vue';
import { onClickOutside, onKeyStroke } from '@vueuse/core';
import { fuzzyMatch } from '@/js/utils.js';

const props = defineProps({
    options: { type: Array, required: true },
    defaultText: { type: String, default: '' },
    highlight: { type: Boolean, default: false },
});
const model = defineModel({ type: Object });
const emit = defineEmits(['change']);

const search = ref('');
const searching = ref(false);
const searchBox = useTemplateRef('search-box');

onClickOutside(searchBox, () => {
    searching.value = false;
});

onKeyStroke(
    'Enter',
    (e) => {
        handleSelected(filteredOptions.value[0]);
    },
    { target: searchBox },
);

function handleSelected(optionValue) {
    model.value = optionValue;
    searching.value = false;
    search.value = '';
    emit('change');
}

const filteredOptions = computed(() => {
    return props.options.filter((option) => {
        if (!search.value) {
            return true;
        }
        return fuzzyMatch(option.label, search.value);
    });
});

function setSearching() {
    searching.value = true;
    search.value = '';
    nextTick(() => searchBox.value.focus());
}

const closedText = computed(() => {
    if (Object.keys(model.value).length !== 0) {
        return model.value.label;
    }
    if (props.defaultText) {
        return props.defaultText;
    }
    return 'Select Option';
});
</script>

<template>
    <div class="outer-div">
        <input
            v-show="searching"
            ref="search-box"
            v-model="search"
            class="search-box"
            placeholder="Search themes"
        />
        <input v-model="model" hidden />
        <button
            v-show="!searching"
            class="option-button"
            :class="{ highlight: highlight }"
            @click="setSearching"
        >
            {{ closedText }}<span class="dropdown-v">V</span>
        </button>
        <div v-show="searching" class="pretend-select">
            <button
                v-for="option in filteredOptions"
                :key="option.value"
                class="option-button"
                :style="{ backgroundColor: option.colour }"
                @click="handleSelected(option)"
            >
                {{ option.label }}
                <span v-if="option.tag" class="tag">{{ option.tag }}</span>
            </button>
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
    max-height: calc(100vh - 1.5rem - 50px);
    overflow: auto;
    max-width: 250px;

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

.highlight {
    outline: orange solid;
    animation: flash 0.9s infinite linear;
}

.tag {
    background: rgb(12, 133, 231);
    padding: 0.3rem;
    border-radius: 5px;
    font-size: 0.8rem;
}

@keyframes flash {
    0% {
        filter: brightness(0.9);
    }
    50% {
        filter: brightness(1.5);
    }
    100% {
        filter: brightness(0.9);
    }
}
</style>
