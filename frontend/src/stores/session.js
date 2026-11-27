import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: null,
    profile: null,
    role: 'customer' // 'customer' | 'agent'
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAgent: (state) => state.role === 'agent'
  },
  actions: {
    async syncFromSupabase() {
      const { data } = await supabase.auth.getSession()
      this.user = data.session?.user ?? null
      if (this.user) await this.refreshProfile()
    },
    async refreshProfile() {
      if (!this.user) return
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single()
      if (!error) {
        this.profile = data
        this.role = data?.role ?? 'customer'
      }
    },
    async signOut() {
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
      this.role = 'customer'
    }
  },
  persist: {
    pick: ['profile', 'role']
  }
})
