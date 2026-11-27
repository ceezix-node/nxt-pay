# NXT Pay — redesign

A redesigned build of `nxt-topup` (the customer-facing top-up PWA for the
NXT mini-grid platform). Same integration surface as the original —
Supabase for auth/data, the NXT backend API for account/transaction
orchestration, Flutterwave for checkout — new design system and views.

## Design direction

**Concept:** using this app should feel like glancing at your own meter.
Every figure that matters — balance, amount, meter number, token — is set
in a tabular monospace face (`IBM Plex Mono`) so it reads like a digital
meter readout, never like generic UI copy. Everything else (headings,
labels, buttons) is set in `Manrope`, a warm geometric sans chosen for
legibility on low-end phones and patchy connections.

**Palette:** a deep indigo-night "ink" (`#14213D`) paired with one warm
solar-amber accent (`#F2A93C`) — stored daylight, spent after dark. Teal
(`#1F7A5C`) is reserved only for confirmed/success states so it keeps
meaning. Full token list: `src/styles/tokens.scss`.

**Layout:** single-column, mobile-first, no card-grid dashboard kit.
Primary actions are pinned to the bottom of the screen for one-thumb use.
The multi-step top-up flow uses a thin amber "charging" rail
(`ProgressRail.vue`) instead of a numbered stepper — it's the one motif
this product already owns.

Dark mode follows the system by default (`prefers-color-scheme`) and can
be forced with `data-theme="dark"` / `"light"` on `<html>`.

## Route surface

Matches the original app's compact surface:

| Route | Purpose |
|---|---|
| `/` | Home — meter lookup or recent meters, entry point to top-up |
| `/top-up-meter` | 3-step flow: find meter → choose amount → pay |
| `/top-up-success` | Receipt / confirmation |
| `/agent` | Agent-assisted top-up workspace (role-gated) |
| `/account/forgot-password` | Request a Supabase password reset email |
| `/account/verify` | Consumes Supabase email verification links |
| `/account/reset-password` | Set a new password after reset |

## Wiring it to your backend

1. `cp .env.example .env` and fill in:
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — your Supabase project
   - `VITE_API_URL` — your NXT backend (`api` app) base URL
   - `VITE_FLUTTERWAVE_PUBLIC_KEY` — your Flutterwave public key
2. `npm install`
3. `npm run dev`

`src/lib/api.js` is a thin `ky`-based client that attaches the Supabase
JWT as a bearer token to every request — replace the placeholder endpoint
paths (`accounts/:id/balance`, `accounts/:id/transactions`,
`payments/topup`) with whatever your `nxt-backend` deployment actually
exposes once payments land there (as of writing, payments/metering are
still being migrated out of the `legacy/tiamat` stack into `apps/api` —
check what's live on your deployment before wiring this up for real).

`HomeView.vue` currently ships one hard-coded "recent meter" row and
`AgentView.vue` ships two placeholder transactions — both marked in
comments — swap those for real calls to `fetchTransactionHistory` /
your agent endpoint once you know the response shape.

## What's here vs. what to add

Included: full route/flow scaffold, design system, Supabase client,
Flutterwave checkout wrapper, Pinia stores for session + in-progress
top-up, role-gated agent route, PWA icons (a meter-dial mark, generated
to match the palette), a white-label branding loader
(`public/branding/apply-branding.js`), a maintenance-mode guard wired
into `App.vue`, and a production-only Hotjar loader.

Not included (needs your actual backend contract to build against):
real meter lookup and live balance/transaction fetching — both are
stubbed with clearly-commented placeholder data in `HomeView.vue`,
`TopUpMeterView.vue`, and `AgentView.vue` until you confirm what's
actually live on your `nxt-backend` deployment.

## Branding a white-label deployment

Drop a `public/branding/config.json` into a given deployment (not
committed here) to override the palette and product name without a
rebuild:

```json
{
  "ink": "#14213D",
  "amber": "#F2A93C",
  "teal": "#1F7A5C",
  "productName": "Acme Power",
  "logoUrl": "/branding/logo.svg",
  "faviconUrl": "/branding/favicon.svg"
}
```

It's fetched synchronously before Vue mounts, so there's no flash of
default branding. No file present → defaults from `tokens.scss` apply.
