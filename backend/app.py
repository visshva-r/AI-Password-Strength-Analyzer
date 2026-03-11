<<<<<<< HEAD
from flask import Flask, request, jsonify
import bcrypt
import time
import random
import string
from collections import Counter
import joblib
import numpy as np
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Rate limiting to prevent API abuse
limiter = Limiter(get_remote_address, app=app, default_limits=["10 per minute"])

# Load pre-trained ML model for password strength classification
try:
    model = joblib.load("password_strength_model.pkl")
    vectorizer = joblib.load("vectorizer.pkl")
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

def time_to_crack(password):
    """Estimate time-to-crack based on password hashing simulation."""
    start = time.time()
    bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    end = time.time()
    return round(end - start, 5)  # Simulated cracking time

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
        "time_to_crack": f"{crack_time} sec",
        "suggestion": suggestion,
        "ml_prediction": ml_prediction
    }

@app.route('/analyze', methods=['POST'])
@limiter.limit("5 per minute")
def analyze_password():
    """API endpoint to analyze password strength."""
    data = request.json
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "Password is required"}), 400
    result = evaluate_password(password)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
=======
from flask import Flask, request, jsonify
import bcrypt
import time
import random
import string
from collections import Counter
import joblib
import numpy as np
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Rate limiting to prevent API abuse
limiter = Limiter(get_remote_address, app=app, default_limits=["10 per minute"])

# Load pre-trained ML model for password strength classification
try:
    model = joblib.load("password_strength_model.pkl")
    vectorizer = joblib.load("vectorizer.pkl")
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

def time_to_crack(password):
    """Estimate time-to-crack based on password hashing simulation."""
    start = time.time()
    bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    end = time.time()
    return round(end - start, 5)  # Simulated cracking time

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
        "time_to_crack": f"{crack_time} sec",
        "suggestion": suggestion,
        "ml_prediction": ml_prediction
    }

@app.route('/analyze', methods=['POST'])
@limiter.limit("5 per minute")
def analyze_password():
    """API endpoint to analyze password strength."""
    data = request.json
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "Password is required"}), 400
    result = evaluate_password(password)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
>>>>>>> 32a517a3aaad539758ef787da0115eba98452b74
