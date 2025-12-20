<script setup>
import { ref, computed } from 'vue';
import { fuzzyMatch } from '@/js/utils';
import { DateTime } from 'luxon';
import { useSpinnerStore } from '@/stores/spinner';

const spinnerStore = useSpinnerStore();
const search = ref('');

const filteredThemes = computed(() => {
    return spinnerStore.themes.filter((theme) => {
        if (theme.label === 'Random') {
            return false;
        }
        return fuzzyMatch(theme.label, search.value);
    });
});
</script>

<template>
    <div class="outer-div">
        <h1>Theme Management</h1>
        <div class="filter-div">
            <div class="input-div">
                <input placeholder="Name Search" v-model="search" />
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
                    <th scope="col">Animation</th>
                    <th scope="col">Created</th>
                    <th scope="col" class="skinny">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="theme in filteredThemes">
                    <td>{{ theme.label }}</td>
                    <td><img :src="`${theme.image}`" /></td>
                    <td><audio controls :src="`${theme.music}`"></audio></td>
                    <td><audio controls :src="`${theme.ending}`"></audio></td>
                    <td>{{ theme.animation }}</td>
                    <td>
                        {{
                            DateTime.fromSQL(theme.created_at).toLocaleString()
                        }}
                    </td>
                    <td class="skinny">
                        <button class="btn btn-red">Delete</button>
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

    .skinny {
        width: 0;
    }

    img {
        max-width: 50px;
    }

    audio {
        max-width: 100%;
    }
}

.input-div {
    flex: 1;
}

.filter-div {
    display: flex;
    gap: 2rem;
    padding-block: 1rem;
}
</style>
