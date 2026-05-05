<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { isValidEmail } from '../utils/validation'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

watch([email, password], () => {
  errorMessage.value = ''
})

const handleLogin = async () => {
  if (isLoading.value) return

  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
  errorMessage.value = "Email dan password wajib diisi."
  return
}

  if (!isValidEmail(email.value)) {
    errorMessage.value = "Format email tidak valid (contoh: budi@student.com)."
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = "Password harus minimal 8 karakter."
    return
  }

  isLoading.value = true

  try {
    // Memanggil fungsi login dari Pinia store
    await userStore.login(email.value, password.value)
    successMessage.value = 'Login berhasil! Mengalihkan...'
    
    // Alihkan user ke Dashboard (atau onboarding sesuai flow base idea)
    setTimeout(() => {
      router.push('/')
    }, 1500)
    
  } catch (error) {
    // Menerjemahkan error backend jadi User-Friendly (Tugas Kamis - Hanif)
    if (error.response) {
       const status = error.response.status;
       if (status === 400) {
         errorMessage.value = "Data tidak valid. Periksa kembali form anda.";
       } else if (status === 401) {
         errorMessage.value = "Email atau password yang anda masukkan salah.";
       } else if (status === 500) {
         errorMessage.value = "Sedang terjadi gangguan pada server. Coba lagi nanti.";
       } else {
         errorMessage.value = error.response.data.message || 'Terjadi kesalahan sistem.';
       }
    } else {
       errorMessage.value = "Gagal terhubung ke server. Periksa koneksi internet Anda."
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="glass-panel login-card">
      <h2>Welcome to Leva</h2>
      <p class="subtitle">Your Academic Workspace</p>

      <!-- Menampilkan Pesan Error / Sukses -->
      <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert success">{{ successMessage }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" v-model="email" placeholder="student@example.com" required :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" placeholder="••••••••" required minlength="8" :disabled="isLoading" />
        </div>
        <button type="submit" class="btn-primary" :disabled="isLoading" :style="isLoading ? 'cursor: not-allowed; opacity: 0.7;' : ''">
          {{ isLoading ? '⏳ Memproses...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  text-align: center;
}

h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

form {
  text-align: left;
}

/* Base Alert styles */
.alert {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.success {
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
