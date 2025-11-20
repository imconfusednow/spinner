<script setup>
import { computed, ref, watch } from 'vue';
import { loadParams, saveParams } from '@/js/utils';

const optionsText = ref('');

const model = defineModel();

const parsedOptions = computed(() => {
  if (optionsText.value === "") {
    return [];
  }
  let returnOptions = [];

  for (let line of optionsText.value.split("\n")) {
    if (line === "") {
      continue;
    }
    returnOptions.push(line);
  }

  saveParams(returnOptions);

  return returnOptions;
});


watch(optionsText, () => {
  model.value = parsedOptions.value;
});

const params = loadParams();
if (params) {
  optionsText.value = params;
}

</script>

<template>
  <div class="options-div">
    <textarea id="options-input" v-model="optionsText" placeholder="Type each option on a new line here :)"></textarea>
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

.options-div {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: start;
  padding-inline: 1rem;
  flex-grow: 1;
}
</style>
