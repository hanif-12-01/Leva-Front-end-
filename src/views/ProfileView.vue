<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import { useDocumentStore } from '../stores/documentStore'
import { useUserStore } from '../stores/userStore'
import AppIcon from '../components/AppIcon.vue'
import Modal from '../components/Modal.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const documentStore = useDocumentStore()

const editMode = ref(false)
const showResetModal = ref(false)
const notifDaily = ref(true)
const notifTips = ref(true)
const notifTools = ref(false)
const errors = reactive({})

const user = computed(() => userStore.user || {})
const form = reactive({
  name: user.value.name || 'Mahasiswa Leva',
  major: user.value.major || 'Teknik Informatika',
  semester: String(user.value.semester || '4'),
  language_preference: user.value.language_preference || 'Indonesian',
})

const majorOptions = ['Teknik Informatika', 'Sistem Informasi', 'Hukum', 'Kedokteran', 'Psikologi', 'Bisnis & Manajemen', 'Desain Komunikasi Visual', 'Akuntansi', 'Ilmu Komunikasi', 'Lainnya']
const semesterOptions = Array.from({ length: 8 }, (_, index) => String(index + 1))

const initial = computed(() => (form.name || 'L').charAt(0).toUpperCase())

const validate = () => {
  errors.name = ''
  if (!form.name.trim()) errors.name = 'Nama tidak boleh kosong.'
  if (form.name.trim().length === 1) errors.name = 'Nama minimal 2 karakter.'
  return !errors.name
}

const saveProfile = () => {
  if (!validate()) return
  userStore.user = {
    ...userStore.user,
    name: form.name.trim(),
    major: form.major,
    semester: Number(form.semester),
    language_preference: form.language_preference,
    is_onboarded: true,
  }
  editMode.value = false
  appStore.showToast('Perubahan profil tersimpan di frontend.', 'success')
}

const cancelEdit = () => {
  form.name = user.value.name || 'Mahasiswa Leva'
  form.major = user.value.major || 'Teknik Informatika'
  form.semester = String(user.value.semester || '4')
  form.language_preference = user.value.language_preference || 'Indonesian'
  errors.name = ''
  editMode.value = false
}

const logout = () => {
  userStore.logout()
  router.push({ name: 'login' })
}

const resetDemo = () => {
  appStore.resetDemoData()
  documentStore.tasks = []
  userStore.logout()
  showResetModal.value = false
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="main-content view-enter profile-page">
    <h1><AppIcon name="user" :size="22" /> Profil & Pengaturan</h1>

    <section class="card profile-card">
      <div class="profile-summary">
        <div class="avatar">{{ initial }}</div>
        <div>
          <h2>{{ form.name }}</h2>
          <p>{{ form.major }} · Semester {{ form.semester }}</p>
          <span><AppIcon name="book" :size="12" /> {{ form.language_preference }}</span>
        </div>
        <button v-if="!editMode" class="btn-ghost" type="button" @click="editMode = true">
          <AppIcon name="pencil" :size="12" /> Edit
        </button>
      </div>

      <div v-if="editMode" class="edit-form">
        <div class="form-grid">
          <label>
            Nama
            <input v-model="form.name" :class="{ invalid: errors.name }" />
            <small v-if="errors.name"><AppIcon name="warning" :size="12" /> {{ errors.name }}</small>
          </label>
          <label>
            Semester
            <select v-model="form.semester">
              <option v-for="semester in semesterOptions" :key="semester" :value="semester">Semester {{ semester }}</option>
            </select>
          </label>
        </div>
        <label>
          Jurusan
          <select v-model="form.major">
            <option v-for="major in majorOptions" :key="major" :value="major">{{ major }}</option>
          </select>
        </label>
        <label>
          Preferensi Bahasa
          <select v-model="form.language_preference">
            <option value="Indonesian">Indonesia</option>
            <option value="English">English</option>
          </select>
        </label>
        <div class="form-actions">
          <button class="btn-ghost" type="button" @click="cancelEdit">Batal</button>
          <button class="btn-primary" type="button" @click="saveProfile">
            <AppIcon name="check" :size="14" color="#fff" /> Simpan Perubahan
          </button>
        </div>
      </div>
    </section>

    <section class="card stats-card">
      <h3><AppIcon name="dashboard" :size="16" /> Statistik Penggunaan</h3>
      <div class="stats-grid">
        <button type="button" @click="router.push({ name: 'chat' })">
          <AppIcon name="clipboard" :size="22" />
          <strong>{{ documentStore.tasks.length }}</strong>
          <span>Tasks Dibuat</span>
        </button>
        <button type="button" @click="router.push({ name: 'library' })">
          <AppIcon name="book" :size="22" />
          <strong>{{ appStore.savedTools.length }}</strong>
          <span>Tools Tersimpan</span>
        </button>
        <button type="button">
          <AppIcon name="calendar-clock" :size="22" />
          <strong>8</strong>
          <span>Hari Berturut-turut</span>
        </button>
      </div>
    </section>

    <section class="card prefs-card">
      <h3><AppIcon name="bell" :size="16" /> Preferensi Notifikasi</h3>
      <div v-for="item in [
        { label: 'Efek Suara', sub: 'Putar suara saat menyelesaikan tugas', model: 'sound' },
        { label: 'Pengingat Harian', sub: 'Ingatkan tools AI baru setiap hari', model: 'daily' },
        { label: 'Tips Penggunaan Mingguan', sub: 'Tips produktivitas setiap minggu', model: 'tips' },
        { label: 'Pembaruan Tool Baru', sub: 'Tools baru sesuai jurusanmu', model: 'tools' },
      ]" :key="item.label" class="pref-row">
        <div>
          <p>{{ item.label }}</p>
          <span>{{ item.sub }}</span>
        </div>
        <button
          type="button"
          class="toggle"
          :class="{
            active: item.model === 'sound' ? appStore.soundEnabled : item.model === 'daily' ? notifDaily : item.model === 'tips' ? notifTips : notifTools
          }"
          @click="
            item.model === 'sound'
              ? appStore.soundEnabled = !appStore.soundEnabled
              : item.model === 'daily'
                ? notifDaily = !notifDaily
                : item.model === 'tips'
                  ? notifTips = !notifTips
                  : notifTools = !notifTools
          "
        >
          <span></span>
        </button>
      </div>
    </section>

    <div class="session-actions">
      <button type="button" @click="logout"><AppIcon name="logout" :size="14" /> Keluar</button>
      <button type="button" @click="showResetModal = true"><AppIcon name="trash" :size="14" /> Reset Demo</button>
    </div>

    <Modal v-if="showResetModal" title="Reset Semua Data?" @close="showResetModal = false">
      <p style="margin: 0 0 16px; color: var(--color-text-secondary); line-height: 1.6;">
        Semua data demo termasuk riwayat tugas dan Library akan dihapus dari browser.
      </p>
      <div class="form-actions">
        <button class="btn-ghost" type="button" @click="showResetModal = false">Batal</button>
        <button class="danger-button" type="button" @click="resetDemo">Hapus Semua</button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 32px 36px;
  max-width: 720px;
  margin: 0 auto;
}

h1,
.profile-summary,
.profile-summary span,
.profile-summary button,
.stats-card h3,
.prefs-card h3,
.form-actions,
.session-actions,
.session-actions button {
  display: flex;
}

h1 {
  align-items: center;
  gap: 8px;
  margin: 0 0 24px;
  font-size: 24px;
}

.profile-card,
.stats-card,
.prefs-card {
  padding: 24px;
  margin-bottom: 20px;
}

.profile-summary {
  align-items: center;
  gap: 18px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #8B5CF6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  flex-shrink: 0;
}

.profile-summary div:nth-child(2) {
  flex: 1;
}

.profile-summary h2 {
  margin: 0 0 4px;
}

.profile-summary p,
.profile-summary span {
  margin: 0;
  color: var(--color-text-secondary);
}

.profile-summary span,
.profile-summary button {
  align-items: center;
  gap: 6px;
}

.profile-summary button {
  width: auto;
}

.edit-form {
  margin-top: 22px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 14px;
}

input,
select {
  width: 100%;
  margin-top: 6px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  padding: 10px 12px;
  background: #fff;
  color: var(--color-text-primary);
}

input.invalid {
  border-color: #DC2626;
}

small {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #DC2626;
}

.form-actions {
  gap: 10px;
}

.form-actions > * {
  flex: 1;
  justify-content: center;
}

.stats-card h3,
.prefs-card h3 {
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 15px;
}

.stats-card button {
  border: 1px solid transparent;
  background: var(--color-bg);
  border-radius: 12px;
  padding: 16px 10px;
  text-align: center;
  cursor: pointer;
}

.stats-card strong {
  display: block;
  margin-top: 6px;
  font-size: 24px;
  color: var(--color-primary);
}

.stats-card span {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.pref-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.pref-row:last-child {
  border-bottom: none;
}

.pref-row p {
  margin: 0;
  font-weight: 700;
  font-size: 14px;
}

.pref-row span {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: var(--color-border);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle.active {
  background: var(--color-primary);
}

.toggle span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}

.toggle.active span {
  left: 22px;
}

.session-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.session-actions button {
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 12px;
  padding: 13px;
  font-weight: 700;
  cursor: pointer;
}

.session-actions button:first-child {
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  background: #fff;
}

.session-actions button:last-child,
.danger-button {
  border: 1px solid #FEE2E2;
  color: #DC2626;
  background: #FFF5F5;
}

.danger-button {
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 640px) {
  .form-grid,
  .stats-grid,
  .session-actions {
    grid-template-columns: 1fr;
  }

  .profile-summary {
    align-items: flex-start;
  }
}
</style>
