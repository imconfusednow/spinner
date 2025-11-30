import { defineStore } from "pinia";
import { ref } from 'vue';

export const useSpinnerStore = defineStore('spinner', () => {
  const spinning = ref(true);

  return { spinning };
});