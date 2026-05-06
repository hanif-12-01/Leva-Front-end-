import { defineStore } from 'pinia'
import api from '../services/api'
import {
    DUMMY_TOKEN,
    clearDummyData,
    getDummyUser,
    isDummyLogin,
    isDummyToken,
    saveDummyUser,
} from '../services/dummyData'

const normalizeUser = (payload) => {
    const user = payload?.user || payload
    if (!user) return null

    const profile = user.profile || {}
    return {
        ...user,
        major: user.major ?? profile.major ?? '',
        semester: user.semester ?? profile.semester ?? '',
        language_preference: user.language_preference ?? profile.language_preference ?? 'Indonesian',
        learning_style: user.learning_style ?? profile.learning_style ?? '',
        is_onboarded: Boolean(user.is_onboarded ?? user.profile ?? user.status === 'ACTIVE'),
    }
}

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        token: localStorage.getItem('auth_token') || null,
        isProfileLoaded: false,
    }),
    actions: {
        async login(email, password) {
            if (isDummyLogin(email, password)) {
                const dummyUser = getDummyUser()

                this.token = DUMMY_TOKEN
                this.user = dummyUser
                this.isProfileLoaded = true
                localStorage.setItem('auth_token', this.token)
                saveDummyUser(dummyUser)
                return true
            }

            try {
                const response = await api.post('/login', { email, password });
                this.token = response.data.data.token;
                this.user = normalizeUser(response.data.data.user);
                this.isProfileLoaded = true;
                localStorage.setItem('auth_token', this.token);
                return true;
            } catch (error) {
                console.error("Login failed", error);
                throw error;
            }
        },
        async fetchProfile() {
            if (!this.token) return null;

            if (isDummyToken(this.token)) {
                this.user = getDummyUser()
                this.isProfileLoaded = true
                return this.user
            }

            try {
                const response = await api.get('/me');
                this.user = normalizeUser(response.data.data);
                this.isProfileLoaded = true;
                return this.user;
            } catch (error) {
                console.error("Failed to fetch profile", error);
                this.logout();
                throw error;
            }
        },
        async submitOnboarding(data) {
            if (isDummyToken(this.token)) {
                this.user = {
                    ...getDummyUser(),
                    ...data,
                    is_onboarded: true,
                }
                this.isProfileLoaded = true
                saveDummyUser(this.user)
                return { data: this.user }
            }

            try {
                const response = await api.post('/onboarding', data);
                const updatedUser = normalizeUser(response.data.data);
                this.user = updatedUser || { ...this.user, ...data, is_onboarded: true };
                return response.data;
            } catch (error) {
                console.error("Onboarding failed", error);
                throw error;
            }
        },
        logout() {
            this.user = null;
            this.token = null;
            this.isProfileLoaded = false;
            localStorage.removeItem('auth_token');
            clearDummyData();
        }
    }
})
