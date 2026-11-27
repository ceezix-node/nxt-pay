<script setup>
import { useRouter } from 'vue-router'
import { useTopUpStore } from '@/stores/topup'
import MeterDial from '@/components/MeterDial.vue'

const router = useRouter()
const topup = useTopUpStore()
const receipt = topup.lastReceipt

function startAnother() {
  topup.reset()
  router.push({ name: 'home' })
}
</script>

<template>
  <section class="success">
    <div class="success__mark" aria-hidden="true">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="var(--nxt-teal)" stroke-width="2" />
        <path d="M17 29L24.5 36.5L39 20" stroke="var(--nxt-teal)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <h1 class="success__headline">Token sent.</h1>
    <p class="success__body">
      Your meter will update automatically. If it doesn't within a minute, enter the token below manually.
    </p>

    <dl class="receipt">
      <div class="receipt__row">
        <dt>Meter</dt>
        <dd class="meter-figure">{{ topup.meterNumber || receipt?.meterNumber }}</dd>
      </div>
      <div class="receipt__row receipt__row--total">
        <dt>Amount paid</dt>
        <dd><MeterDial :value="topup.amount ?? receipt?.amount" :unit="topup.currency" tone="teal" /></dd>
      </div>
      <div v-if="receipt?.token" class="receipt__row">
        <dt>Token</dt>
        <dd class="meter-figure">{{ receipt.token }}</dd>
      </div>
      <div class="receipt__row">
        <dt>Reference</dt>
        <dd class="meter-figure">{{ receipt?.reference ?? receipt?.id ?? '—' }}</dd>
      </div>
    </dl>

    <div class="success__spacer" />
    <button class="btn btn--primary" type="button" @click="startAnother">Done</button>
  </section>
</template>

<style scoped lang="scss">
.success {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-7) var(--space-5) var(--space-5);
  gap: var(--space-3);
}

.success__headline {
  font-size: var(--step-4);
  font-weight: 800;
}

.success__body {
  color: var(--text-secondary);
  max-width: 32ch;
}

.receipt {
  width: 100%;
  margin: var(--space-5) 0 0;
  text-align: left;
  border-top: 1px solid var(--hairline);
}

.receipt__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--hairline);

  dt { color: var(--text-secondary); font-size: var(--step--1); }
  dd { margin: 0; font-weight: 600; }
}

.success__spacer { flex: 1; }

.btn {
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: none;
  font-size: var(--step-1);
  font-weight: 700;
  background: var(--nxt-amber);
  color: var(--nxt-ink);
}
</style>
