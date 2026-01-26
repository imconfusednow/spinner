<script setup>
import { ref, computed } from 'vue';
import { apiFetch } from '@/js/utils';
import { showToast } from '@/js/modals';
import { useSessionStore } from '@/stores/session.js';

const sessionStore = useSessionStore();

const data = ref({});

async function login() {
    try {
        const response = await apiFetch(`login`, 'POST', data.value);
        sessionStore.token = response.token;
        showToast('Login Successful');
    } catch (error) {
        showToast(error.message, 3000, ['error']);
    }

    spinnerStore.fetchThemes();
}

const formValid = computed(() => {
    return [data.value.username, data.value.password].every((entry) => {
        return entry;
    });
});
</script>

<template>
    <div class="outer-div">
        <div class="form-div">
            <h1>Login</h1>
            <div class="inputs-div">
                <div>
                    <input
                        v-model="data.username"
                        placeholder="Username"
                        required
                        autocomplete="username"
                    />
                </div>
                <div>
                    <input
                        v-model="data.password"
                        placeholder="Password"
                        type="password"
                        required
                        autocomplete="password"
                    />
                </div>
            </div>
            <div class="buttons-div">
                <button
                    class="btn btn-blue"
                    :disabled="!formValid"
                    @click="login"
                >
                    Login
                </button>
                <button class="btn btn-light" @click="$router.back">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
h1 {
    margin: auto;
    text-align: center;
}

.outer-div {
    padding: 1rem;
}

.form-div {
    max-width: 500px;
    margin: auto;
}

input,
select {
    border: none;
    padding: 0.8rem;
    width: 100%;
}

.inputs-div {
    display: grid;
    gap: 0.3rem;
    padding-block: 1rem;
}

.buttons-div {
    display: grid;
    gap: 5px;
    width: 100%;

    button {
        min-width: 100px;
    }
}

.spinner {
    max-width: 100%;
    max-height: 100%;
    margin: auto;
}
</style>
