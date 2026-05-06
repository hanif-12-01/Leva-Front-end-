<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import Modal from '../components/Modal.vue'
import AppIcon from '../components/AppIcon.vue'

const router = useRouter()
const appStore = useAppStore()
const priorityFilter = ref('Semua')
const categoryFilter = ref('Semua')
const searchVal = ref('')
const sortBy = ref('latest')
const showAddModal = ref(false)
const toolToDelete = ref(null)
const newTool = ref({ name: '', url: '', note: '', category: 'Research' })

const priorityFilters = ['Semua', 'Prioritas Tinggi', 'Sangat Bagus', 'Coba Nanti']
const categoryFilters = ['Semua', 'Research', 'Writing', 'Coding', 'Data', 'Academic', 'Productivity']
const sortOptions = [
  { value: 'latest', label: 'Terbaru disimpan' },
  { value: 'oldest', label: 'Terlama disimpan' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
]

const pricingMeta = (pricingType) => ({
  free: { label: 'Free', bg: '#DCFCE7', color: '#15803D' },
  freemium: { label: 'Freemium', bg: '#FEF3C7', color: '#B45309' },
  paid: { label: 'Berbayar', bg: '#FEE2E2', color: '#B91C1C' },
  opensource: { label: 'Open-source', bg: '#DBEAFE', color: '#1D4ED8' },
}[pricingType] || { label: 'Freemium', bg: '#FEF3C7', color: '#B45309' })

const priorityClass = (key) => ({
  high: 'badge-priority-high',
  good: 'badge-priority-good',
  later: 'badge-priority-later',
}[key] || 'badge-priority-later')

const filteredTools = computed(() => {
  const keyword = searchVal.value.trim().toLowerCase()
  const base = appStore.savedTools.filter((tool) => {
    const matchPriority = priorityFilter.value === 'Semua' || tool.priority === priorityFilter.value
    const matchCategory = categoryFilter.value === 'Semua' || tool.category === categoryFilter.value
    const haystack = [tool.name, tool.description, tool.note, tool.keywords?.join(' ')].filter(Boolean).join(' ').toLowerCase()
    return matchPriority && matchCategory && (!keyword || haystack.includes(keyword))
  })

  return [...base].sort((a, b) => {
    if (sortBy.value === 'oldest') return (a.savedTimestamp || 0) - (b.savedTimestamp || 0)
    if (sortBy.value === 'az') return a.name.localeCompare(b.name, 'id-ID')
    if (sortBy.value === 'za') return b.name.localeCompare(a.name, 'id-ID')
    return (b.savedTimestamp || 0) - (a.savedTimestamp || 0)
  })
})

const addTool = () => {
  if (!newTool.value.name.trim() || !newTool.value.url.trim()) return
  appStore.addManualTool({ ...newTool.value })
  newTool.value = { name: '', url: '', note: '', category: 'Research' }
  showAddModal.value = false
}

const confirmDelete = () => {
  if (!toolToDelete.value) return
  appStore.removeToolFromLibrary(toolToDelete.value.id)
  toolToDelete.value = null
}

const resetFilters = () => {
  priorityFilter.value = 'Semua'
  categoryFilter.value = 'Semua'
  searchVal.value = ''
  sortBy.value = 'latest'
}
</script>

<template>
  <div class="main-content view-enter" style="padding: 32px 36px; max-width: 1100px; margin: 0 auto;">
    <header class="library-header">
      <div>
        <h1><AppIcon name="library" :size="22" /> Library Tools Saya</h1>
        <p>Koleksi alat AI yang sudah kamu simpan, lengkap dengan filter dan prioritas.</p>
      </div>
      <button class="btn-primary" type="button" @click="showAddModal = true">
        <AppIcon name="plus" :size="14" color="#fff" /> Tambah Manual
      </button>
    </header>

    <section v-if="appStore.savedTools.length === 0" class="empty-library">
      <AppIcon name="folder" :size="52" color="#94A3B8" />
      <h2>Library-mu masih kosong</h2>
      <p>Mulai simpan tools dari Dashboard atau Chat & Task untuk membangun koleksimu.</p>
      <button class="btn-primary" type="button" @click="router.push({ name: 'dashboard' })">
        Ke Dashboard <AppIcon name="arrow-right" :size="14" color="#fff" />
      </button>
    </section>

    <template v-else>
      <div class="stats-grid library-stats">
        <div class="card stat-card">
          <AppIcon name="folder" :size="22" />
          <div><strong>{{ appStore.savedTools.length }}</strong><span>Total Tools</span></div>
        </div>
        <div class="card stat-card">
          <AppIcon name="flame" :size="22" />
          <div><strong>{{ appStore.savedTools.filter(t => t.priorityKey === 'high').length }}</strong><span>Prioritas Tinggi</span></div>
        </div>
        <div class="card stat-card">
          <AppIcon name="check" :size="22" />
          <div><strong>{{ appStore.savedTools.filter(t => t.priorityKey === 'good').length }}</strong><span>Sangat Bagus</span></div>
        </div>
      </div>

      <div class="library-layout">
        <aside class="filter-panel">
          <input v-model="searchVal" placeholder="Cari nama tool, tag, atau kategori..." />
          <p>PRIORITAS</p>
          <button v-for="filter in priorityFilters" :key="filter" type="button" :class="{ active: priorityFilter === filter }" @click="priorityFilter = filter">
            {{ filter }}
          </button>
          <p>KATEGORI</p>
          <button v-for="filter in categoryFilters" :key="filter" type="button" :class="{ active: categoryFilter === filter }" @click="categoryFilter = filter">
            {{ filter }}
          </button>
        </aside>

        <section class="library-results">
          <div class="result-toolbar">
            <p>Menampilkan <strong>{{ filteredTools.length }}</strong> dari {{ appStore.savedTools.length }} tools</p>
            <label>
              Urutkan:
              <select v-model="sortBy">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
          </div>

          <div v-if="filteredTools.length === 0" class="no-results">
            <AppIcon name="search" :size="44" color="#94A3B8" />
            <p>Tidak ada tools yang cocok dengan filter ini.</p>
            <button class="btn-secondary" type="button" @click="resetFilters">Reset Filter</button>
          </div>

          <div v-else class="library-grid">
            <article v-for="tool in filteredTools" :key="tool.id" class="card saved-card">
              <div class="saved-top">
                <div>
                  <h3>{{ tool.name }}</h3>
                  <p><AppIcon name="link" :size="12" /> {{ tool.url }}</p>
                </div>
                <div class="badge-wrap">
                  <span class="price-badge" :style="{ background: pricingMeta(tool.pricingType).bg, color: pricingMeta(tool.pricingType).color }">
                    {{ pricingMeta(tool.pricingType).label }}
                  </span>
                  <span :class="priorityClass(tool.priorityKey)">{{ tool.priority }}</span>
                </div>
              </div>
              <div class="tool-info">
                <span>{{ tool.category }}</span>
                <span>Disimpan {{ tool.savedAt }}</span>
              </div>
              <p v-if="tool.note" class="note">{{ tool.note }}</p>
              <div class="keywords">
                <span v-for="keyword in tool.keywords" :key="keyword">#{{ keyword }}</span>
              </div>
              <div class="saved-actions">
                <a class="btn-primary" :href="`https://${tool.url}`" target="_blank" rel="noreferrer">
                  Buka Tool <AppIcon name="external-link" :size="14" color="#fff" />
                </a>
                <button type="button" @click="toolToDelete = tool">
                  <AppIcon name="trash" :size="14" /> Hapus
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </template>

    <Modal v-if="showAddModal" title="Tambah Tool Baru" @close="showAddModal = false">
      <div class="modal-form">
        <label>Nama Tool *</label>
        <input v-model="newTool.name" placeholder="Contoh: Perplexity AI" />
        <label>URL Tool *</label>
        <input v-model="newTool.url" placeholder="https://perplexity.ai" />
        <label>Kategori</label>
        <select v-model="newTool.category">
          <option v-for="category in categoryFilters.filter(item => item !== 'Semua')" :key="category" :value="category">{{ category }}</option>
        </select>
        <label>Catatan</label>
        <textarea v-model="newTool.note" rows="3" placeholder="Untuk apa tool ini?"></textarea>
        <div class="modal-actions">
          <button class="btn-ghost" type="button" @click="showAddModal = false">Batal</button>
          <button class="btn-primary" type="button" @click="addTool">Tambah</button>
        </div>
      </div>
    </Modal>

    <Modal v-if="toolToDelete" title="Hapus Tool?" @close="toolToDelete = null">
      <p style="margin: 0 0 16px; color: var(--color-text-secondary); line-height: 1.6;">
        Apakah kamu yakin ingin menghapus {{ toolToDelete.name }} dari Library?
      </p>
      <div class="modal-actions">
        <button class="btn-ghost" type="button" @click="toolToDelete = null">Batal</button>
        <button class="danger-button" type="button" @click="confirmDelete">Hapus</button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.library-header,
.library-header h1,
.library-header .btn-primary,
.stat-card,
.saved-top,
.saved-top p,
.tool-info,
.keywords,
.saved-actions,
.result-toolbar,
.badge-wrap,
.modal-actions {
  display: flex;
}

.library-header {
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 26px;
}

.library-header h1 {
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 24px;
}

.library-header p {
  margin: 6px 0 0;
  color: var(--color-text-secondary);
}

.library-header .btn-primary,
.empty-library .btn-primary {
  width: auto;
  align-items: center;
  gap: 6px;
}

.empty-library {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-library p {
  color: var(--color-text-secondary);
}

.library-stats {
  margin-bottom: 24px;
}

.stat-card {
  padding: 14px 18px;
  align-items: center;
  gap: 12px;
}

.stat-card strong {
  display: block;
  font-size: 22px;
  color: var(--color-primary);
}

.stat-card span {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.library-layout {
  display: flex;
  gap: 24px;
}

.filter-panel {
  width: 210px;
  flex-shrink: 0;
}

.filter-panel input,
.modal-form input,
.modal-form select,
.modal-form textarea,
.result-toolbar select {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  padding: 10px 12px;
  font-size: 13px;
  background: #fff;
  color: var(--color-text-primary);
}

.filter-panel p {
  margin: 20px 0 8px;
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-secondary);
  letter-spacing: 0.07em;
}

.filter-panel button {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: 8px;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
}

.filter-panel button.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 700;
}

.library-results {
  flex: 1;
  min-width: 0;
}

.result-toolbar {
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.result-toolbar p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.result-toolbar label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.saved-card {
  padding: 18px 20px;
}

.saved-top {
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.saved-top h3 {
  margin: 0 0 4px;
  font-size: 15px;
}

.saved-top p {
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.badge-wrap {
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.price-badge,
.badge-wrap span {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.tool-info {
  gap: 8px;
  margin: 10px 0;
  align-items: center;
}

.tool-info span:first-child {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
}

.tool-info span:last-child,
.note {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.keywords {
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.keywords span {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 2px 8px;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.saved-actions {
  gap: 8px;
}

.saved-actions .btn-primary {
  flex: 2;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.saved-actions button {
  flex: 1;
  border: 1px solid #FEE2E2;
  background: #FFF5F5;
  color: #DC2626;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.no-results {
  text-align: center;
  padding: 56px 20px;
}

.no-results p {
  color: var(--color-text-secondary);
}

.modal-form label {
  display: block;
  margin: 10px 0 6px;
  font-size: 13px;
  font-weight: 700;
}

.modal-form textarea {
  resize: vertical;
}

.modal-actions {
  gap: 10px;
  margin-top: 16px;
}

.modal-actions > * {
  flex: 1;
}

.danger-button {
  background: #DC2626;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .library-header,
  .library-layout {
    flex-direction: column;
  }

  .filter-panel {
    width: 100%;
  }
}
</style>
