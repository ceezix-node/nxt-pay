// Loads the Flutterwave inline checkout script on demand and exposes a
// small promise-based wrapper, so views never talk to `window.FlutterwaveCheckout`
// directly.

const SCRIPT_SRC = 'https://checkout.flutterwave.com/v3.js'
let scriptPromise = null

function loadScript() {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) {
      resolve(window.FlutterwaveCheckout)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve(window.FlutterwaveCheckout)
    script.onerror = () => reject(new Error('Failed to load Flutterwave checkout script'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

/**
 * Opens the Flutterwave inline modal.
 * @param {{
 *   amount: number, currency: string, meterNumber: string,
 *   customerEmail: string, customerPhone?: string,
 *   onSuccessful: (response: object) => void,
 *   onClose: () => void
 * }} params
 */
export async function payWithFlutterwave(params) {
  const FlutterwaveCheckout = await loadScript()
  const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY
  const txRef = `nxtpay-${params.meterNumber}-${Date.now()}`

  FlutterwaveCheckout({
    public_key: publicKey,
    tx_ref: txRef,
    amount: params.amount,
    currency: params.currency ?? 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: params.customerEmail,
      phone_number: params.customerPhone,
      name: params.customerName
    },
    customizations: {
      title: 'NXT Pay',
      description: `Top up meter ${params.meterNumber}`,
      logo: '/icon-192.png'
    },
    callback: (response) => {
      if (['successful', 'completed'].includes(response.status)) {
        params.onSuccessful(response)
      }
      window.closePaymentModal?.()
    },
    onclose: () => {
      params.onClose?.()
    }
  })

  return txRef
}
