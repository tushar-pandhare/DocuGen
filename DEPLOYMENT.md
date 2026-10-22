# DocuGen Deployment Guide

## Architecture
- **Frontend** → Vercel (static React/Vite)
- **Backend** → Railway / Render / Fly.io (Node.js + Express)
  - ⚠️ Vercel CANNOT host the backend (uses Puppeteer/PDFKit, requires persistent file system)

---

## Backend Deployment (Render)

1. Push this repository to GitHub and create a Render account at https://render.com.
2. In Render, create a **Blueprint** from this repository. Render reads the root `render.yaml` and creates the backend web service and background worker.
3. Add the required environment variables in the Render dashboard for both services. Keep all real values in the dashboard, never in Git:
   - Backend: `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `FRONTEND_URL`, `GEMINI_API_KEY`, and your Redis connection settings.
   - Worker: `MONGO_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GEMINI_API_KEY`, and the same Redis connection settings.
   - Configure `UPSTASH_REDIS_URL` (or `REDIS_URL`) for BullMQ. The backend and worker must use the same Redis instance.
   - Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` on the backend if using the Upstash REST cache/rate-limit integration.
4. After the backend deploys, note its Render URL, for example `https://your-backend.onrender.com`. The health endpoint is `/health`.

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
- [ ] Worker is running and queued jobs complete




Hi this is tushar