<script setup>
    import { ref, onMounted, watch } from 'vue'
    import { Wheel } from '@/js/wheel';
    import { Modal } from '@/js/modals';
    import { watchOnce } from '@vueuse/core';

    let wheel = ref();
    const props = defineProps(['options', 'currentTheme', 'themes']);

    watch(()=>props.options, ()=>{
      if (!wheel.value) {
        return;
      }
      wheel.value.updateOptions(props.options);
      wheel.value.draw();
    });

    watch(()=>props.currentTheme, ()=>{
      if (!wheel.value) {
        return;
      }
      wheel.value.setCurrentTheme(props.currentTheme);
    });

    watchOnce(()=>props.themes, ()=> {
        const resultModal = new Modal({startOpen: false, classes: []});
        resultModal.setHeaderText("Spinner Result");
        wheel.value = new Wheel( 'spinner-canvas', 400, props.options, resultModal);
        wheel.value.draw();
        wheel.value.setThemes(props.themes);
        setInterval(()=>wheel.value.draw(), 1);
    });

    onMounted(()=>{
      
    });
    

</script>

<template>
  <div class="canvas-outer-div">
    <canvas id="spinner-canvas" width="900" height="900"></canvas>
    {{currentTheme}}
  </div>
</template>

<style scoped>
  #spinner-canvas {
      display: block;
  }
</style>
