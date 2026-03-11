import React, { useState } from 'react';
import './index.css';

function App() {
  const [password, setPassword] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzePassword = async () => {
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // Connects to your Flask API
      const response = await fetch('http://127.0.0.1:5001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      // Handle the 5 per minute rate limit gracefully
      if (response.status === 429) {
        setError("Rate limit exceeded (5 per min). Please wait a moment.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("Failed to connect to the Flask server. Is it running?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">AI Password Analyzer</h1>
        
        <input
          type="text"
          placeholder="Enter a password to test..."
          className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyzePassword()} // 
        />
        
        <button
          onClick={analyzePassword}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Strength"}
        </button>

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

        {results && (
          <div className="mt-6 space-y-4 bg-gray-700 p-4 rounded-lg">
            <p><strong>Strength:</strong> <span className={results.strength === "Strong password" ? "text-green-400" : "text-red-400"}>{results.strength}</span></p>
            <p><strong>ML Prediction:</strong> {results.ml_prediction}</p>
            <p><strong>Entropy:</strong> {results.entropy} bits</p>
            <p><strong>Est. Crack Time:</strong> {results.time_to_crack}</p>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400 mb-1">Suggested stronger alternative:</p>
              <code className="block bg-gray-900 p-2 rounded text-green-300 break-all">
                {results.suggestion}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 32a517a3aaad539758ef787da0115eba98452b74
