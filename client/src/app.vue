<script setup>
import SideMenu from '@/components/SideMenu.vue';
</script>


<template>
  <div class="outer-outer-div">
      <SideMenu />
      <RouterView class="router-view" />
  </div>
</template>

<style scoped>
  .outer-outer-div {
    height: 100vh;
    padding: 0.6rem;
    display: inline-flex;
    width: 100%;
    grid-template-columns: auto 1fr;
  }

  .router-view {
    flex: 1;
  }
</style>