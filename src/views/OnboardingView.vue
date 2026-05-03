<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { isValidPhoneNumber } from '../utils/validation'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  major: '',
  semester: '',
  language_preference: 'Indonesian',
  learningStyle: '',
  phone: ''
})

const isSubmitted = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!form.value.major || !form.value.semester || !form.value.learningStyle || !form.value.phone) {
    errorMessage.value = "Mohon lengkapi semua pertanyaan kuisioner."
    return
  }

  if (!isValidPhoneNumber(form.value.phone)) {
    errorMessage.value = "Nomor HP tidak valid. Gunakan awalan '08' atau '62'."
    return
  }

  isLoading.value = true

  try {
    await userStore.submitOnboarding({
      major: form.value.major,
      semester: parseInt(form.value.semester, 10),
      language_preference: form.value.language_preference,
      learning_style: form.value.learningStyle // Map to backend snake_case expected format
    })

    isSubmitted.value = true

    // Redirect otomatis setelah berhasil
    setTimeout(() => {
      router.push('/')
    }, 2000)
    
    } catch (error) {
    // Menerjemahkan error backend (Tugas Kamis)
    if (error.response && error.response.status === 422) {
      errorMessage.value = "Data tidak sesuai kriteria backend. Cek kembali isian Anda. Pastikan semua field sudah lengkap.";
    } else if (error.response && error.response.status === 400) {
      errorMessage.value = "Terjadi kesalahan pada format permintaan.";
    } else {
      errorMessage.value = "Gagal menyimpan profil. Silakan coba lagi nanti.";
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="onboarding-container">
    <div class="glass-panel onboarding-card">
      <div v-if="!isSubmitted">
        <h2>Profil Akademik</h2>
        <p class="subtitle">Bantu kami menyesuaikan workspace dengan gaya belajarmu.</p>
        
        <div v-if="errorMessage" class="alert error" style="color: red; margin-bottom: 1rem;">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group text-left">
            <label>Nomor Handphone (WhatsApp)</label>
            <input type="tel" v-model="form.phone" placeholder="Cth: 08123456789" required />
          </div>

          <div class="form-group text-left">
            <label>Apa jurusan atau program studimu?</label>
            <input type="text" v-model="form.major" placeholder="Cth: Kedokteran, Teknik Informatika" required />
          </div>

          <div class="form-group text-left">
            <label>Saat ini kamu berada di semester berapa?</label>
            <select v-model="form.semester" class="styled-select" required>
              <option disabled value="">Pilih Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8+</option>
            </select>
          </div>

          <div class="form-group text-left">
            <label>Bagaimana gaya belajar yang paling cocok untukmu?</label>
            <select v-model="form.learningStyle" class="styled-select" required>
              <option disabled value="">Pilih Gaya Belajar</option>
              <option value="visual">Visual (Suka melihat gambar/diagram)</option>
              <option value="auditory">Auditori (Suka mendengar penjelasan/podcast)</option>
              <option value="reading">Membaca/Menulis (Suka teks dan catatan ringkas)</option>
              <option value="kinesthetic">Kinestetik (Belajar dengan praktik langsung)</option>
            </select>
          </div>
          
          <button type="submit" class="btn-primary" :disabled="isLoading" :style="isLoading ? 'cursor: not-allowed; opacity: 0.7;' : ''">
            {{ isLoading ? '⏳ Menyimpan Jawaban...' : 'Simpan Profil & Lanjut' }}
          </button>
        </form>
      </div>

      <!-- Tampilan sukses setelah submit -->
      <div v-else class="success-view">
        <div class="success-icon">✨</div>
        <h2>Berhasil!</h2>
        <p>Kuisioner berhasil di-submit secara lokal di frontend.</p>
        <p class="redirect-text">Mengalihkan ke Dashboard...</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.onboarding-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.onboarding-card {
  width: 100%;
  max-width: 500px;
  padding: 2.5rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.text-left {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.styled-select {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.styled-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.styled-select option {
  background-color: var(--bg-color);
  color: white;
}

/* Success View Styling */
.success-view {
  animation: fadeIn 0.5s ease-out forwards;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s infinite alternate;
}

.redirect-text {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-style: italic;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}
</style>
