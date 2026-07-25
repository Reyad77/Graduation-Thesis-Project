# Deployment Guide

## Firebase Setup (Required First)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click **Create a project** → Name: `student-job-platform`
3. Enable Google Analytics (optional)

### 2. Enable Services

| Service | Path | Action |
|---|---|---|
| **Firestore Database** | Build → Firestore | Create database → Start in **test mode** |
| **Authentication** | Build → Auth → Sign-in method | Enable **Email/Password** |
| **Storage** | Build → Storage | Get started → Start in **test mode** |

### 3. Get Credentials

**Service Account (Backend):**
1. Project Settings ⚙️ → Service accounts
2. **Generate new private key** → Download JSON
3. Place in `firebase private key/` folder

**Web API Key (Login REST API):**
1. Project Settings ⚙️ → General
2. Copy **Web API Key** (or add a web app to get one)
3. Add to `.env`: `FIREBASE_API_KEY=AIzaSy...`

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## Backend Deployment

### Option A: Railway (Recommended)

1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Set root directory to `Projct/backend`
4. Add all environment variables from `.env`
5. Deploy — Railway auto-detects the Procfile

### Option B: Render

1. Go to https://render.com → New Web Service
2. Connect GitHub repo
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables

### Option C: Heroku

```bash
heroku create student-job-api
heroku buildpacks:set heroku/python
heroku config:set $(cat Projct/backend/.env | xargs)
git subtree push --prefix Projct/backend heroku main
```

---

## Frontend Deployment

### Vercel (Recommended)

1. Go to https://vercel.com → New Project
2. Import GitHub repo
3. Root Directory: `Projct/frontend`
4. Framework: Vite
5. Add environment variables from `.env`
6. Deploy

### Netlify

1. Build command: `cd Projct/frontend && npm run build`
2. Publish directory: `Projct/frontend/dist`
3. Add `_redirects` file: `/* /index.html 200`

### Custom Domain

1. Buy domain from Namecheap / GoDaddy
2. In Vercel: Settings → Domains → Add domain
3. Update DNS records as instructed

---

## Post-Deployment Checklist

- [ ] Firebase project created and services enabled
- [ ] Email/Password sign-in enabled
- [ ] Security rules deployed (`firestore.rules`, `storage.rules`)
- [ ] All environment variables set on hosting platform
- [ ] Backend health check: `GET /health` returns 200
- [ ] Frontend builds without errors
- [ ] Registration flow works end-to-end
- [ ] Login flow works end-to-end
- [ ] CORS origins updated (add production URL)
- [ ] Rate limiting configured for production
