<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { DUMMY_CREDENTIALS } from '../services/dummyData'
import { useUserStore } from '../stores/userStore'
import { isValidEmail } from '../utils/validation'

const router = useRouter()
const userStore = useUserStore()

const email = ref(DUMMY_CREDENTIALS.email)
const password = ref(DUMMY_CREDENTIALS.password)
const isLoading = ref(false)
const errorMessage = ref('')

watch([email, password], () => {
  errorMessage.value = ''
})

const handleLogin = async () => {
  if (isLoading.value) return

  errorMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Email dan password wajib diisi.'
    return
  }

  if (!isValidEmail(email.value)) {
    errorMessage.value = 'Format email tidak valid.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password harus minimal 8 karakter.'
    return
  }

  isLoading.value = true

  try {
    await userStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = 'Email atau password salah.'
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal terhubung ke server. Untuk demo, gunakan kredensial dummy di bawah.'
    }
  } finally {
    isLoading.value = false
  }
}

const useDummyCredential = () => {
  email.value = DUMMY_CREDENTIALS.email
  password.value = DUMMY_CREDENTIALS.password
}
</script>

<template>
  <div class="auth-page">
    <div class="card auth-card">
      <div class="brand-block">
        <div class="brand-icon"><AppIcon name="sparkles" :size="30" /></div>
        <span>Leva</span>
        <p>Your Cognitive Lever for Academic Excellence</p>
        <strong>Asisten Akademik Cerdasmu</strong>
      </div>

      <div class="step-dots" aria-hidden="true">
        <span class="active"></span>
        <span></span>
        <span></span>
      </div>

      <h1>Masuk ke Leva</h1>
      <p class="lead">Lanjutkan ke workspace akademikmu dan mulai pecah tugas jadi langkah kecil.</p>

      <div v-if="errorMessage" class="field-error-message" role="alert">
        <AppIcon name="warning" :size="12" color="#DC2626" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin">
        <label>
          Email
          <input v-model="email" type="email" autocomplete="email" placeholder="admin@example.com" :disabled="isLoading" />
        </label>

        <label>
          Password
          <input v-model="password" type="password" autocomplete="current-password" placeholder="password" :disabled="isLoading" />
        </label>

        <button class="btn-primary submit-button" type="submit" :disabled="isLoading">
          <span>
            {{ isLoading ? 'Memproses...' : 'Masuk ke Dashboard' }}
            <AppIcon v-if="!isLoading" name="arrow-right" :size="14" color="#fff" />
          </span>
        </button>
      </form>

      <div class="divider">
        <span></span>
        <p>demo account</p>
        <span></span>
      </div>

      <button class="dummy-card" type="button" @click="useDummyCredential">
        <AppIcon name="user" :size="16" />
        <span>
          <strong>{{ DUMMY_CREDENTIALS.email }}</strong>
          <small>Password: {{ DUMMY_CREDENTIALS.password }}</small>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6C63FF 0%, #8B5CF6 50%, #A78BFA 100%);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  padding: 36px;
}

.brand-block {
  text-align: center;
  margin-bottom: 26px;
}

.brand-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
}

.brand-block > span {
  display: block;
  color: var(--color-primary);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.brand-block p {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.brand-block strong {
  display: block;
  margin-top: 3px;
  color: #4B5563;
  font-size: 13px;
}

.step-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.step-dots span {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: var(--color-border);
}

.step-dots .active {
  width: 24px;
  background: var(--color-primary);
}

h1 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
}

.lead {
  margin: 0 0 24px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

label {
  display: block;
  margin-bottom: 14px;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
}

input {
  width: 100%;
  margin-top: 6px;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  transition: border 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(196, 181, 253, 0.55);
  outline: none;
}

.submit-button {
  width: 100%;
  padding: 13px;
  margin-top: 6px;
}

.submit-button span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 12px;
}

.divider span {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.divider p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.dummy-card {
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  background: #fff;
  color: #374151;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.dummy-card span {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.dummy-card small {
  color: var(--color-text-secondary);
}
</style>
