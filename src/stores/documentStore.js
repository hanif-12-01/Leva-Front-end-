import { defineStore } from 'pinia';
import api from '../services/api';

export const useDocumentStore = defineStore('document', {
    state: () => ({
        isUploading: false,
        tasks: [],
    }),
    actions: {
        async uploadPdf(file) {
            this.isUploading = true;
            const formData = new FormData();
            formData.append('document', file);

            try {
                // The backend responds immediately (202 Accepted) and processes in background
                const response = await api.post('/documents/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return response.data;
            } catch (error) {
                this.isUploading = false;
                console.error("Failed to upload document", error);
                throw error;
            }
        },
        addTasks(newTasks) {
            this.tasks = [...this.tasks, ...newTasks];
            this.isUploading = false; // Reset uploading state since tasks are received
        },
        async fetchTasks() {
            try {
                const response = await api.get('/tasks');
                this.tasks = response.data.data;
            } catch (error) {
                console.error("Failed to fetch tasks", error);
                throw error;
            }
        }
    }
});
