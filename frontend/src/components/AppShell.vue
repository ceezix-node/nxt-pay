<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__brand" aria-hidden="true">
      <span class="app-shell__mark">NXT Pay</span>
    </header>
    <main class="app-shell__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  background: var(--surface-app);
}

.app-shell__brand {
  padding: var(--space-5) var(--space-5) 0;
}

.app-shell__mark {
  font-family: var(--font-meter);
  font-size: var(--step--1);
  letter-spacing: 0.02em;
  color: var(--text-muted);
}

.app-shell__main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
