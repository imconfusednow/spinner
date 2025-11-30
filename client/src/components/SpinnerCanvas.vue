<script setup>
    import { ref, watch, useTemplateRef  } from 'vue';
    import { Wheel } from '@/js/wheel';
    import { Modal } from '@/js/modals';
    import { watchOnce, onKeyStroke } from '@vueuse/core';
    import { Canvas } from "@/js/canvas.js";
    import {startAnimationLoop} from "@/js/utils.js";
    import { useSpinnerStore } from '@/stores/spinner';

    const spinnerStore = useSpinnerStore();
        

    let wheel = ref();
    const props = defineProps(['options', 'currentTheme', 'themes']);

    const outerDiv = useTemplateRef('outer-div');   
    

    onKeyStroke(' ', (e) => {
      e.preventDefault();
      wheel.value.start();
    }, {target: outerDiv});


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
        wheel.value = new Wheel(canvas, props.options, resultModal, spinnerStore);        
        wheel.value.setThemes(props.themes);
        startAnimationLoop(()=>wheel.value.draw());
    });


</script>

<template>
  <div class="canvas-outer-div" ref="outer-div" tabindex="2">
    <canvas id="spinner-canvas" >Couldn't load canvas</canvas>
  </div>
</template>

<style scoped>
  .canvas-outer-div {
      &:focus-visible {
        outline: none;
      }
  }

  #spinner-canvas {
      display: block;
      width: 100%;
      height: 100vh;      
  }
</style>
