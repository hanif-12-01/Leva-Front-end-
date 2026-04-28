<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useDocumentStore } from '../stores/documentStore'
import echo from '../services/echo'

const userStore = useUserStore()
const documentStore = useDocumentStore()
const fileInput = ref(null)

onMounted(() => {
    // Fetch initial tasks
    documentStore.fetchTasks()

    // Listen to websocket events on user's private channel
    if (userStore.user) {
        echo.private(`user.${userStore.user.id}`)
            .listen('PdfProcessed', (e) => {
                console.log('PDF Processed Event Received:', e);
                // Append new tasks directly from event or fetch them
                if (e.tasks) {
                    documentStore.addTasks(e.tasks);
                } else {
                    documentStore.fetchTasks();
                }
            });
    }
})

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        await documentStore.uploadPdf(file);
        // Reset input
        if (fileInput.value) fileInput.value.value = '';
    } catch (error) {
        alert("Gagal mengunggah dokumen.");
    }
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header glass-panel">
      <h1>Leva Dashboard</h1>
      <p>Workspace & Task Management</p>
      
      <div class="upload-section" style="margin-top: 1rem;">
          <input type="file" ref="fileInput" @change="handleFileUpload" accept="application/pdf" style="display: none" />
          <button class="btn-primary" @click="$refs.fileInput.click()" :disabled="documentStore.isUploading">
              {{ documentStore.isUploading ? 'Memproses PDF...' : 'Unggah Silabus PDF' }}
          </button>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="glass-panel task-list">
        <h3>Your Current Tasks</h3>
        <ul v-if="documentStore.tasks.length > 0">
            <li v-for="(task, index) in documentStore.tasks" :key="index">
                {{ task.title || task }}
            </li>
        </ul>
        <p v-else style="color: var(--text-secondary); margin-top: 1rem;">
            Belum ada tugas. Unggah dokumen untuk memecah tugas.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 16px;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.task-list {
  padding: 2rem;
  min-height: 400px;
}
</style>
