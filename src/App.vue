<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Toast from './components/Toast.vue'
import AppIcon from './components/AppIcon.vue'
import { useAppStore } from './stores/appStore'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isShellRoute = computed(() => !['login', 'onboarding'].includes(route.name))
const isTypingTarget = (target) => {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

const mobileItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chat', icon: 'message', label: 'Chat' },
  { id: 'library', icon: 'library', label: 'Library' },
  { id: 'profile', icon: 'user', label: 'Profil' },
]

const navigateTo = (name) => {
  router.push({ name })
}

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    window.dispatchEvent(new CustomEvent('leva:escape'))
    return
  }

  if (!isShellRoute.value || isTypingTarget(event.target)) return
  const key = event.key.toLowerCase()

  if ((event.ctrlKey || event.metaKey) && key === 'k') {
    event.preventDefault()
    window.dispatchEvent(new CustomEvent('leva:focus-sidebar-search'))
  }

  if (!event.ctrlKey && !event.metaKey && !event.altKey && key === '/') {
    event.preventDefault()
    window.dispatchEvent(new CustomEvent('leva:focus-sidebar-search'))
  }

  if ((event.ctrlKey || event.metaKey) && key === 'n') {
    event.preventDefault()
    window.dispatchEvent(new CustomEvent('leva:new-chat'))
    router.push({ name: 'chat' })
  }
}

watch(
  () => route.name,
  (name) => {
    const titles = {
      login: 'Leva - Login',
      onboarding: 'Leva - Perkenalan',
      dashboard: 'Leva - Dashboard',
      chat: 'Leva - Chat & Task',
      library: 'Leva - Library',
      profile: 'Leva - Profil',
    }
    document.title = titles[name] || 'Leva'
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <div v-if="isShellRoute" class="app-shell">
    <Sidebar />
    <main class="app-main">
      <RouterView />
    </main>

    <nav class="mobile-bottom-nav">
      <button
        v-for="item in mobileItems"
        :key="item.id"
        type="button"
        :class="{ active: route.name === item.id }"
        @click="navigateTo(item.id)"
      >
        <AppIcon :name="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
    <Toast :toasts="appStore.toasts" @close="appStore.dismissToast" />
  </div>

  <div v-else class="app-container">
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  width: 100%;
}

.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.app-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 600;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.mobile-bottom-nav button {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 700;
}

.mobile-bottom-nav button.active {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .app-main {
    padding-bottom: 72px;
  }
}
</style>
