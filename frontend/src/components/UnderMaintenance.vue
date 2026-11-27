<script setup>
defineProps({
  message: { type: String, default: '' },
  estimatedEndTime: { type: String, default: '' }
})
</script>

<template>
  <section class="maintenance">
    <div class="maintenance__mark" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 64 64">
        <path d="M20 42 A16 16 0 1 1 44 42" fill="none" stroke="var(--nxt-amber)" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="35" y1="30" x2="41" y2="20" stroke="var(--nxt-amber)" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="4" fill="var(--nxt-amber)"/>
      </svg>
    </div>
    <h1 class="maintenance__title">NXT Pay is offline for maintenance</h1>
    <p class="maintenance__body">
      {{ message || "We're updating the payment system. Top-ups will be back shortly." }}
    </p>
    <p v-if="estimatedEndTime" class="maintenance__eta">
      Expected back: {{ estimatedEndTime }}
    </p>
  </section>
</template>

<style scoped lang="scss">
.maintenance {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-7) var(--space-5);
}

.maintenance__title {
  font-size: var(--step-2);
  font-weight: 800;
  max-width: 28ch;
}

.maintenance__body {
  color: var(--text-secondary);
  max-width: 32ch;
}

.maintenance__eta {
  font-family: var(--font-meter);
  color: var(--text-muted);
  font-size: var(--step--1);
}
</style>
