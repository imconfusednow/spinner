<script setup>
import { ref, computed } from 'vue';
</script>

<template>
    <div class="outer-div">
        <h1>Animation Creator</h1>
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
