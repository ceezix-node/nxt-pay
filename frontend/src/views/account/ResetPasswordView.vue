<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const password = ref('')
const confirm = ref('')
const state = ref('idle') // idle | saving | error
const errorMessage = ref('')

async function submit() {
  if (password.value.length < 8) {
    state.value = 'error'
    errorMessage.value = 'Use at least 8 characters.'
    return
  }
  if (password.value !== confirm.value) {
    state.value = 'error'
    errorMessage.value = "Passwords don't match."
    return
  }
  state.value = 'saving'
  const { error } = await supabase.auth.updateUser({ password: password.value })
  if (error) {
    state.value = 'error'
    errorMessage.value = 'Something went wrong. Try again.'
    return
  }
  router.push({ name: 'home' })
}
</script>

<template>
  <section class="account-page">
    <h1 class="account-page__title">Choose a new password</h1>

    <label class="field-label" for="password">New password</label>
    <input id="password" v-model="password" class="field-input" type="password" autocomplete="new-password" />

    <label class="field-label" for="confirm">Confirm password</label>
    <input id="confirm" v-model="confirm" class="field-input" type="password" autocomplete="new-password" @keyup.enter="submit" />

    <p v-if="state === 'error'" class="account-page__error">{{ errorMessage }}</p>

    <div class="account-page__spacer" />
    <button class="btn btn--primary" type="button" :disabled="state === 'saving'" @click="submit">
      {{ state === 'saving' ? 'Saving…' : 'Save password' }}
    </button>
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
