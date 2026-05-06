import { defineStore } from 'pinia'
import { mockSavedTools } from '../data/mockData'

const SAVED_TOOLS_KEY = 'leva_saved_tools'

const loadSavedTools = () => {
  const raw = localStorage.getItem(SAVED_TOOLS_KEY)
  if (!raw) return [...mockSavedTools]

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [...mockSavedTools]
  } catch {
    return [...mockSavedTools]
  }
}

export const useAppStore = defineStore('app', {
  state: () => ({
    activeTask: null,
    savedTools: loadSavedTools(),
    toasts: [],
    soundEnabled: true,
  }),
  actions: {
    persistSavedTools() {
      localStorage.setItem(SAVED_TOOLS_KEY, JSON.stringify(this.savedTools))
    },
    showToast(message, type = 'info') {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      this.toasts.push({ id, message, type })
      window.setTimeout(() => this.dismissToast(id), 3200)
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    saveToolToLibrary(tool) {
      const exists = this.savedTools.some((item) => item.name.toLowerCase() === tool.name.toLowerCase())
      if (exists) {
        this.showToast(`Tool ${tool.name} sudah ada di Library.`, 'info')
        return false
      }

      this.savedTools = [{
        id: Date.now(),
        name: tool.name,
        url: tool.url,
        priority: 'Sangat Bagus',
        priorityKey: 'good',
        pricingType: tool.pricingType ?? 'freemium',
        category: tool.category,
        keywords: [tool.category.toLowerCase(), 'ai tools', 'leva'],
        savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        savedTimestamp: Date.now(),
        description: tool.desc || '',
        rating: tool.rating ?? 0,
        note: '',
      }, ...this.savedTools]
      this.persistSavedTools()
      this.showToast(`${tool.name} berhasil disimpan ke Library.`, 'success')
      return true
    },
    removeToolFromLibrary(toolId) {
      this.savedTools = this.savedTools.filter((tool) => tool.id !== toolId)
      this.persistSavedTools()
      this.showToast('Tool berhasil dihapus dari Library.', 'info')
    },
    addManualTool(tool) {
      this.savedTools = [{
        id: Date.now(),
        priority: 'Sangat Bagus',
        priorityKey: 'good',
        pricingType: 'freemium',
        keywords: [tool.category.toLowerCase(), 'manual', 'leva'],
        savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        savedTimestamp: Date.now(),
        rating: 0,
        ...tool,
        url: tool.url.replace(/^https?:\/\//, ''),
      }, ...this.savedTools]
      this.persistSavedTools()
      this.showToast('Tool manual berhasil ditambahkan.', 'success')
    },
    resetDemoData() {
      this.activeTask = null
      this.savedTools = []
      this.toasts = []
      this.persistSavedTools()
    },
  },
})
