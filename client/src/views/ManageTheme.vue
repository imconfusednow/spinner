<script setup>
import { useSpinnerStore } from '@/stores/spinner';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFileDialog } from '@vueuse/core';
import { apiFetch, createFormData } from '@/js/utils';
import { COLOURS } from '@/js/constants';
import { showToast } from '@/js/modals';
import SpinnerCanvas from '@/components/SpinnerCanvas.vue';
import ColourPicker from '@/components/ColourPicker.vue';

const data = ref({
    name: '',
    animation: null,
    colours: [],
});
const spinnerStore = useSpinnerStore();
const router = useRouter();
const animations = ref([]);

const {
    files: imageFiles,
    open: openImage,
    reset: resetImage,
} = useFileDialog({
    accept: 'image/*',
    multiple: false,
});
const {
    files: musicFiles,
    open: openMusic,
    reset: resetMusic,
} = useFileDialog({
    accept: 'audio/*',
    multiple: false,
});
const {
    files: endingFiles,
    open: openEnding,
    reset: resetEnding,
} = useFileDialog({
    accept: 'audio/*',
    multiple: false,
});

function validateFile(file, allowedType, resetFunc) {
    if (!file) {
        return;
    }
    if (file.type.startsWith(allowedType)) {
        return;
    }
    showToast(`Invalid File, must be of type: ${allowedType}`, 5000, ['error']);
    resetFunc();
}

async function getAnimations() {
    const response = await apiFetch('animations');
    animations.value = response;
}

async function save() {
    try {
        const formData = createFormData(payload.value);

        const response = await apiFetch(
            'themes',
            'POST',
            formData,
            'multipart/form-data',
        );
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

const imageFile = computed(() => {
    if (!imageFiles.value) {
        return null;
    }
    return imageFiles.value[0];
});

const musicFile = computed(() => {
    if (!musicFiles.value) {
        return null;
    }
    return musicFiles.value[0];
});

const endingFile = computed(() => {
    if (!endingFiles.value) {
        return null;
    }
    return endingFiles.value[0];
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
        colours: data.value.colours.length ? data.value.colours : COLOURS,
    };
});

const payload = computed(() => {
    return {
        name: data.value.name,
        animation_id: data.value.animation?.id,
        colours: data.value.colours.join(','),
        image_file: imageFile.value,
        music_file: musicFile.value,
        ending_file: endingFile.value,
    };
});

const options = computed(() => {
    return [
        'The',
        'Spinner',
        'Options',
        'For',
        'Your',
        'Theme',
        'Called',
        data.value.name,
    ];
});

const formValid = computed(() => {
    return [
        data.value.name,
        imageFile.value,
        musicFile.value,
        endingFile.value,
    ].every((entry) => {
        return entry;
    });
});

watch(
    theme,
    () => {
        spinnerStore.currentTheme = theme.value;
    },
    { deep: true },
);

function watchFiles(filesRef, validType, resetFunc) {
    watch(filesRef, (files) => {
        if (!files?.length) return;

        validateFile(files[0], validType, resetFunc);
    });
}

watchFiles(imageFiles, 'image', resetImage);
watchFiles(musicFiles, 'audio', resetMusic);
watchFiles(endingFiles, 'audio', resetEnding);

getAnimations();
</script>

<template>
    <div class="outer-div">
        <div class="form-div">
            <div class="inputs-div">
                <div class="input-div">
                    <label>Name *</label>
                    <input v-model="data.name" />
                </div>
                <div class="input-div">
                    <label>Image *</label>
                    <button
                        class="btn btn-blue"
                        :class="{ 'btn-green': imageFile }"
                        @click="openImage"
                    >
                        {{ imageFile?.name || 'Upload Image' }}
                    </button>
                </div>
                <div class="input-div">
                    <label>Music *</label>
                    <button
                        class="btn btn-blue"
                        :class="{ 'btn-green': musicFile }"
                        @click="openMusic"
                    >
                        {{ musicFile?.name || 'Upload Audio' }}
                    </button>
                </div>
                <div class="input-div">
                    <label>End Sound *</label>
                    <button
                        class="btn btn-blue"
                        :class="{ 'btn-green': endingFile }"
                        @click="openEnding"
                    >
                        {{ endingFile?.name || 'Upload Audio' }}
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
                    <ColourPicker v-model="data.colours" />
                </div>
            </div>
            <div class="buttons-div">
                <button
                    class="btn btn-blue"
                    :disabled="!formValid"
                    @click="save"
                >
                    Submit
                </button>
                <button class="btn btn-light" @click="$router.back">
                    Back
                </button>
            </div>
        </div>
        <SpinnerCanvas
            class="spinner"
            :capture-space="false"
            :local-options="options"
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
