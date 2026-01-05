<script setup>
import SpinnerCanvas from '@/components/SpinnerCanvas.vue';
import { useSpinnerStore } from '@/stores/spinner';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFileDialog } from '@vueuse/core';
import { apiFetch } from '@/js/utils';
import { showToast } from '@/js/modals';

const data = ref({
    name: '',
    music: 'bing.mp3',
    animation: null,
    ending: 'bing_end.mp3',
    image: 'bing.png',
});
const spinnerStore = useSpinnerStore();
const router = useRouter();
const animations = ref([]);

spinnerStore.options = ['test', 'test2'];

const { files: imageFiles, open: openImage } = useFileDialog({
    accept: 'image/*',
});
const { files: musicFiles, open: openMusic } = useFileDialog({
    accept: 'audio/*',
});
const { files: endingFiles, open: openEnding } = useFileDialog({
    accept: 'audio/*',
});

async function getAnimations() {
    const response = await apiFetch('animations');
    animations.value = response;
}

async function save() {
    try {
        const response = await apiFetch('themes', 'POST', payload.value);
        showToast(response.message);
        router.push('/themes');
    } catch (error) {
        showToast(error.message, 3000, ['error']);
    }
}

function getUrl(files) {
    if (!files.value) {
        return '';
    }
    return URL.createObjectURL(files.value[0]);
}

function getFile(files) {
    if (!files.value) {
        return null;
    }
    return files.value[0];
}

const imageFile = computed(() => {
    if (!imageFiles.value) {
        return null;
    }
    return imageFiles.value[0];
});

const imageUrl = computed(() => {
    return getUrl(imageFiles);
});

const musicUrl = computed(() => {
    return getUrl(musicFiles);
});

const endingUrl = computed(() => {
    return getUrl(endingFiles);
});

const theme = computed(() => {
    return {
        label: data.value.name,
        value: 1,
        music: musicUrl.value,
        image: imageUrl.value,
        ending: endingUrl.value,
        animation: data.value.animation?.name,
    };
});

const payload = computed(() => {
    return {
        name: data.value.name,
        music_file: getFile(musicFiles),
        image_file: getFile(imageFiles),
        ending_file: getFile(endingFiles),
        animation_id: data.value.animation?.id,
    };
});

watch(
    theme,
    () => {
        spinnerStore.currentTheme = theme.value;
    },
    { deep: true },
);

getAnimations();
</script>

<template>
    <div class="outer-div">
        {{ payload }}
        <div class="form-div">
            <div class="inputs-div">
                <div class="input-div">
                    <label>Name</label>
                    <input v-model="data.name" />
                </div>
                <div class="input-div">
                    <label>Image</label>
                    <button class="btn btn-blue" @click="openImage">
                        Upload Image
                    </button>
                </div>
                <div class="input-div">
                    <label>Music</label>
                    <button class="btn btn-blue" @click="openMusic">
                        Upload Audio
                    </button>
                </div>
                <div class="input-div">
                    <label>End Sound</label>
                    <button class="btn btn-blue" @click="openEnding">
                        Upload Audio
                    </button>
                </div>
                <div class="input-div">
                    <label>Animation</label>
                    <select v-model="data.animation">
                        <option value="null">None</option>
                        <option
                            v-for="anim in animations"
                            :key="anim.id"
                            :value="anim"
                        >
                            {{ anim.name }}
                        </option>
                    </select>
                </div>
                <div class="input-div">
                    <label>Colours</label>
                    <input v-model="data.colours" type="color" />
                </div>
            </div>
            <div class="buttons-div">
                <button class="btn btn-blue" @click="save">Save</button>
                <button class="btn btn-light" @click="$router.back">
                    Back
                </button>
            </div>
        </div>
        <SpinnerCanvas
            v-if="data.name"
            :themes="[]"
            class="spinner"
            :capture-space="false"
        />
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
