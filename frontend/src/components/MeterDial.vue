<script setup>
// Renders any headline figure (balance, amount, kWh) in the meter-mono
// treatment, with the unit set quietly beside it rather than as an
// all-caps label above.
defineProps({
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  tone: { type: String, default: 'ink' } // 'ink' | 'amber' | 'teal'
})
</script>

<template>
  <p class="dial" :class="`dial--${tone}`">
    <span class="dial__value meter-figure">{{ value }}</span>
    <span v-if="unit" class="dial__unit">{{ unit }}</span>
  </p>
</template>

<style scoped lang="scss">
.dial {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin: 0;
}

.dial__value {
  font-size: var(--step-5);
  font-weight: 600;
  line-height: 1;
}

.dial__unit {
  font-size: var(--step-1);
  color: var(--text-secondary);
}

.dial--amber .dial__value { color: var(--nxt-amber-deep); }
.dial--teal .dial__value { color: var(--nxt-teal); }
</style>
