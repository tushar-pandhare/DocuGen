# DocuGen Deployment Guide

## Architecture
- **Frontend** → Vercel (static React/Vite)
- **Backend** → Railway / Render / Fly.io (Node.js + Express)
  - ⚠️ Vercel CANNOT host the backend (uses Puppeteer/PDFKit, requires persistent file system)

---

## Backend Deployment (Railway recommended)

1. Create account at https://railway.app
2. New Project → Deploy from GitHub repo
3. Set root directory to `backend/`
4. Set environment variables in Railway dashboard:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<openssl rand -hex 32>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-backend.up.railway.app/api/auth/google/callback
FRONTEND_URL=https://your-app.vercel.app
GEMINI_API_KEY=...
```

5. Note your Railway URL: `https://your-backend.up.railway.app`

---

## Frontend Deployment (Vercel)

1. Create account at https://vercel.com
2. New Project → Import from GitHub
3. Set root directory to `frontend/`
4. Set environment variable in Vercel dashboard:

```
VITE_API_URL=https://your-backend.up.railway.app/api
```

5. Deploy — Vercel will run `npm run build` and serve `dist/`

---

## Google OAuth Setup

1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Add Authorized redirect URI:
   - `https://your-backend.up.railway.app/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (for local dev)
4. Add Authorized JavaScript origin:
   - `https://your-app.vercel.app`
   - `http://localhost:5173`

---

## Post-Deployment Checklist

- [ ] Backend health check: `GET https://your-backend.up.railway.app/health`
- [ ] Login works end-to-end
- [ ] Invoice preview returns PDF (not 404)
- [ ] Invoice download works
- [ ] Google Drive connect flow works
- [ ] Templates load correctly




Hi this is tushar