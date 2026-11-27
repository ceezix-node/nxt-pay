# NXT Pay

NXT Pay is an electricity payment platform with a Vue frontend and an Express API.

## Project Structure

- `frontend/` — Vue, Vite and PWA application.
- `backend/` — Express API and Supabase authentication middleware.
- `docs/` — Project documentation.

## Requirements

- Node.js
- npm
- A configured Supabase project

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Configure the required frontend environment variables before connecting services.

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Configure the Supabase URL, publishable/anon key and permitted frontend origins.

## Security

- Never commit `.env` files.
- Never expose Supabase service-role keys.
- Never expose Flutterwave secret keys in frontend code.
- Verify payment transactions on the backend.
- Never treat a browser payment callback as proof of payment.
- Confirm electricity vending with the provider before issuing a successful receipt.

## Project Status

The backend currently includes a health endpoint and Supabase access-token authentication middleware.

Financial endpoints and electricity-provider integration are not yet implemented.
# nxt-pay
# nxt-pay
