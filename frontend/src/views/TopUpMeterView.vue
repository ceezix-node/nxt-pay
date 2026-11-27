<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useTopUpStore } from '@/stores/topup'
import { payWithFlutterwave } from '@/lib/flutterwave'
import { recordTopUp, isBackendHealthy, savePendingTopUp, clearPendingTopUp, retryPendingTopUps } from '@/lib/api'
import ProgressRail from '@/components/ProgressRail.vue'
import MeterDial from '@/components/MeterDial.vue'

const router = useRouter()
const session = useSessionStore()
const topup = useTopUpStore()

const step = ref(topup.meterNumber ? 2 : 1)
const totalSteps = 3

const meterNumber = ref(topup.meterNumber)
const lookupState = ref('idle') // idle | checking | found | not-found
const accountName = ref(topup.accountName)

const quickAmounts = [200, 500, 1000, 2000]
const amount = ref(topup.amount)
const customAmount = ref('')
const isPaying = ref(false)
const payError = ref('')
const creditPending = ref(false)
onMounted(() => { retryPendingTopUps() })

const stepLabel = computed(() => {
  if (step.value === 1) return 'Step 1 of 3 · Find your meter'
  if (step.value === 2) return 'Step 2 of 3 · Choose an amount'
  return 'Step 3 of 3 · Pay'
})

async function lookupMeter() {
  if (!meterNumber.value) return
  lookupState.value = 'checking'
  // In production this calls the NXT backend to resolve the meter to an
  // account name before money moves — never send a customer straight to
  // checkout without confirming whose meter they're funding.
  await new Promise((r) => setTimeout(r, 600))
  accountName.value = 'K. Achieng'
  lookupState.value = 'found'
  topup.setMeter({ meterNumber: meterNumber.value, accountName: accountName.value })
  step.value = 2
}

function chooseAmount(value) {
  amount.value = value
  customAmount.value = ''
  topup.setAmount(value)
}

function useCustomAmount() {
  const value = Number(customAmount.value)
  if (value > 0) {
    amount.value = value
    topup.setAmount(value)
  }
}

async function pay() {
  if (!amount.value) return
  isPaying.value = true
  payError.value = ''
  try {
    if (!(await isBackendHealthy())) {
      payError.value = 'Payments are temporarily unavailable. You have not been charged. Please try again later.'
      isPaying.value = false
      return
    }
    await payWithFlutterwave({
      amount: amount.value,
      currency: topup.currency,
      meterNumber: meterNumber.value,
      customerEmail: session.user?.email ?? 'guest@nxtpay.app',
      customerPhone: session.profile?.phone,
      customerName: accountName.value,
      onSuccessful: async (response) => {
        const payload = {
          txRef: response.tx_ref,
          flutterwaveTxId: response.transaction_id,
          meterNumber: meterNumber.value,
          amount: amount.value,
          currency: topup.currency
        }
        savePendingTopUp(payload)
        try {
          const receipt = await recordTopUp(payload)
          clearPendingTopUp(payload.txRef)
          topup.completeWithReceipt(receipt)
          isPaying.value = false
          router.push({ name: 'top-up-success' })
        } catch {
          creditPending.value = true
          isPaying.value = false
          payError.value = 'Payment received but crediting is delayed. Do not pay again. Reference: ' + payload.txRef
        }
      },
      onClose: () => {
        isPaying.value = false
      }
    })
  } catch {
    payError.value = "We couldn't open checkout. Check your connection and try again."
    isPaying.value = false
  }
}

function goBack() {
  if (step.value > 1) {
    step.value -= 1
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <section class="topup">
    <header class="topup__header">
      <button class="topup__back" type="button" aria-label="Back" @click="goBack">←</button>
      <ProgressRail :step="step" :total="totalSteps" :label="stepLabel" />
    </header>

    <!-- Step 1: find meter -->
    <div v-if="step === 1" class="topup__step">
      <h1 class="topup__title">Whose meter are we topping up?</h1>
      <label class="field-label" for="meter-number">Meter number</label>
      <input
        id="meter-number"
        v-model="meterNumber"
        class="field-input meter-figure"
        type="text"
        inputmode="numeric"
        placeholder="04-118820"
        @keyup.enter="lookupMeter"
      />
      <p v-if="lookupState === 'not-found'" class="topup__error">
        We couldn't find that meter. Double-check the number and try again.
      </p>
      <div class="topup__spacer" />
      <button class="btn btn--primary" type="button" :disabled="!meterNumber || lookupState === 'checking'" @click="lookupMeter">
        {{ lookupState === 'checking' ? 'Looking up meter…' : 'Continue' }}
      </button>
    </div>

    <!-- Step 2: amount -->
    <div v-else-if="step === 2" class="topup__step">
      <h1 class="topup__title">How much would you like to add?</h1>
      <p class="topup__meter-confirm">
        Meter <span class="meter-figure">{{ meterNumber }}</span> · {{ accountName }}
      </p>

      <div class="amount-grid">
        <button
          v-for="value in quickAmounts"
          :key="value"
          class="amount-chip"
          :class="{ 'amount-chip--active': amount === value }"
          type="button"
          @click="chooseAmount(value)"
        >
          <span class="meter-figure">{{ value }}</span>
          <span class="amount-chip__unit">{{ topup.currency }}</span>
        </button>
      </div>

      <label class="field-label" for="custom-amount">Or enter a custom amount</label>
      <input
        id="custom-amount"
        v-model="customAmount"
        class="field-input meter-figure"
        type="text"
        inputmode="decimal"
        placeholder="0"
        @input="useCustomAmount"
      />

      <div class="topup__spacer" />
      <button class="btn btn--primary" type="button" :disabled="!amount" @click="step = 3">
        Continue to pay
      </button>
    </div>

    <!-- Step 3: pay -->
    <div v-else class="topup__step">
      <h1 class="topup__title">Confirm and pay</h1>

      <dl class="summary">
        <div class="summary__row">
          <dt>Meter</dt>
          <dd class="meter-figure">{{ meterNumber }}</dd>
        </div>
        <div class="summary__row">
          <dt>Account</dt>
          <dd>{{ accountName }}</dd>
        </div>
        <div class="summary__row summary__row--total">
          <dt>Amount</dt>
          <dd><MeterDial :value="amount" :unit="topup.currency" tone="amber" /></dd>
        </div>
      </dl>

      <p v-if="payError" class="topup__error">{{ payError }}</p>

      <div class="topup__spacer" />
      <button class="btn btn--primary" type="button" :disabled="isPaying || creditPending" @click="pay">
        {{ isPaying ? 'Opening checkout…' : `Pay ${amount} ${topup.currency}` }}
      </button>
      <p class="topup__fine-print">You'll complete payment securely with Flutterwave. Your token is issued the moment payment clears.</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.topup {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-5);
  gap: var(--space-6);
}

.topup__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.topup__back {
  background: none;
  border: none;
  font-size: var(--step-2);
  color: var(--text-primary);
  padding: 0;
  line-height: 1;
}

.topup__step {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.topup__title {
  font-size: var(--step-3);
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: var(--space-2);
}

.topup__meter-confirm {
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
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

  &:focus { border-color: var(--nxt-amber); }
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.amount-chip {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  font-size: var(--step-2);
  font-weight: 600;
  color: var(--text-primary);

  &--active {
    border-color: var(--nxt-amber);
    background: color-mix(in srgb, var(--nxt-amber) 14%, var(--surface-raised));
  }
}

.amount-chip__unit {
  font-size: var(--step--1);
  color: var(--text-secondary);
}

.summary {
  border-top: 1px solid var(--hairline);
  margin: 0;
}

.summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--hairline);

  dt { color: var(--text-secondary); font-size: var(--step--1); }
  dd { margin: 0; font-weight: 600; }
}

.summary__row--total dt { font-size: var(--step-0); color: var(--text-primary); }

.topup__error {
  color: var(--nxt-brick);
  background: var(--nxt-brick-soft);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--step--1);
}

.topup__fine-print {
  font-size: var(--step--1);
  color: var(--text-muted);
  text-align: center;
}

.topup__spacer { flex: 1; }

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
</style>
