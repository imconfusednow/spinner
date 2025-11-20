<script setup>
    import { ref, onMounted, watch } from 'vue'
    import { Wheel } from '@/js/wheel';
    import { Modal } from '@/js/modals';
    import { watchOnce } from '@vueuse/core';
    import { Canvas } from "@/js/canvas.js";
    import {startAnimationLoop} from "@/js/utils.js";

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
        const canvas = new Canvas('spinner-canvas');
        wheel.value = new Wheel(canvas, 400, props.options, resultModal);        
        wheel.value.setThemes(props.themes);
        startAnimationLoop(()=>wheel.value.draw());
    });

    onMounted(()=>{
      
    });
    

</script>

<template>
  <div class="canvas-outer-div">
    <canvas id="spinner-canvas"></canvas>
  </div>
</template>

<style scoped>
  #spinner-canvas {
      display: block;
      width: 100%;
      min-height: 900px;
  }
</style>
