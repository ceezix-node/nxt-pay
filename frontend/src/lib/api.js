import ky from 'ky'
import { supabase } from './supabase'

const baseUrl = import.meta.env.VITE_API_URL

// Thin wrapper around the NXT backend HTTP API. Attaches the current
// Supabase-issued JWT as a bearer token on every request, matching the
// auth contract described for nxt-backend's `api` process.
export const nxtApi = ky.create({
  prefixUrl: baseUrl,
  timeout: 15000,
  hooks: {
    beforeRequest: [
      async (request) => {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      }
    ]
  }
})

export async function fetchAccountBalance(accountId) {
  return nxtApi.get(`accounts/${accountId}/balance`).json()
}

export async function fetchTransactionHistory(accountId, { limit = 20 } = {}) {
  return nxtApi.get(`accounts/${accountId}/transactions`, {
    searchParams: { limit }
  }).json()
}


// Treat any gateway error (5xx) or network failure as "backend down"
export async function isBackendHealthy() {
  try {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    })
    return res.status < 500
  } catch {
    return false
  }
}

export async function recordTopUp(payload) {
  return nxtApi.post('payments/topup', {
    json: payload,
    headers: { 'Idempotency-Key': payload.txRef },
    timeout: 30000
  }).json()
}

// Payments that succeeded at Flutterwave but are not yet credited
const KEY = 'nxt:pendingTopUps'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (list) => localStorage.setItem(KEY, JSON.stringify(list))

export const savePendingTopUp = (p) => write([...read().filter(x => x.txRef !== p.txRef), p])
export const clearPendingTopUp = (txRef) => write(read().filter(x => x.txRef !== txRef))

export async function retryPendingTopUps() {
  for (const p of read()) {
    try { await recordTopUp(p); clearPendingTopUp(p.txRef) } catch { /* keep for next time */ }
  }
}
