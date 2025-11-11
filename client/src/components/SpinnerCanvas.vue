<script setup>
    import { ref, onMounted, watchEffect } from 'vue'
    import { Wheel } from '@/js/wheel';
    import { Modal } from '@/js/modals';

    let wheel = ref();;
    const props = defineProps(['options']);

    watchEffect(()=>{
      if (!wheel.value) {
        return;
      }
      wheel.value.updateOptions(props.options);
      wheel.value.draw();
    });

    onMounted(()=>{
      const resultModal = new Modal({startOpen: false, classes: []});
      resultModal.setHeaderText("Spinner Result");
      wheel.value = new Wheel('spinner-canvas', 400, props.options, resultModal);
      wheel.value.draw();
    });
    

</script>

<template>
  <div class="canvas-outer-div">
    <canvas id="spinner-canvas" width="900" height="900"></canvas>
    {{ options }}
  </div>
</template>

<style scoped>
#spinner-canvas {
    display: block;
}

</style>
