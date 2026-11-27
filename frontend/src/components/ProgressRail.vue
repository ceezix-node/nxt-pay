<script setup>
// A thin amber rail that fills left-to-right, standing in for the
// generic numbered stepper — it reads as "charging up" toward
// completion, which is the one motif this product already owns.
defineProps({
  step: { type: Number, required: true },   // 1-indexed current step
  total: { type: Number, required: true },
  label: { type: String, default: '' }
})
</script>

<template>
  <div class="rail" role="progressbar" :aria-valuenow="step" :aria-valuemin="1" :aria-valuemax="total">
    <div class="rail__track">
      <div class="rail__fill" :style="{ width: `${(step / total) * 100}%` }" />
    </div>
    <p v-if="label" class="rail__label">{{ label }}</p>
  </div>
</template>

<style scoped lang="scss">
.rail__track {
  height: 3px;
  border-radius: var(--radius-pill);
  background: var(--surface-sunken);
  overflow: hidden;
}

.rail__fill {
  height: 100%;
  background: var(--nxt-amber);
  transition: width var(--motion-base) var(--ease-standard);
}

.rail__label {
  margin-top: var(--space-2);
  font-size: var(--step--1);
  color: var(--text-secondary);
}
</style>
