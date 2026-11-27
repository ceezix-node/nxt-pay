<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const email = ref('')
const state = ref('idle') // idle | sending | sent | error

async function submit() {
  if (!email.value) return
  state.value = 'sending'
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/account/reset-password`
  })
  state.value = error ? 'error' : 'sent'
}
</script>

<template>
  <section class="account-page">
    <h1 class="account-page__title">Reset your password</h1>

    <template v-if="state !== 'sent'">
      <p class="account-page__body">Enter the email on your account and we'll send you a reset link.</p>
      <label class="field-label" for="email">Email</label>
      <input id="email" v-model="email" class="field-input" type="email" autocomplete="email" @keyup.enter="submit" />
      <p v-if="state === 'error'" class="account-page__error">Something went wrong. Try again in a moment.</p>
      <div class="account-page__spacer" />
      <button class="btn btn--primary" type="button" :disabled="!email || state === 'sending'" @click="submit">
        {{ state === 'sending' ? 'Sending…' : 'Send reset link' }}
      </button>
    </template>

    <template v-else>
      <p class="account-page__body">Check {{ email }} for a link to reset your password.</p>
      <RouterLink class="account-page__link" to="/">Back to NXT Pay</RouterLink>
    </template>
  </section>
</template>

<style scoped lang="scss">
.account-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5) var(--space-5);
}
.account-page__title { font-size: var(--step-3); font-weight: 800; }
.account-page__body { color: var(--text-secondary); }
.account-page__error {
  color: var(--nxt-brick);
  background: var(--nxt-brick-soft);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--step--1);
}
.field-label { font-size: var(--step--1); color: var(--text-secondary); }
.field-input {
  font-size: var(--step-1);
  padding: var(--space-4);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-primary);
}
.account-page__spacer { flex: 1; }
.account-page__link {
  color: var(--nxt-amber-deep);
  font-weight: 600;
  text-decoration: underline;
}
.btn {
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: none;
  font-size: var(--step-1);
  font-weight: 700;
  background: var(--nxt-amber);
  color: var(--nxt-ink);

  &:disabled { background: var(--surface-sunken); color: var(--text-muted); }
}
</style>
