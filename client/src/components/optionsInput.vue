<script setup>
import { computed, ref, watch } from 'vue';
import { loadParams, saveParams } from '@/js/utils';

const optionsText = ref('');

const model = defineModel();

function parseOptions(text) {
  if (text === "") {
    return [];
  }
  let returnOptions = [];

  for (let line of text.split("\n")) {
    if (line === "") {
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
});

const params = loadParams();
if (params) {
  optionsText.value = params;
}
if (!optionsText.value) {
  optionsText.value = model.value.join("\n")
  saveParams(model.value);
}

</script>

<template>
  <div>
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

</style>
