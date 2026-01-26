import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import ThemesView from '@/views/ThemesView.vue';
import ManageTheme from '@/views/ManageTheme.vue';
import AnimationsView from '@/views/AnimationsView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/themes',
            name: 'themes',
            component: ThemesView,
        },
        {
            path: '/themes/:id/edit',
            name: 'edit-theme',
            component: ManageTheme,
        },
        {
            path: '/themes/new',
            name: 'new-theme',
            component: ManageTheme,
        },
        {
            path: '/animations',
            name: 'animations',
            component: AnimationsView,
        },
    ],
});

export default router;
