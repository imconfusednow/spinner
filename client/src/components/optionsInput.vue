<script setup>
import { ref, watch } from 'vue';
import { loadParams, saveParams } from '@/js/utils';

const optionsText = ref('');

const model = defineModel({ type: Array });
const props = defineProps({
    highlight: { type: Boolean, default: false },
});
const emit = defineEmits(['change']);

function parseOptions(text) {
    if (text === '') {
        return [];
    }
    let returnOptions = [];

    for (let line of text.split('\n')) {
        if (line === '') {
            continue;
        }
        returnOptions.push(line);
    }
    return returnOptions;
}

watch(optionsText, () => {
    const parsedOptions = parseOptions(optionsText.value);
    model.value = parsedOptions;
    saveParams(parsedOptions);
    emit('change');
});

const params = loadParams();
if (params) {
    optionsText.value = params;
}
if (!optionsText.value) {
    optionsText.value = model.value.join('\n');
    saveParams(model.value);
}
</script>

<template>
    <div>
        <textarea
            id="options-input"
            v-model="optionsText"
            :class="{ highlight: highlight }"
            placeholder="Type each option on a new line here :)"
        ></textarea>
    </div>
</template>

<style scoped>
textarea {
    flex-grow: 1;
    width: 100%;
    padding: 1rem;
    font-size: 1.7rem;
    resize: none;
}

.highlight {
    outline: orange solid;
    animation: flash 0.9s infinite linear;
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
