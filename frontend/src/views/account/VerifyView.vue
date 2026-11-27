<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()
const state = ref('verifying') // verifying | verified | error

onMounted(async () => {
  const tokenHash = route.query.token_hash
  const type = route.query.type
  if (!tokenHash || !type) {
    state.value = 'error'
    return
  }
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
  state.value = error ? 'error' : 'verified'
  if (!error) {
    setTimeout(() => router.push({ name: 'home' }), 1500)
  }
})
</script>

<template>
  <section class="account-page account-page--center">
    <h1 class="account-page__title">
      <template v-if="state === 'verifying'">Verifying your account…</template>
      <template v-else-if="state === 'verified'">You're verified.</template>
      <template v-else>We couldn't verify that link.</template>
    </h1>
    <p v-if="state === 'error'" class="account-page__body">
      The link may have expired. Request a new one from the sign-in screen.
    </p>
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
.account-page--center {
  align-items: center;
  justify-content: center;
  text-align: center;
}
.account-page__title { font-size: var(--step-3); font-weight: 800; }
.account-page__body { color: var(--text-secondary); }
</style>
