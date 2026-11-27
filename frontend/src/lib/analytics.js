// Loads Hotjar only in production and only when a site ID is configured —
// never in local dev, never for a context you haven't explicitly set.
export function loadHotjar() {
  const siteId = import.meta.env.VITE_HOTJAR_SITE_ID
  const context = import.meta.env.VITE_CONTEXT
  if (!siteId || context !== 'production') return

  window.hj = window.hj || function hj() { (window.hj.q = window.hj.q || []).push(arguments) }
  window._hjSettings = { hjid: Number(siteId), hjsv: 6 }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=6`
  document.head.appendChild(script)
}
