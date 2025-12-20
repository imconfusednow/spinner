<script setup>
    import SpinnerCanvas from '@/components/SpinnerCanvas.vue';
    import { useSpinnerStore } from '@/stores/spinner';
    import { ref, computed, watch } from 'vue';
    import { useFileDialog } from '@vueuse/core';

    const data = ref({});
    const spinnerStore = useSpinnerStore();

    spinnerStore.options = ["test", "test2"];

    const { files: imageFiles, open: openImage } = useFileDialog({accept: 'image/*'});
    const {  files: musicFiles, open: openMusic } = useFileDialog({accept: 'audio/*'});
    const {  files: endingFiles, open: openEnding } = useFileDialog({accept: 'audio/*'});

    const fileUrl = computed(() => {
        if (!musicFiles.value) {
            return '';
        }
        return URL.createObjectURL(musicFiles.value[0]);
    });

    const theme = computed(() => {
        return {
            "label": data.value.name,
            "value": 1,
            "music": fileUrl.value
        }
    });

    watch(data, ()=>{
        spinnerStore.currentTheme = theme.value;
    },
    { deep: true }
    );

</script>

<template>
    <div class="outer-div">
        {{ spinnerStore.currentTheme }}
        <div class="form-div">
            <div class="inputs-div">
                <div class="input-div">
                    <label>Name</label>
                    <input v-model="data.name" />
                </div>
                <div class="input-div">
                    <label>Image</label>
                    <button class="btn btn-blue" @click="openImage">Upload Image</button>
                </div>
                <div class="input-div">
                    <label>Music</label>
                    <button class="btn btn-blue" @click="openMusic">Upload Audio</button>
                </div>
                <div class="input-div">
                    <label>End Sound</label>
                    <button class="btn btn-blue" @click="openEnding">Upload Audio</button>
                </div>
                <div class="input-div">
                    <label>Animation</label>
                    <select v-model="data.animation">
                        <option value=""></option>
                    </select>
                </div>
                <div class="input-div">
                    <label>Colours</label>
                    <input v-model="data.colours" type="color" />
                </div>
            </div>
            <div class="buttons-div">
                <button class="btn btn-blue">Save</button>   
                <button class="btn btn-light" @click="$router.back">Back</button>
            </div>
        </div>
        <SpinnerCanvas :themes="[]" class="spinner" :captureSpace="false" />
    </div>
</template>

<style scoped>
    .outer-div {
        padding: 1rem;
    }

    .form-div {
        max-width: 1000px;
        margin: auto;
    }

    .buttons-div {
        margin-left: auto;
        width: fit-content;
        padding-block: 0.8rem;
        display: flex;
        gap: 5px;
        
        button {
            min-width: 100px;
        }
    }

    .inputs-div {
        display: grid;
        grid-template-columns: auto 1fr;        
        gap: 0.8rem;       
    }

    .spinner {
        max-width: 100%;
        max-height: 100%;
        margin: auto;
    }


</style>
