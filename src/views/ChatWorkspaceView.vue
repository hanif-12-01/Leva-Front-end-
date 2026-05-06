<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { mockSubTasks, mockTools } from '../data/mockData'
import { useAppStore } from '../stores/appStore'
import { useDocumentStore } from '../stores/documentStore'
import { useUserStore } from '../stores/userStore'
import AppIcon from '../components/AppIcon.vue'

const appStore = useAppStore()
const documentStore = useDocumentStore()
const userStore = useUserStore()

const inputVal = ref('')
const taskTitle = ref('')
const subTasks = ref([])
const expandedId = ref(null)
const isLoading = ref(false)
const attachedFile = ref(null)
const fileError = ref('')
const followUpVal = ref('')
const followUpReply = ref('')
const fileInput = ref(null)

const user = computed(() => userStore.user || {})
const firstName = computed(() => user.value.name?.split(' ')[0] || 'Mahasiswa')
const major = computed(() => user.value.major || 'Teknik Informatika')
const hasResults = computed(() => subTasks.value.length > 0)
const completedCount = computed(() => subTasks.value.filter((task) => task.status === 'done').length)
const progressPct = computed(() => subTasks.value.length ? Math.round((completedCount.value / subTasks.value.length) * 100) : 0)
const expandedTask = computed(() => subTasks.value.find((task) => task.id === expandedId.value))
const savedToolNames = computed(() => new Set(appStore.savedTools.map((tool) => tool.name.toLowerCase())))
const quickPrompts = computed(() => major.value.toLowerCase().includes('informatika')
  ? ['Bantu susun skripsi', 'Debug kode Python', 'Review jurnal IEEE', 'Belajar framework baru']
  : ['Bantu susun skripsi', 'Buat essay etika profesi', 'Analisis jurnal terkait', 'Susun jadwal belajar'])

const toolsForTask = (task) => mockTools.filter((tool) => task?.toolIds?.includes(tool.id))

const validateAttachment = (file) => {
  if (!file) return ''
  if (file.size > 10 * 1024 * 1024) return 'Ukuran file maksimal 10MB.'
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!['pdf', 'txt'].includes(extension)) return 'Format file yang didukung hanya PDF dan TXT.'
  return ''
}

const pickAttachment = () => fileInput.value?.click()

const handleAttachment = (event) => {
  const file = event.target.files?.[0]
  const error = validateAttachment(file)
  if (error) {
    attachedFile.value = null
    fileError.value = error
    return
  }
  attachedFile.value = file
  fileError.value = ''
}

const removeAttachment = () => {
  attachedFile.value = null
  fileError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const generatedTitle = () => {
  const text = inputVal.value.toLowerCase()
  if (attachedFile.value?.name) return `Memecah Tugas dari ${attachedFile.value.name}`
  if (text.includes('skripsi')) return `Menyusun Skripsi ${major.value}`
  if (text.includes('essay')) return `Menulis Essay ${major.value}`
  if (text.includes('coding') || text.includes('koding')) return 'Belajar Koding dari Nol'
  return 'Menyelesaikan Tugas Akademik'
}

const handleSubmit = async () => {
  if ((!inputVal.value.trim() && !attachedFile.value) || fileError.value) return

  isLoading.value = true
  try {
    if (attachedFile.value) {
      const response = await documentStore.uploadPdf(attachedFile.value)
      const backendTasks = response?.data || response?.tasks || []
      if (Array.isArray(backendTasks) && backendTasks.length) {
        subTasks.value = backendTasks.map((task, index) => ({
          id: task.id ?? index + 1,
          title: task.title || task,
          status: task.status || (index === 0 ? 'next' : 'next'),
          estimasi: task.estimasi || task.estimate || '1 hari',
          kategori: task.kategori || task.category || 'Academic',
          deskripsi: task.deskripsi || task.description || 'Task dibuat dari dokumen yang kamu unggah.',
          tips: task.tips || 'Gunakan rekomendasi tools di panel kanan untuk mempercepat pengerjaan.',
          toolIds: task.toolIds || [1, 3, 6],
        }))
      }
    }

    if (!subTasks.value.length) {
      subTasks.value = mockSubTasks.map((task, index) => ({
        ...task,
        status: index === 0 ? 'next' : 'next',
      }))
    }

    taskTitle.value = generatedTitle()
    expandedId.value = subTasks.value[0]?.id || null
    documentStore.addTasks([{ title: taskTitle.value, date: new Date().toLocaleDateString('id-ID') }])
    inputVal.value = ''
    removeAttachment()
    appStore.showToast('Task berhasil dibuat dan siap dikerjakan.', 'success')
  } catch {
    appStore.showToast('Gagal memproses task. Pastikan backend aktif atau gunakan mode dummy login.', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleDone = (taskId) => {
  subTasks.value = subTasks.value.map((task) => (
    task.id === taskId
      ? { ...task, status: task.status === 'done' ? 'next' : 'done' }
      : task
  ))
}

const handleFollowUp = () => {
  if (!followUpVal.value.trim()) return
  followUpReply.value = `Untuk "${expandedTask.value?.title || taskTitle.value}", mulai dari output kecil dulu: buat outline, cek referensi, lalu simpan tools yang paling sering kamu pakai ke Library.`
  followUpVal.value = ''
}

const resetWorkspace = () => {
  inputVal.value = ''
  taskTitle.value = ''
  subTasks.value = []
  expandedId.value = null
  followUpVal.value = ''
  followUpReply.value = ''
  removeAttachment()
}

onMounted(() => {
  window.addEventListener('leva:new-chat', resetWorkspace)
})

onUnmounted(() => {
  window.removeEventListener('leva:new-chat', resetWorkspace)
})
</script>

<template>
  <div class="chat-workspace view-enter">
    <section class="chat-center">
      <div v-if="!hasResults" class="empty-state">
        <AppIcon name="sparkles" :size="40" />
        <h2>Hei, {{ firstName }}! Ceritakan tugasmu hari ini.</h2>
        <p>Leva akan memecahnya jadi langkah kecil dan merekomendasikan tools AI terbaik untukmu.</p>

        <div class="composer">
          <input ref="fileInput" type="file" accept=".pdf,.txt" hidden @change="handleAttachment" />
          <div v-if="attachedFile" class="attachment-chip">
            <AppIcon name="paperclip" :size="12" />
            <span>{{ attachedFile.name }}</span>
            <button type="button" aria-label="Hapus file" @click="removeAttachment">
              <AppIcon name="x" :size="13" />
            </button>
          </div>
          <textarea
            v-model="inputVal"
            :disabled="isLoading"
            rows="3"
            placeholder="Contoh: aku mau bikin skripsi, atau bantu aku buat essay etika profesi..."
            @keydown.enter.exact.prevent="handleSubmit"
          ></textarea>
          <button class="attach-button tooltip-host" data-tooltip="Lampirkan PDF atau TXT" type="button" @click="pickAttachment">
            <AppIcon name="paperclip" :size="16" />
          </button>
          <button class="send-button" type="button" :disabled="isLoading || (!inputVal.trim() && !attachedFile)" @click="handleSubmit">
            <AppIcon :name="isLoading ? 'loader' : 'send'" :class="isLoading ? 'send-spinner' : ''" :size="16" color="#fff" />
          </button>
        </div>

        <p v-if="fileError" class="error-text">{{ fileError }}</p>
        <p v-if="isLoading" class="loading-text">Leva sedang memecah tugasmu...</p>

        <div class="quick-prompts">
          <button v-for="prompt in quickPrompts" :key="prompt" type="button" @click="inputVal = prompt">
            {{ prompt }}
          </button>
        </div>
      </div>

      <template v-else>
        <header class="task-header">
          <div>
            <p>TASK AKTIF</p>
            <h2>{{ taskTitle }}</h2>
          </div>
          <div>
            <span>{{ completedCount }}/{{ subTasks.length }} selesai</span>
            <div class="progress-track"><div :style="{ width: `${progressPct}%` }"></div></div>
          </div>
        </header>

        <article v-for="(task, index) in subTasks" :key="task.id" class="card subtask-card">
          <button class="subtask-head" type="button" @click="expandedId = expandedId === task.id ? null : task.id">
            <span class="step-dot" :class="{ done: task.status === 'done' }">
              <AppIcon v-if="task.status === 'done'" name="check" :size="14" color="#fff" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <strong>{{ task.title }}</strong>
            <span class="badge-done" v-if="task.status === 'done'">Done</span>
            <span class="badge-next" v-else>Next Section</span>
            <AppIcon name="chevron-down" :size="16" />
          </button>

          <div class="subtask-content" :class="{ open: expandedId === task.id }">
            <div class="subtask-body">
              <div class="task-meta">
                <span class="tag" :class="`tag-${String(task.kategori).toLowerCase()}`">{{ task.kategori }}</span>
                <span><AppIcon name="clock" :size="12" /> {{ task.estimasi }}</span>
              </div>
              <p>{{ task.deskripsi }}</p>
              <button class="btn-primary" type="button" @click="toggleDone(task.id)">
                <AppIcon :name="task.status === 'done' ? 'undo' : 'check'" :size="14" color="#fff" />
                {{ task.status === 'done' ? 'Tandai Ulang' : 'Tandai Selesai' }}
              </button>
            </div>
          </div>
        </article>

        <div class="follow-up card">
          <p v-if="followUpReply">{{ followUpReply }}</p>
          <div>
            <textarea v-model="followUpVal" rows="1" placeholder="Tanya lebih lanjut tentang task ini..." @keydown.enter.exact.prevent="handleFollowUp"></textarea>
            <button class="btn-primary" type="button" @click="handleFollowUp">Kirim</button>
          </div>
        </div>
      </template>
    </section>

    <aside class="right-panel" :class="{ open: expandedTask }">
      <template v-if="expandedTask">
        <h3>Rekomendasi Tools AI</h3>
        <article v-for="tool in toolsForTask(expandedTask)" :key="tool.id" class="card rec-card">
          <div>
            <strong><AppIcon :name="tool.iconKey" :size="16" /> {{ tool.name }}</strong>
            <a :href="`https://${tool.url}`" target="_blank" rel="noreferrer" aria-label="Buka tool">
              <AppIcon name="external-link" :size="14" />
            </a>
          </div>
          <p>{{ tool.desc }}</p>
          <button class="btn-secondary" type="button" :disabled="savedToolNames.has(tool.name.toLowerCase())" @click="appStore.saveToolToLibrary(tool)">
            {{ savedToolNames.has(tool.name.toLowerCase()) ? 'Tersimpan' : 'Simpan ke Library' }}
          </button>
        </article>
        <div class="tips-box">
          <strong>Cara menggunakan tool ini</strong>
          <p>{{ expandedTask.tips }}</p>
        </div>
      </template>
    </aside>
  </div>
</template>

<style scoped>
.chat-workspace {
  display: flex;
  min-height: 100vh;
}

.chat-center {
  flex: 1;
  padding: 28px 32px;
  min-width: 0;
}

.empty-state {
  min-height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-state h2 {
  margin: 14px 0 8px;
}

.empty-state p {
  max-width: 460px;
  color: var(--color-text-secondary);
  line-height: 1.65;
}

.composer {
  width: min(560px, 100%);
  position: relative;
}

.composer textarea {
  width: 100%;
  padding: 16px 56px 40px 50px;
  border: 2px solid var(--color-border);
  border-radius: 16px;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
}

.attach-button,
.send-button {
  position: absolute;
  bottom: 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
}

.attach-button {
  left: 12px;
  padding: 6px;
  background: transparent;
  color: var(--color-primary);
}

.send-button {
  right: 12px;
  padding: 8px 12px;
  background: var(--color-primary);
}

.attachment-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
}

.attachment-chip button {
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
}

.quick-prompts {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-prompts button {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border-radius: 999px;
  padding: 7px 14px;
  cursor: pointer;
}

.error-text {
  color: #DC2626 !important;
  font-size: 12px;
}

.loading-text {
  font-size: 13px;
  font-weight: 700;
}

.task-header {
  background: linear-gradient(135deg, var(--color-primary), #8B5CF6);
  color: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.task-header p,
.task-header h2 {
  margin: 0;
}

.task-header p {
  opacity: 0.75;
  font-size: 12px;
  font-weight: 700;
}

.progress-track {
  width: 110px;
  height: 6px;
  margin-top: 6px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 3px;
}

.progress-track div {
  height: 100%;
  background: #fff;
  border-radius: 3px;
}

.subtask-card {
  margin-bottom: 10px;
  overflow: hidden;
}

.subtask-head {
  width: 100%;
  border: none;
  background: #F8FAFC;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.subtask-head strong {
  flex: 1;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.step-dot.done {
  background: var(--color-secondary);
}

.subtask-body {
  padding: 20px;
  border-top: 1px solid var(--color-border);
}

.subtask-body p {
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.subtask-body .btn-primary {
  width: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.task-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.task-meta span:last-child {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border-radius: 8px;
  padding: 3px 10px;
}

.follow-up {
  margin-top: 20px;
  padding: 16px 20px;
}

.follow-up p {
  background: var(--color-primary-light);
  border-radius: 12px;
  padding: 12px 14px;
}

.follow-up div {
  display: flex;
  gap: 10px;
}

.follow-up textarea {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 14px;
  resize: none;
}

.follow-up .btn-primary {
  width: auto;
}

.right-panel {
  width: 280px;
  min-width: 280px;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  padding: 24px 16px;
}

.right-panel h3 {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.rec-card {
  padding: 12px 14px;
  margin-bottom: 10px;
}

.rec-card > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.rec-card strong {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.rec-card p,
.tips-box p {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.rec-card .btn-secondary {
  width: 100%;
  padding: 8px;
  font-size: 12px;
}

.tips-box {
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 12px;
  padding: 14px;
  color: #92400E;
}

.tips-box p {
  color: #78350F;
  margin-bottom: 0;
}

@media (max-width: 1024px) {
  .right-panel {
    display: none;
  }
}
</style>
