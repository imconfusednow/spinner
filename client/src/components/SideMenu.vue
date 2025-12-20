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
        <button class="btn btn-light" @click="show = !show"><img src="/images/menu.svg" class="menu-icon"></img></button>
        <Transition>
            <div id="inner-div" v-show="show">
                <div class="close">
                    <button @click="show = false">×</button>
                </div>
                <div class="links-div">
                    <RouterLink to="/">Spinner</RouterLink>
                    <RouterLink to="/themes">Manage Themes</RouterLink>
                    <RouterLink to="/animations">Manage Animations</RouterLink>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
button {
    display: inline-block;
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
    display: flex;
    flex-direction: column;

    a {
        display: flex;
        align-items: center;
        padding: 1rem;
        color: #b9b9b9;
        font-size: 1.5rem;

        &:hover {
            color: white;
        }

        &.router-link-active {
            background: #535353;
        }
    }
}

.close {
    display: flex;
    width: 100%;
    justify-content: right;
    padding: 1rem;

    button {
        float: right;
        font-size: 2rem;
        background: none;
        border: none;
        color: white;
    }
    
}

#outer-div {
    z-index: 1000;
    position: relative;
    color: white;
}

#inner-div {
    position: fixed;
    background: #1c1b1b;
    top: 0;
    bottom: 0;
    left: 0;
    min-width: 300px;
    transition: all 0.2s;
    filter: drop-shadow(10px 0 10px black);
    shadow

    &.v-enter-from {
        opacity: 0;
        translate: -100px 0;
    }
    &.v-enter-to {
        opacity: 1;
        translate: 0 0;
    }
    &.v-leave-from {
        opacity: 1;
        translate: 0 0;
    }
    &.v-leave-to {
        opacity: 0;
        translate: -100px 0;
    }
}

</style>
