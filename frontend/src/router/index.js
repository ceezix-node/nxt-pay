import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/top-up-meter',
    name: 'top-up-meter',
    component: () => import('@/views/TopUpMeterView.vue')
  },
  {
    path: '/top-up-success',
    name: 'top-up-success',
    component: () => import('@/views/TopUpSuccessView.vue')
  },
  {
    path: '/agent',
    name: 'agent',
    component: () => import('@/views/AgentView.vue'),
    meta: { requiresAgent: true }
  },
  {
    path: '/account/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/account/ForgotPasswordView.vue')
  },
  {
    path: '/account/verify',
    name: 'verify',
    component: () => import('@/views/account/VerifyView.vue')
  },
  {
    path: '/account/reset-password',
    name: 'reset-password',
    component: () => import('@/views/account/ResetPasswordView.vue')
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// First-load session synchronization, mirroring nxt-topup's boot sequence:
// hydrate the Supabase session before the first route resolves, and
// refresh the profile for logged-in accounts.
router.beforeEach(async (to) => {
  const session = useSessionStore()

  if (session.user === null) {
    try {
      await session.syncFromSupabase()
    } catch (error) {
      console.error('[NXT Pay] Session initialization failed:', error)

      // Allow public routes to continue loading.
      // Protected routes remain protected below.
    }
  }

  if (to.meta.requiresAgent && session.role !== 'agent') {
    return { name: 'home' }
  }

  return true
})

router.onError((error) => {
  console.error('[NXT Pay] Router error:', error)
})
