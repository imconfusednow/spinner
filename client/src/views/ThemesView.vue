<script setup>
import { ref, computed } from 'vue';
import { fuzzyMatch, apiFetch } from '@/js/utils';
import { DateTime } from 'luxon';
import { useSpinnerStore } from '@/stores/spinner';
import { showToast } from '@/js/modals';

const spinnerStore = useSpinnerStore();
const search = ref('');

async function deleteTheme(themeId) {
    try {
        const response = await apiFetch(`themes/${themeId}`, 'DELETE');
        showToast(response.message);
    } catch (error) {
        showToast(error.message, 3000, ['error']);
    }

    spinnerStore.fetchThemes();
}

const filteredThemes = computed(() => {
    return spinnerStore.themes.filter((theme) => {
        if (theme.label === 'Random') {
            return false;
        }
        return fuzzyMatch(theme.label, search.value);
    });
});

spinnerStore.fetchThemes();
</script>

<template>
    <div class="outer-div">
        <h1>Theme Management</h1>
        <div class="filter-div">
            Showing {{ filteredThemes.length }} of
            {{ spinnerStore.themes.length - 1 }} Themes
            <div class="input-div">
                <input v-model="search" placeholder="Name Search" />
            </div>
            <button class="btn btn-green" @click="$router.push('/themes/new')">
                New Theme +
            </button>
        </div>
        <table class="themes">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Image</th>
                    <th scope="col">Music</th>
                    <th scope="col">End Sound</th>
                    <th scope="col">Colours</th>
                    <th scope="col">Animation</th>
                    <th scope="col">Creator</th>
                    <th scope="col">Created</th>
                    <th scope="col" class="skinny">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="theme in filteredThemes"
                    :key="theme.value"
                    :class="{ 'hidden-theme': theme.hidden }"
                >
                    <td>{{ theme.label }}</td>
                    <td><img :src="`${theme.image}`" /></td>
                    <td class="wide">
                        <audio controls :src="`${theme.music}`"></audio>
                    </td>
                    <td class="wide">
                        <audio controls :src="`${theme.ending}`"></audio>
                    </td>
                    <td>
                        <div class="col-block-wrapper">
                            <div
                                v-for="(col, index) in theme.colours"
                                :key="index"
                                class="col-block"
                                :style="{ backgroundColor: col }"
                            ></div>
                        </div>
                    </td>
                    <td>{{ theme.animation }}</td>
                    <td>{{ theme.creator }}</td>
                    <td>
                        {{
                            DateTime.fromSQL(theme.created_at).toLocaleString()
                        }}
                    </td>
                    <td class="skinny">
                        <div class="actions-div">
                            <button
                                class="btn btn-red"
                                @click="deleteTheme(theme.id)"
                            >
                                Delete
                            </button>
                            <button
                                class="btn btn-dark"
                                @click="hideTheme(theme.id)"
                            >
                                <span v-if="theme.hidden">Unhide</span>
                                <span v-else>Hide</span>
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.outer-div {
    padding-inline: 2rem;

    h1 {
        font-size: 3rem;
        margin: 0;
    }
}

.themes {
    width: 100%;
    border-collapse: collapse;
    margin: auto;

    th,
    td {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 1px solid #eee;
    }

    tr.hidden-theme {
        filter: brightness(0.3);
    }

    .skinny {
        width: 0;
    }

    .wide {
        width: 400px;
    }

    .col-block-wrapper {
        display: flex;
        gap: 0.3rem;
    }

    .col-block {
        padding: 1rem;
        border-radius: 5px;
    }

    img {
        max-width: 50px;
    }

    audio {
        width: 100%;
    }
}

.input-div {
    flex: 1;
}

.filter-div {
    display: flex;
    gap: 2rem;
    padding-block: 1rem;
    align-items: center;
}

.actions-div {
    display: grid;
    gap: 2px;
}
</style>
