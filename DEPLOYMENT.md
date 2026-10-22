# DocuGen Deployment Guide

## Architecture
- **Frontend** → Vercel (static React/Vite)
- **Backend** → Render (Node.js + Express)
  - ⚠️ Vercel CANNOT host the backend (uses Puppeteer/PDFKit, requires persistent file system)
- **Worker** → Not included in the free Render Blueprint; queued background jobs need a separately hosted worker.

---

## Backend Deployment (Render)

1. Push this repository to GitHub and create a Render account at https://render.com.
2. In Render, create a **Blueprint** from this repository. Render reads the root `render.yaml` and creates the free backend web service.
3. Add the required environment variables in the Render dashboard. Keep all real values in the dashboard, never in Git:
   - `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `FRONTEND_URL`, and `GEMINI_API_KEY`.
   - Configure `UPSTASH_REDIS_URL` (or `REDIS_URL`) for BullMQ queue access.
   - Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` if using the Upstash REST cache/rate-limit integration.
4. After the backend deploys, note its Render URL, for example `https://your-backend.onrender.com`. The health endpoint is `/health`.

The free Blueprint does not deploy a background worker. Features that enqueue OCR, PDF, compression, invoice, or AI jobs will not finish until you deploy `worker/` as a separate background worker on a platform/plan that supports it. Set its Redis connection to the same Redis instance as the backend.

---

## Frontend Deployment (Vercel)

1. Create account at https://vercel.com
2. New Project → Import from GitHub
3. Set root directory to `frontend/`
4. Set `VITE_API_URL` in the Vercel dashboard to the backend API base URL:

```
VITE_API_URL=https://your-backend.onrender.com/api
```

5. Set the backend's `FRONTEND_URL` to the deployed Vercel origin, then deploy. Vercel runs `npm run build` and serves `dist/`.

---

## Google OAuth Setup

1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Add Authorized redirect URI:
   - `https://your-backend.onrender.com/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (for local dev)
4. Add Authorized JavaScript origin:
   - `https://your-app.vercel.app`
   - `http://localhost:5173`

---

## Post-Deployment Checklist

- [ ] Backend health check: `GET https://your-backend.onrender.com/health`
- [ ] Login works end-to-end
- [ ] Invoice preview returns PDF (not 404)
- [ ] Invoice download works
- [ ] Google Drive connect flow works
- [ ] Templates load correctly




Hi this is tushar