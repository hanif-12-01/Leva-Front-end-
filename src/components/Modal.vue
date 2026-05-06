<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const dialogRef = ref(null);
let previousOverflow = '';
let previousActiveElement = null;

const close = () => {
  emit('close');
};

const focusableElements = () => {
  if (!dialogRef.value) return [];
  return Array.from(
    dialogRef.value.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
};

const setInitialFocus = () => {
  const candidates = focusableElements();
  if (candidates.length > 0) {
    candidates[0].focus();
    return;
  }
  dialogRef.value?.focus();
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape') close();
  if (event.key !== 'Tab') return;

  const candidates = focusableElements();
  if (candidates.length === 0) {
    event.preventDefault();
    dialogRef.value?.focus();
    return;
  }

  const firstEl = candidates[0];
  const lastEl = candidates[candidates.length - 1];
  const activeEl = document.activeElement;

  if (!event.shiftKey && activeEl === lastEl) {
    event.preventDefault();
    firstEl.focus();
  }

  if (event.shiftKey && activeEl === firstEl) {
    event.preventDefault();
    lastEl.focus();
  }
};

onMounted(() => {
  previousOverflow = document.body.style.overflow;
  previousActiveElement = document.activeElement;

  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', handleKeyDown);

  nextTick(() => {
    setInitialFocus();
  });
});

onUnmounted(() => {
  document.body.style.overflow = previousOverflow;
  window.removeEventListener('keydown', handleKeyDown);
  if (previousActiveElement instanceof HTMLElement) {
    previousActiveElement.focus();
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      class="modal-overlay"
      style="position: fixed; inset: 0; z-index: 4000; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 16px;"
      @click="close"
    >
      <div
        ref="dialogRef"
        class="card modal-surface"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        :tabindex="-1"
        style="width: 100%; max-width: 420px; max-height: calc(100vh - 32px); overflow-y: auto; padding: 24px; position: relative;"
        @click.stop
      >
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--color-text-primary);">
            {{ title }}
          </h2>
          <button
            @click="close"
            aria-label="Tutup dialog"
            style="background: var(--color-bg); border: none; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 16px; color: var(--color-text-secondary);"
          >
            ✕
          </button>
        </div>

        <!-- Content -->
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>