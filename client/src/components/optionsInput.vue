<script setup>
  import { computed, ref, watch } from 'vue';

  const optionsText = ref('');

  const model = defineModel();

  const parsedOptions = computed(()=>{
    if ( optionsText.value === "") {
        return [];
    }
    let returnOptions = [];

    for (let line of optionsText.value.split("\n")) {
        if (line === "") 
        {
            continue;
        }        
        returnOptions.push(line);
    }

    // saveParams(returnOptions);

    return returnOptions;
  });


 watch(optionsText, ()=>{
  model.value = parsedOptions.value;
 },
{ immediate: true });

</script>

<template>
  <div class="options-div">
      <textarea id="options-input" v-model="optionsText" placeholder="Type each option on a new line here :)"></textarea>
      <button id="update-options-button" class="btn">Update</button>
  </div>
</template>

<style scoped>
  .options-div {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: start;
      padding: 1rem;
      flex-grow: 1;
  }

  #update-options-button {
      font-size: 1rem;
      background-color: #004774;
  }
</style>
