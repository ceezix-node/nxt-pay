<script setup>
import { ref } from 'vue'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()
const search = ref('')

// Placeholder rows — wire to `fetchTransactionHistory` / an agent-scoped
// endpoint once that surface lands on the NXT backend.
const assistedTransactions = ref([
  { id: 'TXN-88213', meterNumber: '04-118820', amount: 500, currency: 'NGN', status: 'complete', customer: 'K. Achieng' },
  { id: 'TXN-88214', meterNumber: '04-118904', amount: 1000, currency: 'NGN', status: 'pending', customer: 'J. Otieno' }
])
</script>

<template>
  <section class="agent">
    <header class="agent__header">
      <p class="agent__eyebrow">{{ session.profile?.full_name ?? 'Agent' }}</p>
      <h1 class="agent__title">Assisted top-ups</h1>
    </header>

    <label class="field-label visually-hidden" for="agent-search">Search customer or meter</label>
    <input
      id="agent-search"
      v-model="search"
      class="field-input"
      type="text"
      placeholder="Search meter or customer"
    />

    <ul class="agent__list">
      <li v-for="txn in assistedTransactions" :key="txn.id" class="agent__row">
        <div>
          <p class="agent__customer">{{ txn.customer }}</p>
          <p class="agent__meter meter-figure">{{ txn.meterNumber }}</p>
        </div>
        <div class="agent__amount-col">
          <p class="agent__amount meter-figure">{{ txn.amount }} {{ txn.currency }}</p>
          <p class="agent__status" :class="`agent__status--${txn.status}`">{{ txn.status }}</p>
        </div>
      </li>
    </ul>

    <RouterLink class="btn btn--primary" to="/top-up-meter">Start assisted top-up</RouterLink>
  </section>
</template>

<style scoped lang="scss">
.agent {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
}

.agent__eyebrow {
  color: var(--text-secondary);
  font-size: var(--step--1);
}

.agent__title {
  font-size: var(--step-3);
  font-weight: 800;
}

.field-input {
  font-size: var(--step-0);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-primary);
}

.agent__list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hairline);
  flex: 1;
}

.agent__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--hairline);
}

.agent__customer { font-weight: 600; margin-bottom: var(--space-1); }
.agent__meter { font-size: var(--step--1); color: var(--text-secondary); }
.agent__amount-col { text-align: right; }
.agent__amount { font-weight: 600; margin-bottom: var(--space-1); }

.agent__status {
  font-size: var(--step--1);
  text-transform: lowercase;

  &--complete { color: var(--nxt-teal); }
  &--pending { color: var(--nxt-amber-deep); }
}

.btn {
  display: block;
  text-align: center;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--step-1);
  font-weight: 700;
  background: var(--nxt-amber);
  color: var(--nxt-ink);
  text-decoration: none;
}
</style>
