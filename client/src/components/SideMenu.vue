<script setup>
import { onClickOutside } from '@vueuse/core';
import { useTemplateRef, ref } from 'vue';
import { RouterLink } from 'vue-router';

const show = ref(false);

const outerDiv = useTemplateRef('outer-div');


onClickOutside( outerDiv, (event) => {
    show.value = false;
});

</script>

<template>
    <div id="outer-div" ref="outer-div">
        <button class="btn btn-light" @click="show = !show"><img src="/images/menu.svg" class="menu-icon" ></img></button>
        <div id="inner-div" v-show="false">
            <button class="btn btn-light" @click="show = !show"><img src="/images/menu.svg" class="menu-icon" ></img></button>
            <div class="links-div">
                <RouterLink to="/themes">Themes</RouterLink>
                <RouterLink to="/animations">Animations</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
button {
    &:hover {
        filter: brightness(0.8);
        cursor: pointer;
    }
}

.menu-icon {
    width: 2rem;
    z-index: 10;
}

.links-div {
    margin-block: 2rem;
    display: grid;
    gap: 1rem;
}

#outer-div {
    position: fixed;
}

#inner-div {
    position: fixed;
    background: black;
    top: 0;
    bottom: 0;
    left: 0;
    min-width: 100px;
    padding: 1rem;
}

</style>
