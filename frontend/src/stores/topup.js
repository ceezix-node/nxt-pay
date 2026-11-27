import { defineStore } from 'pinia'

// Holds the in-progress top-up so the success screen (a distinct route)
// can render a receipt without re-fetching everything.
export const useTopUpStore = defineStore('topup', {
  state: () => ({
    meterNumber: '',
    accountName: '',
    amount: null,
    currency: 'NGN',
    lastReceipt: null
  }),
  actions: {
    setMeter({ meterNumber, accountName }) {
      this.meterNumber = meterNumber
      this.accountName = accountName
    },
    setAmount(amount) {
      this.amount = amount
    },
    completeWithReceipt(receipt) {
      this.lastReceipt = receipt
    },
    reset() {
      this.meterNumber = ''
      this.accountName = ''
      this.amount = null
      this.lastReceipt = null
    }
  },
  persist: {
    pick: ['lastReceipt']
  }
})
