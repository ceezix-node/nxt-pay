<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useTopUpStore } from '@/stores/topup'
import MeterDial from '@/components/MeterDial.vue'

const router = useRouter()
const session = useSessionStore()
const topup = useTopUpStore()

const meterInput = ref('')
const recentMeters = []

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

function startTopUp(meterNumber) {
  const normalized = String(meterNumber ?? '').replace(/\D/g, '')
  if (!/^\d{11}$/.test(normalized)) return
  topup.setMeter({ meterNumber: normalized, accountName: session.profile?.full_name ?? '' })
  router.push({ name: 'top-up-meter' })
}
</script>

<template>
  <section class="home">
    <div class="home__intro">
      <p class="home__greeting">{{ greeting }}{{ session.profile?.full_name ? `, ${session.profile.full_name.split(' ')[0]}` : '' }}</p>
      <h1 class="home__headline">Keep the lights on.</h1>
    </div>

    <div v-if="recentMeters.length && session.isAuthenticated" class="home__meters">
      <button
        v-for="meter in recentMeters"
        :key="meter.meterNumber"
        class="meter-card"
        type="button"
        @click="startTopUp(meter.meterNumber)"
      >
        <div class="meter-card__info">
          <p class="meter-card__label">{{ meter.label }}</p>
          <p class="meter-card__number meter-figure">{{ meter.meterNumber }}</p>
        </div>
        <MeterDial value="Top up" tone="amber" />
      </button>
    </div>

    <div v-else class="home__entry">
      <label class="field-label" for="meter-number">Meter number</label>
      <input
        id="meter-number"
        v-model="meterInput"
        class="field-input meter-figure"
        type="text"
        inputmode="numeric"
        placeholder="47001890128"
        maxlength="11"
        pattern="[0-9]{11}"
        @input="meterInput = $event.target.value.replace(/\D/g, '').slice(0, 11)"
        autocomplete="off"
      />
      <p class="home__hint">Find this on your prepaid meter's screen or your last receipt.</p>
    </div>

    <div class="home__spacer" />

    <footer class="home__actions">
      <button
        class="btn btn--primary"
        type="button"
        :disabled="!/^\d{11}$/.test(meterInput)"
        @click="startTopUp(meterInput)"
      >
        Top up meter
      </button>
      <RouterLink v-if="session.isAgent" class="home__agent-link" to="/agent">
        Switch to agent workspace
      </RouterLink>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.home {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6) var(--space-5) var(--space-5);
  gap: var(--space-6);
}

.home__intro {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.home__greeting {
  color: var(--text-secondary);
  font-size: var(--step-0);
}

.home__headline {
  font-size: var(--step-4);
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.home__meters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.meter-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
  text-align: left;
  transition: border-color var(--motion-fast) var(--ease-standard);

  &:hover, &:focus-visible {
    border-color: var(--nxt-amber);
  }
}

.meter-card__label {
  font-size: var(--step--1);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.meter-card__number {
  font-size: var(--step-1);
  font-weight: 600;
}

.home__entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--step--1);
  color: var(--text-secondary);
}

.field-input {
  font-size: var(--step-3);
  font-weight: 600;
  padding: var(--space-4);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-primary);

  &:focus {
    border-color: var(--nxt-amber);
  }
}

.home__hint {
  font-size: var(--step--1);
  color: var(--text-muted);
}

.home__spacer {
  flex: 1;
}

.home__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
}

.btn {
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: none;
  font-size: var(--step-1);
  font-weight: 700;
}

.btn--primary {
  background: var(--nxt-amber);
  color: var(--nxt-ink);

  &:disabled {
    background: var(--surface-sunken);
    color: var(--text-muted);
  }
}

.home__agent-link {
  font-size: var(--step--1);
  color: var(--text-muted);
  text-decoration: underline;
}
</style>
