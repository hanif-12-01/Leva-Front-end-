import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/onboarding',
            name: 'onboarding',
            component: () => import('../views/OnboardingView.vue')
        },
        {
            path: '/',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue')
        }
    ]
})

export default router
