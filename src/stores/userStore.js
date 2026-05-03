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
                this.user = response.data.data.user;
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
                this.user = response.data.data;
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
                // Update user data locally with the new onboarding info
                if (this.user) {
                    this.user.is_onboarded = true;
                    Object.assign(this.user, data);
                }
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
