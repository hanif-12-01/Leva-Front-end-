<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const majorOptions = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Sains Data',
  'Rekayasa Perangkat Lunak',
  'Teknik Elektro',
  'Teknik Mesin',
  'Ilmu Komunikasi',
  'Psikologi',
  'Hukum',
  'Kedokteran',
  'Manajemen',
  'Akuntansi',
  'Desain Komunikasi Visual',
  'Sastra Inggris',
  'Ilmu Politik',
  'Farmasi',
  'Arsitektur',
  'Teknik Sipil',
]

const semesterOptions = Array.from({ length: 8 }, (_, index) => `${index + 1}`)

const step = ref(1)
const isLoading = ref(false)
const isMajorOpen = ref(false)
const errorMessage = ref('')
const stepAnimationClass = ref('')
const form = ref({
  name: userStore.user?.name || 'Admin Leva',
  major: userStore.user?.major || '',
  semester: userStore.user?.semester ? String(userStore.user.semester) : '',
  language: userStore.user?.language_preference === 'English' ? 'English' : 'Indonesia',
})
const majorQuery = ref(form.value.major)
const errors = ref({})

const filteredMajor = computed(() => {
  const query = majorQuery.value.trim().toLowerCase()
  if (!query) return majorOptions
  return majorOptions.filter((major) => major.toLowerCase().includes(query))
})

const isStep1Complete = computed(() => form.value.name.trim().length > 0)
const isStep2Complete = computed(() => Boolean(form.value.major && form.value.semester))

const update = (key, value) => {
  form.value[key] = value
  errors.value[key] = ''
}

const animateTo = async (nextStep, direction = 'next') => {
  stepAnimationClass.value = direction === 'next' ? 'onboarding-slide-next' : 'onboarding-slide-back'
  step.value = nextStep
  await nextTick()
  window.setTimeout(() => {
    stepAnimationClass.value = ''
  }, 320)
}

const handleNext = () => {
  if (step.value === 1) {
    if (!form.value.name.trim()) {
      errors.value.name = 'Nama tidak boleh kosong. Silakan isi nama lengkapmu untuk melanjutkan.'
      return
    }
    animateTo(2)
    return
  }

  if (step.value === 2) {
    const nextErrors = {}
    if (!form.value.major) nextErrors.major = 'Silakan pilih jurusanmu terlebih dahulu.'
    if (!form.value.semester) nextErrors.semester = 'Silakan pilih semestermu.'
    errors.value = nextErrors
    if (Object.keys(nextErrors).length > 0) return
    animateTo(3)
  }
}

const selectMajor = (major) => {
  update('major', major)
  majorQuery.value = major
  isMajorOpen.value = false
}

const handleMajorTyping = (value) => {
  majorQuery.value = value
  isMajorOpen.value = true
  errors.value.major = ''
  form.value.major = majorOptions.find((major) => major.toLowerCase() === value.trim().toLowerCase()) || ''
}

const handleStart = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await userStore.submitOnboarding({
      major: form.value.major,
      semester: parseInt(form.value.semester, 10),
      language_preference: form.value.language === 'English' ? 'English' : 'Indonesian',
      learning_style: 'visual',
    })

    if (userStore.user) {
      userStore.user.name = form.value.name.trim()
    }

    router.push('/')
  } catch (error) {
    if (error.response?.status === 409) {
      router.push('/')
    } else if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Gagal menyimpan profil. Silakan coba lagi.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="onboarding-page">
    <div class="card onboarding-card">
      <div class="onboarding-step-panel" :class="stepAnimationClass">
        <div class="brand-block">
          <div class="brand-icon"><AppIcon name="sparkles" :size="30" /></div>
          <span>Leva</span>
          <p>Your Cognitive Lever for Academic Excellence</p>
          <strong>Asisten Akademik Cerdasmu</strong>
        </div>

        <div class="step-dots">
          <span
            v-for="dot in [1, 2, 3]"
            :key="dot"
            class="tooltip-host"
            :class="{ active: dot === step }"
            :data-tooltip="`${dot}. ${dot === 1 ? 'Nama' : dot === 2 ? 'Info Akademik' : 'Konfirmasi'}`"
            tabindex="0"
          >
            <i :class="{ active: dot <= step, current: dot === step }"></i>
          </span>
        </div>

        <section v-if="step === 1">
          <h2>Hei! Perkenalkan dirimu dulu</h2>
          <p class="subtitle">Leva butuh sedikit info untuk mempersonalisasi pengalaman belajarmu.</p>

          <label>
            Nama lengkap kamu
            <input
              v-model="form.name"
              autofocus
              autocomplete="name"
              placeholder="Contoh: Renisa Assyifa Putri"
              :class="{ invalid: errors.name }"
              @keydown.enter.prevent="handleNext"
            />
          </label>
          <p v-if="errors.name" class="field-error-message" role="alert">
            <AppIcon name="warning" :size="12" color="#DC2626" />
            <span>{{ errors.name }}</span>
          </p>

          <button class="btn-primary primary-wide" type="button" :disabled="!isStep1Complete" @click="handleNext">
            Lanjut <AppIcon name="arrow-right" :size="14" color="#fff" />
          </button>

          <div class="divider">
            <span></span>
            <p>atau</p>
            <span></span>
          </div>

          <button class="google-button" type="button">
            <AppIcon name="google" :size="14" /> Atau lanjutkan dengan Google
          </button>
        </section>

        <section v-if="step === 2">
          <h2>Info Akademik Kamu</h2>
          <p class="subtitle">Ini membantu Leva merekomendasikan tools yang paling relevan untukmu.</p>

          <label>
            Jurusan
            <div class="combo-box">
              <input
                :value="majorQuery"
                placeholder="Ketik atau pilih jurusan..."
                :class="{ invalid: errors.major }"
                @focus="isMajorOpen = true"
                @input="handleMajorTyping($event.target.value)"
              />
              <button v-if="majorQuery" type="button" aria-label="Reset jurusan" @click="majorQuery = ''; form.major = ''">
                <AppIcon name="x" :size="14" />
              </button>
              <AppIcon name="chevron-down" :size="14" />
              <div v-if="isMajorOpen" class="combo-list">
                <button v-for="major in filteredMajor" :key="major" type="button" @click="selectMajor(major)">
                  {{ major }}
                </button>
                <p v-if="filteredMajor.length === 0">Jurusan tidak ditemukan</p>
              </div>
            </div>
          </label>
          <small>Ketik nama jurusanmu untuk mencari lebih cepat</small>
          <p v-if="errors.major" class="field-error-message" role="alert">
            <AppIcon name="warning" :size="12" color="#DC2626" />
            <span>{{ errors.major }}</span>
          </p>

          <label class="semester-label">Semester</label>
          <div class="onboarding-semester-grid semester-grid" role="radiogroup">
            <button
              v-for="semester in semesterOptions"
              :key="semester"
              type="button"
              :class="{ active: form.semester === semester }"
              @click="update('semester', semester)"
            >
              Semester {{ semester }}
            </button>
          </div>
          <p v-if="errors.semester" class="field-error-message" role="alert">
            <AppIcon name="warning" :size="12" color="#DC2626" />
            <span>{{ errors.semester }}</span>
          </p>

          <label class="language-label">
            Preferensi Bahasa
            <span class="tooltip-host tooltip-help-icon" data-tooltip="Pilih bahasa untuk rekomendasi dan tips Leva." tabindex="0">?</span>
          </label>
          <div class="language-toggle">
            <button type="button" :class="{ active: form.language === 'Indonesia' }" @click="update('language', 'Indonesia')">
              ID Indonesia
            </button>
            <button type="button" :class="{ active: form.language === 'English' }" @click="update('language', 'English')">
              EN English
            </button>
          </div>

          <div class="action-row">
            <button class="btn-ghost" type="button" @click="animateTo(1, 'back')">
              <AppIcon name="arrow-left" :size="14" /> Kembali
            </button>
            <button class="btn-primary" type="button" :disabled="!isStep2Complete" @click="handleNext">
              Lanjut <AppIcon name="arrow-right" :size="14" color="#fff" />
            </button>
          </div>
        </section>

        <section v-if="step === 3" class="confirm-step">
          <AppIcon name="graduation-cap" :size="56" />
          <h2>Siap, <span>{{ form.name.split(' ')[0] }}</span>!</h2>
          <p class="subtitle">
            Kamu mahasiswa jurusan <strong>{{ form.major }}</strong>, semester <strong>{{ form.semester }}</strong>.<br />
            Leva siap jadi asisten akademikmu. Mulai jelajahi sekarang!
          </p>

          <div class="summary-card">
            <div><span>Nama</span><strong>{{ form.name }}</strong></div>
            <div><span>Jurusan</span><strong>{{ form.major }}</strong></div>
            <div><span>Semester</span><strong>Semester {{ form.semester }}</strong></div>
            <div><span>Bahasa</span><strong>{{ form.language }}</strong></div>
          </div>

          <p v-if="errorMessage" class="field-error-message" role="alert">
            <AppIcon name="warning" :size="12" color="#DC2626" />
            <span>{{ errorMessage }}</span>
          </p>

          <p class="edit-note">Tenang, data ini bisa kamu ubah kapan saja di halaman Profil.</p>

          <button class="start-button" type="button" :disabled="isLoading" @click="handleStart">
            {{ isLoading ? 'Menyimpan...' : 'Masuk ke Dashboard' }}
            <AppIcon v-if="!isLoading" name="arrow-right" :size="14" color="#fff" />
          </button>
          <button class="btn-ghost edit-button" type="button" @click="animateTo(2, 'back')">
            <AppIcon name="arrow-left" :size="14" /> Edit Data
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6C63FF 0%, #8B5CF6 50%, #A78BFA 100%);
  padding: 20px;
}

.onboarding-card {
  width: 100%;
  max-width: 460px;
  padding: 36px;
  position: relative;
  overflow: visible;
}

.brand-block {
  text-align: center;
  margin-bottom: 28px;
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
  display: inline-flex;
}

.step-dots i {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: var(--color-border);
  transition: all 0.3s ease;
}

.step-dots i.active {
  background: var(--color-primary);
}

.step-dots i.current {
  width: 24px;
}

h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
}

.subtitle {
  margin: 0 0 24px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

label,
.semester-label,
.language-label {
  display: block;
  margin-bottom: 6px;
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

input.invalid {
  border-color: #DC2626;
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(196, 181, 253, 0.55);
  outline: none;
}

.primary-wide,
.google-button,
.edit-button,
.start-button {
  width: 100%;
}

.primary-wide,
.action-row .btn-primary,
.action-row .btn-ghost,
.start-button,
.edit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 13px;
}

.primary-wide {
  margin-top: 20px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 12px;
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

.google-button {
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  background: #fff;
  color: #374151;
  padding: 12px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.combo-box {
  position: relative;
}

.combo-box input {
  padding-right: 66px;
}

.combo-box > button {
  position: absolute;
  top: 50%;
  right: 34px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  display: flex;
}

.combo-box > svg {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.combo-list {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  max-height: 210px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 20;
}

.combo-list button {
  width: 100%;
  border: none;
  background: #fff;
  color: var(--color-text-primary);
  text-align: left;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 13px;
}

.combo-list button:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.combo-list p,
small {
  display: block;
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.semester-label {
  margin-top: 16px;
}

.semester-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.semester-grid button,
.language-toggle button {
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: #fff;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.semester-grid button {
  padding: 10px 8px;
}

.semester-grid button.active,
.language-toggle button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.language-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
}

.language-toggle {
  display: flex;
  gap: 10px;
}

.language-toggle button {
  flex: 1;
  padding: 10px;
  font-size: 14px;
}

.action-row {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.action-row .btn-ghost {
  flex: 1;
}

.action-row .btn-primary {
  flex: 2;
}

.confirm-step {
  text-align: center;
}

.confirm-step h2 {
  margin: 16px 0 12px;
  line-height: 1.35;
}

.confirm-step h2 span {
  color: var(--color-primary);
}

.summary-card {
  background: var(--color-primary-light);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
  text-align: left;
}

.summary-card div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(108, 99, 255, 0.15);
  font-size: 13px;
}

.summary-card div:last-child {
  border-bottom: none;
}

.summary-card span {
  color: var(--color-text-secondary);
}

.summary-card strong {
  color: var(--color-text-primary);
  text-align: right;
}

.edit-note {
  margin: -8px 0 18px;
  color: #6B7280;
  font-size: 13px;
  font-style: italic;
}

.start-button {
  border: none;
  border-radius: 12px;
  background: var(--color-secondary);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.start-button:hover {
  background: #059669;
}

.edit-button {
  margin-top: 10px;
}

@media (max-width: 768px) {
  .semester-grid {
    grid-template-columns: 1fr;
  }
}
</style>
