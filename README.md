# AI Password Strength Analyzer

A full-stack, machine-learning-powered web application that evaluates password security using Shannon entropy calculations, simulated bcrypt hashing times, and a custom-trained Random Forest Classifier.

## 🚀 System Architecture
* **Frontend:** React.js, Tailwind CSS (Modern Dark Mode UI)
* **Backend:** Python, Flask, Flask-CORS, Flask-Limiter
* **Machine Learning:** Scikit-Learn (`RandomForestClassifier`, `TfidfVectorizer`), Pandas
* **Security:** Rate-limiting API endpoints to prevent brute-force abuse

## ✨ Core Features
* **Real-time AI Prediction:** Uses a custom-trained Natural Language Processing (NLP) model to classify passwords based on character n-grams.
* **Mathematical Entropy:** Calculates Shannon entropy to measure pure cryptographic randomness.
* **Time-to-Crack Simulation:** Estimates brute-force resistance using bcrypt hashing.
* **Smart Suggestions:** Auto-generates cryptographically stronger alternatives for weak passwords.

## 🛠️ Local Setup Instructions
### 1. Start the Flask Backend (API & ML)
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python train_model.py  # Generates the AI .pkl models from the dataset
python app.py          # Runs the API on http://127.0.0.1:5001
```

### 2. Start the React Frontend (Premium Dark UI)

In a second terminal, from the project root:

```bash
cd frontend
npm install
npm start
```

The app will be available at http://localhost:3000 and will call the Flask API at http://127.0.0.1:5001/analyze.
