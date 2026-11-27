// Polls the maintenance-status endpoint once at boot. Kept separate from
// the main NXT API client since it must work even when that API is the
// thing that's down.
export async function checkMaintenanceStatus() {
  const url = import.meta.env.VITE_MAINTENANCE_API_URL
  if (!url) return { underMaintenance: false }

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return { underMaintenance: false }
    const data = await res.json()
    return {
      underMaintenance: Boolean(data.underMaintenance),
      message: data.message,
      estimatedEndTime: data.estimatedEndTime
    }
  } catch {
    // If the status check itself fails, don't block customers from
    // paying — fail open, not closed.
    return { underMaintenance: false }
  }
}
