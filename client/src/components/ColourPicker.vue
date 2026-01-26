<script setup>
const props = defineProps({});
const colours = defineModel({ type: Array });
const emit = defineEmits(['change']);

function addColour(event) {
    colours.value.push(event.target.value);
}

function changeColour() {
    colours.value[colours.value.length - 1] = event.target.value;
}

function removeColour(index) {
    colours.value.splice(index, 1);
}
</script>

<template>
    <div class="container">
        <input type="color" @click="addColour" @input="changeColour" />
        <div
            v-for="(colour, index) in colours"
            :key="index"
            :style="`background-color: ${colour}`"
            class="colour-block"
            @click="removeColour(index)"
        ></div>
    </div>
</template>

<style scoped>
input[type='color'] {
    padding: 5px;
    height: 50px;
    width: 70px;
    border-radius: 5px;
}

.container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.colour-block {
    padding: 1rem;
    border-radius: 3px;

    &:hover {
        cursor: pointer;
        filter: brightness(0.8);
    }
}
</style>
