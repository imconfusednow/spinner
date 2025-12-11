import { defineStore } from "pinia";
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';

export const useSpinnerStore = defineStore('spinner', () => {
  const spinning = ref(false);
  const options = useStorage('spinner-options', []);
  const currentTheme = ref({});

  return { spinning, options, currentTheme };
});