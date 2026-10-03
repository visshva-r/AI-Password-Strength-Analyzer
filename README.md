# AI Password Strength Analyzer

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](#-live-demo) · Full-stack ML app for password risk analysis

A full-stack **SDE + AIML** portfolio project: React UI, Flask API, and a trained **Random Forest** classifier—combined with **Shannon entropy**, **bcrypt** timing simulation, and rule-based hardening suggestions.

## Live Demo

| | URL |
|---|---|
| **Frontend (Vercel)** | _Add after deploy:_ `https://your-app.vercel.app` |
| **API (Render)** | _Add after deploy:_ `https://your-api.onrender.com` |

**Health check:** `GET /health` → `{ "status": "ok", "ml_model_loaded": true }`

## How it works (resume bullets)

- **Random Forest (AIML):** `TfidfVectorizer` (char n-grams) + `RandomForestClassifier` loaded from `password_strength_model.pkl` / `vectorizer.pkl` for Weak vs Strong prediction.
- **Shannon entropy:** Per-character frequency entropy (bits) to quantify randomness in the password string.
- **bcrypt simulation:** One `bcrypt.hashpw` round timed to illustrate hashing cost (reported as estimated crack-time proxy in seconds).
- **Full stack:** React + Tailwind UI (debounced analyze, generator, strength meter) ↔ Flask REST `POST /analyze` with CORS and rate limits.

## System architecture

* **Frontend:** React, Tailwind CSS, lucide-react (dark cybersecurity UI)
* **Backend:** Python, Flask, Flask-CORS, Flask-Limiter, Gunicorn (production)
* **Machine learning:** scikit-learn `RandomForestClassifier`, `TfidfVectorizer`, joblib artifacts in `backend/`
* **Security:** API rate limiting; passwords analyzed server-side only (not stored)

## Core features

* **Real-time AI prediction** — Random Forest on character n-grams
* **Mathematical entropy** — Shannon entropy (bits)
* **Time-to-crack proxy** — bcrypt hash timing simulation
* **Smart suggestions** — Stronger variant when weak patterns are detected
* **Secure password generator** — Client-side high-entropy generator

## Local setup (reliable demo)

### 1. Backend (Flask + ML)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python app.py                  # http://127.0.0.1:5001
```

Verify ML loaded:

```bash
curl http://127.0.0.1:5001/health
```

Expected: `"ml_model_loaded": true` when `.pkl` files are present in `backend/`.

**Retrain (optional):** place `backend/dataset/passwords.csv` (column `password`), then `python train_model.py`.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start                      # http://localhost:3000
```

Default API: `http://127.0.0.1:5001`. Override with `frontend/.env.local`:

```env
REACT_APP_API_URL=http://127.0.0.1:5001
```

### 3. Tests

```bash
cd frontend
npm test -- --watchAll=false
npm run build
```

## Deploy (Render + Vercel)

### Backend — [Render](https://render.com)

1. New **Web Service** → connect this repo.
2. **Root directory:** `backend`
3. **Build:** `pip install -r requirements.txt`
4. **Start:** `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Or use repo root `render.yaml` (Blueprint).
6. Confirm `GET https://<your-service>.onrender.com/health` shows `ml_model_loaded: true`.

### Frontend — [Vercel](https://vercel.com)

1. Import repo; set **Root Directory** to `frontend` (or use root `vercel.json`).
2. **Environment variable:** `REACT_APP_API_URL` = your Render URL (no trailing slash).
3. Deploy; add the Vercel URL to this README under **Live Demo**.

## Project structure

```
backend/          Flask API, train_model.py, *.pkl
frontend/         React app (src/App.js)
render.yaml       Render blueprint (optional)
vercel.json       Vercel build hints (optional)
```

## License

MIT — use freely for learning and portfolio demos.
