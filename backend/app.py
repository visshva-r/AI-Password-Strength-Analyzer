from flask import Flask, request, jsonify
import math
import os
import random
import string
from pathlib import Path
from collections import Counter
import joblib
import numpy as np
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "password_strength_model.pkl"
VECTORIZER_PATH = BASE_DIR / "vectorizer.pkl"

# Comma-separated list of frontend origins allowed to call the API.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]

app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)


def client_ip():
    """Rate-limit per visitor; on Render every request reaches the app through Cloudflare."""
    forwarded = request.headers.get("CF-Connecting-IP") or request.headers.get(
        "X-Forwarded-For", ""
    ).split(",")[0].strip()
    return forwarded or get_remote_address()


# Rate limiting to prevent API abuse
limiter = Limiter(client_ip, app=app, default_limits=["10 per minute"])

# Load pre-trained ML model for password strength classification
model = None
vectorizer = None
try:
    if MODEL_PATH.is_file() and VECTORIZER_PATH.is_file():
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("ML model and vectorizer loaded successfully.")
    else:
        print("ML model files not found:", MODEL_PATH, VECTORIZER_PATH)
except Exception as e:
    print("Error loading ML model:", e)
    model, vectorizer = None, None

def calculate_entropy(password):
    """Calculate Shannon entropy to measure password randomness."""
    if not password:
        return 0
    entropy = 0
    length = len(password)
    frequency = Counter(password)
    for count in frequency.values():
        probability = count / length
        entropy -= probability * np.log2(probability)
    return round(entropy, 2)

# Offline brute-force model: the attacker holds the hash and tries every string
# built from the character classes present. 1e10 guesses/s is a GPU rig against
# a fast, unsalted hash; slow hashes such as bcrypt would take far longer.
GUESSES_PER_SECOND = 1e10
SYMBOL_POOL_SIZE = 33  # printable ASCII punctuation plus space
SECONDS_PER_YEAR = 365.25 * 86400
DURATION_UNITS = (
    ("year", SECONDS_PER_YEAR),
    ("month", SECONDS_PER_YEAR / 12),
    ("day", 86400),
    ("hour", 3600),
    ("minute", 60),
    ("second", 1),
)


def character_pool_size(password):
    """Size of the alphabet an attacker must search, from the classes in use."""
    pool = 0
    if any(c in string.ascii_lowercase for c in password):
        pool += 26
    if any(c in string.ascii_uppercase for c in password):
        pool += 26
    if any(c in string.digits for c in password):
        pool += 10
    if any(c not in string.ascii_letters + string.digits for c in password):
        pool += SYMBOL_POOL_SIZE
    return pool


def format_duration(seconds):
    if seconds < 1:
        return "less than a second"
    for name, size in DURATION_UNITS:
        if seconds >= size:
            count = int(seconds // size)
            return f"{count} {name}{'' if count == 1 else 's'}"


def time_to_crack(password):
    """Average offline brute-force time from length and character classes."""
    pool = character_pool_size(password)
    if pool == 0:
        return "less than a second"
    # Half the keyspace on average, kept in log10 so long passwords can't overflow a float.
    log10_seconds = len(password) * math.log10(pool) - math.log10(2 * GUESSES_PER_SECOND)
    if log10_seconds >= math.log10(100 * SECONDS_PER_YEAR):
        return "centuries"
    return format_duration(10 ** log10_seconds)

def suggest_stronger_password(password):
    """Generate a stronger version of the given password."""
    substitutions = {"a": "@", "s": "$", "o": "0", "i": "1", "e": "3"}
    stronger = ''.join(substitutions.get(c, c) for c in password)
    stronger += random.choice(string.ascii_uppercase) + random.choice(string.punctuation)
    return stronger

def evaluate_password(password):
    """Evaluate password strength and return detailed analysis."""
    length = len(password)
    entropy = calculate_entropy(password)
    crack_time = time_to_crack(password)
    weak_patterns = ["123456", "password", "qwerty", "letmein", "admin"]
    weak = any(w in password.lower() for w in weak_patterns)
    
    # ML Model Prediction (if available)
    ml_prediction = "Unknown"
    if model and vectorizer:
        password_vectorized = vectorizer.transform([password])
        ml_prediction = "Weak" if model.predict(password_vectorized)[0] == 0 else "Strong"
    
    feedback = "Strong password" if not weak and length > 8 and entropy > 3 else "Weak password"
    suggestion = suggest_stronger_password(password) if weak else "Consider adding more randomness"
    
    return {
        "password": password,
        "strength": feedback,
        "entropy": entropy,
        "time_to_crack": crack_time,
        "suggestion": suggestion,
        "ml_prediction": ml_prediction
    }

@app.route('/health', methods=['GET'])
@limiter.exempt
def health():
    """Health check for deploy platforms and local verification."""
    return jsonify({
        "status": "ok",
        "ml_model_loaded": model is not None and vectorizer is not None,
    })


@app.route('/analyze', methods=['POST'])
@limiter.limit("30 per minute")
def analyze_password():
    """API endpoint to analyze password strength."""
    data = request.json
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "Password is required"}), 400
    result = evaluate_password(password)
    return jsonify(result)

if __name__ == '__main__':
    # Local development only; Render runs gunicorn (see render.yaml).
    port = int(os.environ.get("PORT", 5001))
    app.run(host="127.0.0.1", port=port, debug=True)
