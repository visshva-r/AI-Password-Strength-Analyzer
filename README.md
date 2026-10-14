# AI Password Strength Analyzer

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](#live-demo) · Full-stack ML app for password risk analysis

A full-stack **SDE + AIML** portfolio project: React UI, Flask API, and a trained **Random Forest** classifier, combined with **Shannon entropy**, an **offline brute-force crack-time estimate**, and rule-based hardening suggestions.

## Live Demo

| | URL |
|---|---|
| **Frontend (Vercel)** | https://visshva-password-analyzer.vercel.app |
| **API (Render)** | https://ai-password-analyzer-api.onrender.com |

**Health check:** https://ai-password-analyzer-api.onrender.com/health → `{ "status": "ok", "ml_model_loaded": true }`

## How it works

- **Random Forest (AIML):** `TfidfVectorizer` (character 1–3 grams) + `RandomForestClassifier`, loaded from `password_strength_model.pkl` / `vectorizer.pkl`, predicts Weak vs Strong.
- **Shannon entropy:** Per-character frequency entropy (bits per character) to quantify randomness in the password string.
- **Offline crack-time estimate:** Brute-force keyspace from length and the character classes present (lowercase 26, uppercase 26, digits 10, symbols 33), averaged over half the keyspace at 10^10 guesses/s (a GPU rig against a fast, unsalted hash). Computed arithmetically, so requests return immediately.
- **Full stack:** React + Tailwind UI (debounced analysis, password generator, strength meter) ↔ Flask REST `POST /analyze` with a CORS allowlist and per-visitor rate limits.

## System architecture

* **Frontend:** React, Tailwind CSS v3 (compiled by the Tailwind CLI), lucide-react
* **Backend:** Python, Flask, Flask-CORS, Flask-Limiter, Gunicorn (production)
* **Machine learning:** scikit-learn `RandomForestClassifier`, `TfidfVectorizer`, joblib artifacts in `backend/`
* **Security:** API rate limiting (30 requests/min per visitor); passwords are analyzed server-side and never stored

## Core features

* **Real-time AI prediction:** Random Forest on character n-grams
* **Mathematical entropy:** Shannon entropy (bits per character)
* **Time-to-crack estimate:** Offline brute-force model from length and character classes
* **Smart suggestions:** Stronger variant when common weak patterns are detected
* **Secure password generator:** Client-side high-entropy generator

## Local setup

### 1. Backend (Flask + ML)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python app.py                  # http://127.0.0.1:5001
```

Verify the model loaded:

```bash
curl http://127.0.0.1:5001/health
```

Expected: `"ml_model_loaded": true`. The pinned scikit-learn version matches the one the `.pkl` files were saved with.

**Retrain (optional):** place `backend/dataset/passwords.csv` (column `password`), then run `python train_model.py`.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start                      # http://localhost:3000
```

`npm start` reads `frontend/.env.development`, which points `REACT_APP_API_URL` at `http://127.0.0.1:5001`. Both `npm start` and `npm run build` compile Tailwind first (`npm run build:css`), so restart `npm start` after adding new Tailwind classes.

### 3. Tests

```bash
cd frontend
npm test -- --watchAll=false
npm run build
```

## Deploy (Render + Vercel)

### Backend on [Render](https://render.com)

1. New **Web Service** from this repo (or use the `render.yaml` Blueprint).
2. **Root directory:** `backend`
3. **Build:** `pip install -r requirements.txt`
4. **Start:** `gunicorn app:app --bind 0.0.0.0:$PORT`
5. **Health check path:** `/health`
6. **Environment:** `PYTHON_VERSION=3.10.13`, `CORS_ORIGINS=<your Vercel origin>` (comma-separated if more than one)
7. Confirm `GET https://<service>.onrender.com/health` returns `ml_model_loaded: true`.

On the free plan the service sleeps after 15 minutes idle, so the first request can take about a minute.

### Frontend on [Vercel](https://vercel.com)

1. Import this repo and set **Root Directory** to `frontend` (`frontend/vercel.json` sets the build command and output).
2. **Environment variable:** `REACT_APP_API_URL=<your Render origin>`, no trailing slash. It is inlined at build time, so redeploy after changing it.
3. Node version comes from `engines` in `frontend/package.json` (22.x).

## Project structure

```
backend/          Flask API, train_model.py, *.pkl
frontend/         React app (src/App.js), Tailwind config, vercel.json
render.yaml       Render Blueprint
```

## License

MIT. Use freely for learning and portfolio demos.
