<script setup>
import { ref } from 'vue';
import { showToast } from '@/js/modals';
import OptionsInput from '@/components/OptionsInput.vue';
import SpinnerCanvas from '@/components/SpinnerCanvas.vue';
import FilterSelect from '@/components/FilterSelect.vue';
import { DateTime } from 'luxon';
import { useSpinnerStore } from '@/stores/spinner';
import { useEventBus } from '@vueuse/core';

const spinnerStore = useSpinnerStore();
const eventBus = useEventBus('user-error');
eventBus.on(onUserError);

const hightlightSelect = ref(false);
const highlightOptions = ref(false);


function onUserError(name, payload) {
    showToast(payload.message, payload.timeout, payload.classes);
    if (name === 'no_theme') {
        hightlightSelect.value = true;
    }
    if (name === 'no_options') {
        highlightOptions.value = true;
    }
}

</script>

<template>
    <div class="outer-div">
        <div class="spinner-div">
            <div class="theme-div"> 
                <FilterSelect v-model="spinnerStore.currentTheme" :options="spinnerStore.themes" :highlight="hightlightSelect" @change="hightlightSelect = false" defaultText="Choose Theme" class="theme-select" v-show="!spinnerStore.spinning"/>
            </div>
            <SpinnerCanvas :captureSpace="true" />
        </div>
        <OptionsInput v-model="spinnerStore.options" class="options-div" v-show="!spinnerStore.spinning" :highlight="highlightOptions" @change="highlightOptions = false"/>
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

.theme-select {
    margin-left: auto;
}

</style>
