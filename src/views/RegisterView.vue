<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { useUserStore } from '../stores/userStore'
import { isValidEmail } from '../utils/validation'

const router = useRouter()
const userStore = useUserStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const canSubmit = computed(() => (
  name.value.trim()
  && email.value.trim()
  && password.value
  && passwordConfirmation.value
  && !isLoading.value
))

watch([name, email, password, passwordConfirmation], () => {
  errorMessage.value = ''
})

const validationMessage = () => {
  if (!name.value.trim()) return 'Nama lengkap wajib diisi.'
  if (name.value.trim().length < 2) return 'Nama minimal 2 karakter.'
  if (!email.value.trim()) return 'Email wajib diisi.'
  if (!isValidEmail(email.value)) return 'Format email tidak valid.'
  if (password.value.length < 8) return 'Password harus minimal 8 karakter.'
  if (password.value !== passwordConfirmation.value) return 'Konfirmasi password belum sama.'
  return ''
}

const handleRegister = async () => {
  if (isLoading.value) return

  const message = validationMessage()
  if (message) {
    errorMessage.value = message
    return
  }

  isLoading.value = true

  try {
    await userStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    })
    router.push({ name: 'onboarding' })
  } catch (error) {
    const errors = error.response?.data?.errors
    if (errors) {
      errorMessage.value = Object.values(errors).flat()[0] || 'Registrasi gagal. Periksa kembali data kamu.'
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal terhubung ke server. Pastikan backend Laravel aktif.'
    }
  } finally {
    isLoading.value = false
  }
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

      <h1>Buat Akun Leva</h1>
      <p class="lead">Daftar dulu, lalu Leva akan menyesuaikan workspace dengan profil akademikmu.</p>

      <div v-if="errorMessage" class="field-error-message" role="alert">
        <AppIcon name="warning" :size="12" color="#DC2626" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleRegister">
        <label>
          Nama lengkap
          <input v-model="name" type="text" autocomplete="name" placeholder="Renisa Assyifa Putri" :disabled="isLoading" />
        </label>

        <label>
          Email
          <input v-model="email" type="email" autocomplete="email" placeholder="nama@student.com" :disabled="isLoading" />
        </label>

        <label>
          Password
          <input v-model="password" type="password" autocomplete="new-password" placeholder="Minimal 8 karakter" :disabled="isLoading" />
        </label>

        <label>
          Konfirmasi password
          <input v-model="passwordConfirmation" type="password" autocomplete="new-password" placeholder="Ulangi password" :disabled="isLoading" />
        </label>

        <button class="btn-primary submit-button" type="submit" :disabled="!canSubmit">
          <span>
            {{ isLoading ? 'Mendaftarkan...' : 'Daftar dan Lanjut' }}
            <AppIcon v-if="!isLoading" name="arrow-right" :size="14" color="#fff" />
          </span>
        </button>
      </form>

      <p class="switch-auth">
        Sudah punya akun?
        <RouterLink :to="{ name: 'login' }">Masuk ke Leva</RouterLink>
      </p>
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

.switch-auth {
  margin: 18px 0 0;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.switch-auth a {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
}
</style>
