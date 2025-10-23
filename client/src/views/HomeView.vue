<script setup>
    import { ref } from 'vue';

    const themes = ref([]);

    async function getThemes() {
        const url = "http://localhost:80/api/themes";
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            themes.value = result;
        } catch (error) {
            console.error(error.message);
        }
    }

    getThemes();
</script>

<template>
  <span id="debug-text"></span>
  <div class="two-cols">
      <div class="spinner-div">
          <select id="theme-select">
              <option selected>Select Theme</option>
              <option v-for="(theme, i) in themes" :value="i">{{ theme.name }}</option>
          </select>
          <a id="manage-themes-link" href="/themes">Manage Themes</a>
          <canvas id="spinner-canvas" width="900" height="900"></canvas>
          <canvas id="test-canvas" width="900" height="900"></canvas>
      </div>
      <div class="options-div">
          <textarea id="options-input"></textarea>
          <button id="update-options-button" class="btn">Update</button>
      </div>
  </div>
</template>

<style scoped>
  .spinner-div {
    position: relative;
}

.options-div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: start;
    padding: 1rem;
    flex-grow: 1;
}

#spinner-canvas {
    display: block;
}


#update-options-button {
    font-size: 1rem;
    background-color: #004774;
}

#theme-select {
    background-color: #405c79;
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 5px;
    width: 50%;
    max-width: 250px;
    font-size: 1.2rem;

    &.error {
        background: orange;
    }
}

#manage-themes-link {
    
}
</style>
