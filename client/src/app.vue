<script setup>
import SideMenu from '@/components/SideMenu.vue';
</script>


<template>
  <div class="outer-div">
    <!-- <SideMenu /> -->
    <RouterView />
  </div>
</template>

<style scoped>
  .outer-div {
    padding: 0.6rem;
  }
</style>