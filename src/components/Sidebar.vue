<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useDocumentStore } from '../stores/documentStore';
import AppIcon from './AppIcon.vue';
import Modal from './Modal.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const documentStore = useDocumentStore();

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: 'home' },
  { id: 'chat',      label: 'Chat & Task', icon: 'message' },
  { id: 'library',   label: 'Library',     icon: 'library' },
  { id: 'profile',   label: 'Profile',     icon: 'user' },
];

const showSettings = ref(false);
const darkMode = ref(false);
const notif = ref(true);
const soundEnabled = ref(true);
const searchVal = ref('');
const searchInputRef = ref(null);

const user = computed(() => userStore.user);
const activeView = computed(() => route.name || 'dashboard');
const tasks = computed(() => documentStore.tasks || []);

const filteredHistory = computed(() => {
  if (!searchVal.value) return tasks.value;
  return tasks.value.filter(t =>
    t.title?.toLowerCase().includes(searchVal.value.toLowerCase())
  );
});

const handleFocusSearch = () => {
  if (searchInputRef.value) {
    searchInputRef.value.focus();
    searchInputRef.value.select();
  }
};

const handleEscape = () => {
  showSettings.value = false;
};

const handleHistoryClick = (task) => {
  // Misal kalau di Vue kita update state aktif dengan documentStore
  // documentStore.activeTask = task;
  router.push({ name: 'chat' });
};

const handleNewChat = () => {
  window.dispatchEvent(new CustomEvent('leva:new-chat'));
  router.push({ name: 'chat' });
};

const navigateTo = (viewId) => {
  router.push({ name: viewId });
};

const handleOpenTutorial = () => {
  navigateTo('dashboard');
  // Dispatch event setelah tick (atau timeout kecil) agar view terganti dulu
  setTimeout(() => window.dispatchEvent(new CustomEvent('leva:open-dashboard-tour')), 100);
};

onMounted(() => {
  window.addEventListener('leva:focus-sidebar-search', handleFocusSearch);
  window.addEventListener('leva:escape', handleEscape);
  
  if (tasks.value.length === 0) {
    documentStore.fetchTasks().catch(() => {});
  }
});

onUnmounted(() => {
  window.removeEventListener('leva:focus-sidebar-search', handleFocusSearch);
  window.removeEventListener('leva:escape', handleEscape);
});
</script>

<template>
  <aside class="sidebar-desktop" style="width: 240px; min-width: 240px; height: 100vh; background: var(--color-sidebar); display: flex; flex-direction: column; padding: 20px 12px; overflow-y: auto; position: sticky; top: 0;">
    <!-- Logo -->
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding-left: 4px;">
      <AppIcon name="sparkles" :size="20" color="#fff" />
      <span style="color: #fff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Leva</span>
    </div>

    <!-- New Chat Button -->
    <button
      @click="handleNewChat"
      data-tour="sidebar-new-chat"
      style="display: flex; align-items: center; gap: 8px; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: #fff; padding: 9px 12px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 12px; transition: all 0.2s ease;"
      @mouseenter="$event.target.style.background = 'rgba(255,255,255,0.08)'"
      @mouseleave="$event.target.style.background = 'transparent'"
    >
      <AppIcon name="plus" :size="16" color="#fff" /> New Chat
    </button>

    <!-- Search -->
    <div style="position: relative; margin-bottom: 16px;">
      <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); opacity: 0.5; display: flex;">
        <AppIcon name="search" :size="14" color="#fff" />
      </span>
      <input
        ref="searchInputRef"
        v-model="searchVal"
        placeholder="Cari riwayat... (Ctrl+K)"
        style="width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; padding: 8px 10px 8px 30px; color: #fff; font-size: 13px; outline: none;"
      />
    </div>

    <div v-if="activeView === 'dashboard' && searchVal.trim().length > 0 && filteredHistory.length === 0" style="margin-top: -6px; margin-bottom: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 10px;">
      <p style="margin: 0; font-size: 12px; color: var(--color-sidebar-text); line-height: 1.5;">
        Tidak ada riwayat tugas yang cocok. Coba kata kunci lain atau mulai tugas baru.
      </p>
      <button
        @click="handleNewChat"
        style="margin-top: 8px; border: none; background: transparent; color: #C4B5FD; font-size: 12px; font-weight: 700; cursor: pointer; padding: 0;"
      >
        Mulai Chat Baru →
      </button>
    </div>

    <!-- Navigation -->
    <nav style="margin-bottom: 20px;">
      <button
        v-for="item in NAV_ITEMS"
        :key="item.id"
        class="sidebar-item"
        :class="{ active: activeView === item.id }"
        :data-tour="item.id === 'chat' ? 'sidebar-chat' : item.id === 'library' ? 'sidebar-library' : undefined"
        @click="navigateTo(item.id)"
        style="width: 100%; background: transparent; border: none; text-align: left;"
      >
        <span style="display: flex;"><AppIcon :name="item.icon" :size="16" /></span>
        {{ item.label }}
      </button>
      
      <button
        class="sidebar-item"
        @click="showSettings = true"
        style="width: 100%; background: transparent; border: none; text-align: left;"
      >
        <span style="display: flex;"><AppIcon name="settings" :size="16" /></span> Settings
      </button>
      
      <button
        class="sidebar-item"
        @click="handleOpenTutorial"
        style="width: 100%; background: transparent; border: none; text-align: left;"
      >
        <span style="display: flex;"><AppIcon name="sparkles" :size="16" /></span> Lihat Tutorial
      </button>
    </nav>

    <!-- Divider -->
    <div style="height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 14px;"></div>

    <!-- History -->
    <div style="flex: 1; overflow-y: auto;">
      <p style="font-size: 11px; font-weight: 600; color: var(--color-sidebar-text-muted); letter-spacing: 0.08em; margin-bottom: 8px; padding-left: 4px;">
        RIWAYAT TUGAS
      </p>
      <button
        v-for="(task, index) in filteredHistory"
        :key="index"
        @click="handleHistoryClick(task)"
        style="width: 100%; border: none; text-align: left; padding: 8px 10px; border-radius: 9px; cursor: pointer; transition: background 0.2s ease; margin-bottom: 2px; background: transparent;"
        @mouseenter="$event.target.style.background = 'rgba(255,255,255,0.05)'"
        @mouseleave="$event.target.style.background = 'transparent'"
      >
        <p style="margin: 0; font-size: 13px; font-weight: 400; color: var(--color-sidebar-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          {{ task.title || 'Tugas Baru' }}
        </p>
        <p style="margin: 0; font-size: 11px; color: var(--color-sidebar-text-muted); margin-top: 2px;">
          {{ task.date || 'Hari ini' }}
        </p>
      </button>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 14px 0;"></div>

    <!-- User Profile Footer -->
    <button
      @click="navigateTo('profile')"
      style="display: flex; width: 100%; align-items: center; gap: 10px; cursor: pointer; padding: 4px; border: none; background: transparent; text-align: left;"
    >
      <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; flex-shrink: 0;">
        {{ user?.name ? user.name.charAt(0).toUpperCase() : 'L' }}
      </div>
      <div style="overflow: hidden;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          {{ user?.name || 'Mahasiswa' }}
        </p>
        <p style="margin: 0; font-size: 11px; color: var(--color-sidebar-text-muted);">
          {{ user ? `${user.major || 'Teknik'} · Sem ${user.semester || '?'}` : 'Leva Academy' }}
        </p>
      </div>
    </button>

  </aside>

  <!-- Settings Modal -->
  <Modal v-if="showSettings" title="Pengaturan" @close="showSettings = false">
    <div style="display: flex; flex-direction: column; gap: 18px;">
      
      <!-- Settings Options -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text-primary);">Dark Mode</p>
          <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">Ganti tema ke gelap</p>
        </div>
        <button
          @click="darkMode = !darkMode"
          :style="{ background: darkMode ? 'var(--color-primary)' : 'var(--color-border)' }"
          style="width: 44px; height: 24px; border-radius: 12px; cursor: pointer; position: relative; transition: background 0.2s; border: none;"
        >
          <div :style="{ left: darkMode ? '22px' : '3px' }" style="position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.2s;"></div>
        </button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text-primary);">Notifikasi Daily Discovery</p>
          <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">Reminder tools baru setiap hari</p>
        </div>
        <button
          @click="notif = !notif"
          :style="{ background: notif ? 'var(--color-primary)' : 'var(--color-border)' }"
          style="width: 44px; height: 24px; border-radius: 12px; cursor: pointer; position: relative; transition: background 0.2s; border: none;"
        >
          <div :style="{ left: notif ? '22px' : '3px' }" style="position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.2s;"></div>
        </button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text-primary);">Efek Suara</p>
          <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary);">Putar suara saat task selesai</p>
        </div>
        <button
          @click="soundEnabled = !soundEnabled"
          :style="{ background: soundEnabled ? 'var(--color-primary)' : 'var(--color-border)' }"
          style="width: 44px; height: 24px; border-radius: 12px; cursor: pointer; position: relative; transition: background 0.2s; border: none;"
        >
          <div :style="{ left: soundEnabled ? '22px' : '3px' }" style="position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.2s;"></div>
        </button>
      </div>

      <div style="height: 1px; background: var(--color-border);"></div>
      <p style="margin: 0; font-size: 12px; color: var(--color-text-secondary); text-align: center;">
        Leva v1.0.0 · Integrasi Vue-React
      </p>
      
      <button class="btn-primary" @click="showSettings = false" style="width: 100%;">
        Tutup
      </button>
    </div>
  </Modal>
</template>
