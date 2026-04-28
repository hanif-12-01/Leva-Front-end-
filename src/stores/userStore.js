import { defineStore } from 'pinia'
import api from '../services/api'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        token: localStorage.getItem('auth_token') || null,
    }),
    actions: {
        async login(email, password) {
            try {
                const response = await api.post('/login', { email, password });
                this.token = response.data.data.token;
                this.user = response.data.data.user;
                localStorage.setItem('auth_token', this.token);
                return true;
            } catch (error) {
                console.error("Login failed", error);
                throw error;
            }
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('auth_token');
        }
    }
})
