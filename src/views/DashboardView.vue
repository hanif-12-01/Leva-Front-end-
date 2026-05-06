<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockTools } from '../data/mockData'
import { useAppStore } from '../stores/appStore'
import { useDocumentStore } from '../stores/documentStore'
import { useUserStore } from '../stores/userStore'
import AppIcon from '../components/AppIcon.vue'

const router = useRouter()
const appStore = useAppStore()
const documentStore = useDocumentStore()
const userStore = useUserStore()
const fileInput = ref(null)
const activeFilter = ref('Semua')
const showAllFeatured = ref(false)
const isMounted = ref(false)

const filters = ['Semua', 'Research', 'Writing', 'Coding', 'Data', 'Academic', 'Productivity']
const user = computed(() => userStore.user || {})
const firstName = computed(() => user.value.name?.split(' ')[0] || 'Mahasiswa')
const major = computed(() => user.value.major || 'Teknik Informatika')
const savedToolNames = computed(() => new Set(appStore.savedTools.map((tool) => tool.name.toLowerCase())))
const featuredTools = computed(() => showAllFeatured.value ? mockTools : mockTools.slice(0, 6))
const filteredTools = computed(() => activeFilter.value === 'Semua'
  ? mockTools
  : mockTools.filter((tool) => tool.category === activeFilter.value))

const greetingMeta = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return { text: 'Selamat pagi', icon: 'lamp' }
  if (hour < 15) return { text: 'Selamat siang', icon: 'refresh' }
  if (hour < 18) return { text: 'Selamat sore', icon: 'calendar' }
  return { text: 'Selamat malam', icon: 'sparkles' }
})

const today = computed(() => new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}))

const pricingMeta = (pricingType) => ({
  free: { label: 'Free', bg: '#DCFCE7', color: '#15803D' },
  freemium: { label: 'Freemium', bg: '#FEF3C7', color: '#B45309' },
  paid: { label: 'Berbayar', bg: '#FEE2E2', color: '#B91C1C' },
  opensource: { label: 'Open-source', bg: '#DBEAFE', color: '#1D4ED8' },
}[pricingType] || { label: 'Freemium', bg: '#FEF3C7', color: '#B45309' })

const tagClass = (category) => `tag tag-${String(category).toLowerCase()}`

const saveTool = (tool) => {
  appStore.saveToolToLibrary(tool)
}

const openTour = () => {
  window.dispatchEvent(new CustomEvent('leva:open-dashboard-tour'))
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const response = await documentStore.uploadPdf(file)
    const tasks = response?.data || response?.tasks || []
    if (Array.isArray(tasks) && tasks.length > 0) {
      documentStore.addTasks(tasks)
    }
    appStore.showToast('Dokumen berhasil diproses menjadi task.', 'success')
    router.push({ name: 'chat' })
  } catch {
    appStore.showToast('Gagal mengunggah dokumen. Pastikan backend Laravel aktif.', 'error')
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

onMounted(async () => {
  isMounted.value = true
  documentStore.fetchTasks().catch(() => {})
})
</script>

<template>
  <div class="main-content view-enter" style="padding: 32px 36px; max-width: 1100px; margin: 0 auto;">
    <div v-if="!isMounted">
      <div v-for="width in [220, 320, 140]" :key="width" :style="{ width: `${width}px` }" class="skeleton-line"></div>
    </div>

    <template v-else>
      <header class="dashboard-header">
        <div>
          <h1>
            {{ greetingMeta.text }}, {{ firstName }}!
            <AppIcon :name="greetingMeta.icon" :size="20" />
          </h1>
          <p>Ini rekomendasi tools AI hari ini yang relevan untuk <strong>{{ major }}</strong> kamu.</p>
        </div>
        <div class="dashboard-actions">
          <p>{{ today }}</p>
          <input ref="fileInput" type="file" accept="application/pdf" hidden @change="handleFileUpload" />
          <button class="btn-primary" type="button" :disabled="documentStore.isUploading" @click="fileInput?.click()">
            <AppIcon name="paperclip" :size="14" color="#fff" />
            {{ documentStore.isUploading ? 'Memproses PDF...' : 'Unggah Silabus PDF' }}
          </button>
        </div>
      </header>

      <section data-tour="dashboard-featured-tools" style="margin-bottom: 34px;">
        <div class="section-heading">
          <div>
            <AppIcon name="flame" :size="18" />
            <h2>Tools Pilihan Hari Ini</h2>
            <span>dipilihkan khusus untuk {{ major }}</span>
          </div>
          <button class="btn-ghost compact" type="button" @click="openTour">
            <AppIcon name="sparkles" :size="12" /> Tutorial
          </button>
        </div>

        <div class="tool-grid-3">
          <article v-for="tool in featuredTools" :key="tool.id" class="card tool-card">
            <div class="card-meta">
              <span :class="tagClass(tool.category)">{{ tool.category }}</span>
              <span class="price-badge" :style="{ background: pricingMeta(tool.pricingType).bg, color: pricingMeta(tool.pricingType).color }">
                {{ pricingMeta(tool.pricingType).label }}
              </span>
            </div>
            <div class="tool-title">
              <h3>{{ tool.name }}</h3>
              <AppIcon :name="tool.iconKey" :size="24" />
            </div>
            <p>{{ tool.desc }}</p>
            <div class="rating">★★★★★ <span>{{ tool.rating }}</span></div>
            <div class="tool-actions">
              <button class="btn-secondary" type="button" :disabled="savedToolNames.has(tool.name.toLowerCase())" @click="saveTool(tool)">
                {{ savedToolNames.has(tool.name.toLowerCase()) ? 'Tersimpan' : 'Simpan' }}
              </button>
              <a class="btn-primary link-button" :href="`https://${tool.url}`" target="_blank" rel="noreferrer">
                Buka <AppIcon name="external-link" :size="14" color="#fff" />
              </a>
            </div>
          </article>
        </div>

        <div v-if="!showAllFeatured && mockTools.length > 6" class="center-action">
          <button class="btn-ghost" type="button" @click="showAllFeatured = true">
            Lihat Semua <AppIcon name="arrow-right" :size="14" />
          </button>
        </div>
      </section>

      <div class="filter-tabs">
        <button
          v-for="filter in filters"
          :key="filter"
          type="button"
          :class="{ active: activeFilter === filter }"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <section>
        <div class="section-heading">
          <div>
            <AppIcon name="news" :size="18" />
            <h2>Semua Tools Hari Ini</h2>
            <span class="count-pill">{{ filteredTools.length }} tools</span>
          </div>
        </div>
        <div class="tool-grid-3">
          <article v-for="tool in filteredTools" :key="tool.id" class="card tool-card small">
            <div class="card-meta">
              <span :class="tagClass(tool.category)">{{ tool.category }}</span>
              <span class="price-badge" :style="{ background: pricingMeta(tool.pricingType).bg, color: pricingMeta(tool.pricingType).color }">
                {{ pricingMeta(tool.pricingType).label }}
              </span>
            </div>
            <div class="tool-title">
              <h3>{{ tool.name }}</h3>
              <AppIcon :name="tool.iconKey" :size="20" />
            </div>
            <p>{{ tool.desc }}</p>
            <div class="tool-actions">
              <button class="btn-secondary" type="button" :disabled="savedToolNames.has(tool.name.toLowerCase())" @click="saveTool(tool)">
                {{ savedToolNames.has(tool.name.toLowerCase()) ? 'Tersimpan' : 'Simpan' }}
              </button>
            </div>
          </article>
        </div>
      </section>

      <div class="tip-banner">
        <AppIcon name="lamp" :size="28" />
        <div>
          <p>Tips Produktivitas Hari Ini</p>
          <span>Ceritakan tugasmu ke Leva, lalu workspace akan memecahnya jadi langkah kecil dan menyarankan tools terbaik.</span>
        </div>
        <button class="btn-primary" type="button" @click="router.push({ name: 'chat' })">
          Coba Sekarang <AppIcon name="arrow-right" :size="14" color="#fff" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-header,
.section-heading,
.section-heading > div,
.tool-title,
.tool-actions,
.card-meta,
.tip-banner,
.dashboard-actions,
.center-action {
  display: flex;
}

.dashboard-header {
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 28px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dashboard-header p {
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.dashboard-actions {
  align-items: flex-end;
  flex-direction: column;
  gap: 8px;
}

.dashboard-actions .btn-primary,
.tip-banner .btn-primary,
.link-button {
  width: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.section-heading {
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.section-heading > div {
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.section-heading h2 {
  margin: 0;
  font-size: 18px;
}

.section-heading span {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.compact {
  padding: 7px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tool-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tool-card {
  padding: 22px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(108, 99, 255, 0.15);
}

.tool-card.small {
  padding: 16px;
}

.card-meta {
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
}

.price-badge,
.count-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}

.count-pill {
  background: var(--color-primary-light);
  color: var(--color-primary) !important;
}

.tool-title {
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.tool-title h3 {
  margin: 0;
  font-size: 16px;
}

.tool-card p {
  margin: 0 0 12px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.55;
}

.rating {
  color: #F59E0B;
  font-size: 12px;
  font-weight: 700;
}

.rating span {
  color: var(--color-text-secondary);
  margin-left: 4px;
  font-weight: 500;
}

.tool-actions {
  gap: 8px;
  margin-top: 16px;
}

.tool-actions > * {
  flex: 1;
  justify-content: center;
}

.center-action {
  justify-content: center;
  margin-top: 14px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.filter-tabs button {
  border: none;
  border-radius: 999px;
  padding: 7px 16px;
  cursor: pointer;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}

.filter-tabs button.active {
  background: var(--color-primary);
  color: #fff;
}

.tip-banner {
  margin-top: 34px;
  align-items: center;
  gap: 16px;
  background: var(--color-primary-light);
  border: 1px solid rgba(108, 99, 255, 0.2);
  border-radius: 16px;
  padding: 20px 24px;
}

.tip-banner div {
  flex: 1;
}

.tip-banner p {
  margin: 0;
  font-weight: 700;
}

.tip-banner span {
  display: block;
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.skeleton-line {
  height: 20px;
  background: var(--color-border);
  border-radius: 8px;
  margin-bottom: 10px;
  animation: pulse 1.5s infinite;
}

@media (max-width: 768px) {
  .dashboard-header,
  .tip-banner {
    flex-direction: column;
  }

  .dashboard-actions {
    width: 100%;
    align-items: stretch;
  }

  .dashboard-actions .btn-primary,
  .tip-banner .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
