<script setup>
import { onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { Wheel } from '@/js/wheel';
import { Modal } from '@/js/modals';
import { onKeyStroke, useRafFn } from '@vueuse/core';
import { Canvas } from '@/js/canvas.js';
import { useSpinnerStore } from '@/stores/spinner';

const props = defineProps({
    captureSpace: { type: Boolean, required: false },
    localOptions: { type: Array, required: false, default: null },
});
const spinnerStore = useSpinnerStore();
let wheel = null;

let pause = ref(null);

if (props.captureSpace) {
    onKeyStroke(' ', (e) => {
        if (e.target.id === 'options-input') {
            return;
        }
        e.preventDefault();
        wheel.start();
    });
}

onMounted(() => {
    const resultModal = new Modal({ startOpen: false, classes: [] });
    resultModal.setHeaderText('Spinner Result');
    const canvas = new Canvas('spinner-canvas');
    wheel = new Wheel(canvas, resultModal, spinnerStore, Math.random());
    ({ pause } = useRafFn(() => wheel.draw()));
    if (props.localOptions) {
        wheel.updateLocalOptions(props.localOptions);
    }
});

watch(
    () => props.localOptions,
    () => {
        wheel.updateLocalOptions(props.localOptions);
    },
);

onBeforeRouteLeave(() => {
    pause();
    wheel = null;
});
</script>

<template>
    <div ref="outer-div" class="canvas-outer-div" tabindex="2">
        <canvas id="spinner-canvas">Couldn't load canvas</canvas>
    </div>
</template>

<style scoped>
.canvas-outer-div {
    height: 100%;
    &:focus-visible {
        outline: none;
    }
}

#spinner-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

@keyframes spinspin {
    100% {
        transform: rotate3d(1, 1, 0, 360deg);
    }
}
</style>
