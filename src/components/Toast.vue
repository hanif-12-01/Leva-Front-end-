<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  toasts: { type: Array, required: true },
})

const emit = defineEmits(['close'])

const iconByType = (type) => {
  if (type === 'success') return 'check'
  if (type === 'error') return 'warning'
  return 'info'
}
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="`toast-${toast.type || 'info'}`"
      role="status"
    >
      <span class="toast-icon">
        <AppIcon :name="iconByType(toast.type)" :size="16" />
      </span>
      <span class="toast-message">{{ toast.message }}</span>
      <button class="toast-close" type="button" aria-label="Tutup notifikasi" @click="emit('close', toast.id)">
        <AppIcon name="x" :size="14" />
      </button>
    </div>
  </div>
</template>
