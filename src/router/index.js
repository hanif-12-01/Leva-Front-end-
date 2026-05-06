import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { requiresGuest: true }
        },
        {
            path: '/onboarding',
            name: 'onboarding',
            component: () => import('../views/OnboardingView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('../views/ChatWorkspaceView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/library',
            name: 'library',
            component: () => import('../views/LibraryView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/ProfileView.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach(async (to, from) => {
    const userStore = useUserStore()
    
    // Check if token exists but profile isn't loaded yet
    if (userStore.token && !userStore.isProfileLoaded) {
        try {
            await userStore.fetchProfile()
        } catch (e) {
            // Profile fetch failed (e.g. token expired), user is logged out automatically by the store
        }
    }

    const isAuthenticated = !!userStore.token;
    const user = userStore.user;

    if (to.meta.requiresAuth && !isAuthenticated) {
        return { name: 'login' };
    } else if (to.meta.requiresGuest && isAuthenticated) {
        return { name: 'dashboard' };
    } else if (isAuthenticated && user && !user.is_onboarded && to.name !== 'onboarding') {
        // If authenticated but not onboarded, force them to onboarding
        return { name: 'onboarding' };
    } else if (isAuthenticated && user && user.is_onboarded && to.name === 'onboarding') {
        // If already onboarded, don't let them access onboarding again
        return { name: 'dashboard' };
    }
})

export default router
