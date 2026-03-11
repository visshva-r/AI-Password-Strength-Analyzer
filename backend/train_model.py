<<<<<<< HEAD
import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib

print("1. Loading the massive dataset...")
df = pd.read_csv('dataset/passwords.csv')
df.columns = df.columns.str.strip()
df = df.dropna()
df['password'] = df['password'].astype(str)

# --- THE MAGIC OPTIMIZATION ---
# Grab a random sample of 50,000 rows so your RAM doesn't crash
print("2. Sampling 50,000 rows for faster training...")
df = df.sample(n=50000, random_state=42)

# AUTO-GENERATE THE MISSING 'strength' COLUMN
def calculate_strength(pw):
    score = 0
    if len(pw) > 8: score += 1
    if re.search(r"\d", pw): score += 1
    if re.search(r"[A-Z]", pw): score += 1
    if re.search(r"[!@#$%^&*]", pw): score += 1
    return 1 if score >= 3 else 0

print("3. Auto-labeling the sample data...")
df['strength'] = df['password'].apply(calculate_strength)

X_data = df['password']
y_data = df['strength']

print("4. Vectorizing the passwords (converting text to math)...")
vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(1, 3))
X = vectorizer.fit_transform(X_data)

print("5. Training the Random Forest AI (using all CPU cores)...")
# n_jobs=-1 tells your computer to use EVERY processor core it has!
model = RandomForestClassifier(n_jobs=-1)
model.fit(X, y_data)

print("6. Saving the AI models...")
joblib.dump(model, 'password_strength_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')

=======
import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib

print("1. Loading the massive dataset...")
df = pd.read_csv('dataset/passwords.csv')
df.columns = df.columns.str.strip()
df = df.dropna()
df['password'] = df['password'].astype(str)

# --- THE MAGIC OPTIMIZATION ---
# Grab a random sample of 50,000 rows so your RAM doesn't crash
print("2. Sampling 50,000 rows for faster training...")
df = df.sample(n=50000, random_state=42)

# AUTO-GENERATE THE MISSING 'strength' COLUMN
def calculate_strength(pw):
    score = 0
    if len(pw) > 8: score += 1
    if re.search(r"\d", pw): score += 1
    if re.search(r"[A-Z]", pw): score += 1
    if re.search(r"[!@#$%^&*]", pw): score += 1
    return 1 if score >= 3 else 0

print("3. Auto-labeling the sample data...")
df['strength'] = df['password'].apply(calculate_strength)

X_data = df['password']
y_data = df['strength']

print("4. Vectorizing the passwords (converting text to math)...")
vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(1, 3))
X = vectorizer.fit_transform(X_data)

print("5. Training the Random Forest AI (using all CPU cores)...")
# n_jobs=-1 tells your computer to use EVERY processor core it has!
model = RandomForestClassifier(n_jobs=-1)
model.fit(X, y_data)

print("6. Saving the AI models...")
joblib.dump(model, 'password_strength_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')

>>>>>>> 32a517a3aaad539758ef787da0115eba98452b74
print("Success! The AI is trained and ready to use!")