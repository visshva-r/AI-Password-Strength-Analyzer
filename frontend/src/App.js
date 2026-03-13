import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, Eye, EyeOff, Lock, Shield, XCircle } from 'lucide-react';
import './index.css';

// Basic client-side heuristic as a fallback to visualize strength.
// The backend AI remains the source of truth for insights.
function computeStrengthScore(password, backendStrength) {
  if (!password) return 0;

  // If backend provides categorical strength, map it to a baseline.
  if (backendStrength) {
    if (backendStrength.toLowerCase().includes('strong')) return 90;
    if (backendStrength.toLowerCase().includes('medium')) return 60;
    if (backendStrength.toLowerCase().includes('weak')) return 30;
  }

  let score = 0;
  if (password.length > 8) score += 20;
  if (password.length >= 12) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  return Math.min(score, 100);
}

function getStrengthColor(score) {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 40) return 'bg-yellow-400';
  return 'bg-red-500';
}

function getStrengthLabel(score) {
  if (score >= 75) return 'Strong';
  if (score >= 40) return 'Medium';
  return 'Weak';
}

function generateSecurePassword(length = 16) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{};:,.<>?';

  const all = upper + lower + numbers + symbols;

  // Ensure at least one of each key type.
  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  for (let i = password.length; i < length; i++) {
    password.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Simple shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

function App() {
  const [password, setPassword] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lastAnalyzedPassword, setLastAnalyzedPassword] = useState('');

  const debounceRef = useRef(null);

  const analyzePassword = useCallback(
    async ({ fromUser = false } = {}) => {
      if (!password) {
        if (fromUser) {
          setError('Please enter a password.');
          setResults(null);
        }
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://127.0.0.1:5001/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        if (response.status === 429) {
          setError('Rate limit exceeded (5 per min). Please wait a moment.');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setResults(data);
        setLastAnalyzedPassword(password);
      } catch (err) {
        setError('Failed to connect to the Flask server. Is it running?');
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [password]
  );

  // Debounce analysis while typing to avoid spamming the backend.
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!password) {
      setResults(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (password && password !== lastAnalyzedPassword) {
        analyzePassword();
      }
    }, 600);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [password, lastAnalyzedPassword, analyzePassword]);

  const lengthOk = password.length > 8;
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  const strengthScore = computeStrengthScore(password, results?.strength);
  const strengthColor = getStrengthColor(strengthScore);
  const strengthLabel = getStrengthLabel(strengthScore);

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(18);
    setPassword(newPassword);
    setError('');
  };

  const handleManualAnalyze = () => {
    analyzePassword({ fromUser: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black text-slate-100 flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-5xl">
        <div className="mb-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Security Insight
          </div>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/40 shadow-[0_0_30px_-10px_rgba(99,102,241,0.35)] backdrop-blur">
              <Lock className="h-5 w-5 text-indigo-300" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              AI Password Strength Analyzer
            </h1>
          </div>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Evaluate password robustness in real time with ML-driven insights, entropy estimates, and
            actionable hardening recommendations.
          </p>
        </div>

        <div className="relative rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)] px-7 py-8 sm:px-12 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Left side: Input, generator, meter, checklist */}
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-200">
                    Password to analyze
                  </label>
                  <span className="text-xs text-slate-500">
                    Data stays local to your Flask API.
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative rounded-2xl bg-slate-950 border border-slate-700 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl bg-slate-950 px-4 py-4 pr-12 text-base sm:text-lg font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none"
                      placeholder="Use a strong, unique passphrase..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualAnalyze();
                        }
                      }}
                      autoComplete="off"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:border-indigo-400/80 hover:shadow-[0_0_25px_-10px_rgba(99,102,241,0.7)] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 transition-colors"
                    >
                      Generate secure password
                    </button>

                    <button
                      type="button"
                      onClick={handleManualAnalyze}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_0_30px_-12px_rgba(99,102,241,0.9)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,1)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                    >
                      {loading ? (
                        <>
                          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                          Analyzing…
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                          Run AI analysis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="uppercase tracking-wide">
                    Strength meter
                  </p>
                  <p className="font-medium text-slate-200">
                    {password ? `Current strength: ${strengthLabel} (${strengthScore}%)` : 'Waiting for input'}
                  </p>
                </div>

                <div className="relative h-3 overflow-hidden rounded-full bg-slate-800/80 border border-slate-700/60">
                  <div
                    className={`h-full ${strengthColor} transition-all duration-500 ease-out`}
                    style={{ width: `${password ? strengthScore : 0}%` }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-900/0 via-white/5 to-slate-900/0 mix-blend-overlay" />
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                  <ChecklistItem label="Length &gt; 8 characters" ok={lengthOk} />
                  <ChecklistItem label="Contains a number" ok={hasNumber} />
                  <ChecklistItem label="Contains a symbol" ok={hasSymbol} />
                  <ChecklistItem label="Contains uppercase letter" ok={hasUpper} />
                </div>
              </div>

              {error && (
                <p className="text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Right side: AI insights panel */}
            <div className="space-y-5 rounded-3xl bg-slate-950/30 backdrop-blur-xl border border-slate-700/50 shadow-[0_0_40px_-18px_rgba(99,102,241,0.25)] px-6 py-6 sm:px-7 sm:py-7">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80 border border-slate-700/70">
                    <Shield className="h-3.5 w-3.5 text-indigo-300" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      AI Insights
                    </h2>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Backed by your Flask ML model
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/50 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live analysis
                </span>
              </div>

              {results ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InsightStat
                      label="ML prediction"
                      value={results.ml_prediction}
                    />
                    <InsightStat
                      label="Entropy"
                      value={
                        results.entropy !== undefined
                          ? `${results.entropy} bits`
                          : '—'
                      }
                    />
                    <InsightStat
                      label="Estimated crack time"
                      value={results.time_to_crack || '—'}
                    />
                    <InsightStat
                      label="Overall verdict"
                      value={results.strength || strengthLabel}
                      emphasize
                    />
                  </div>

                  {results.suggestion && (
                    <div className="mt-1 rounded-2xl border border-slate-700/60 bg-slate-900/50 p-4">
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Suggested stronger alternative
                      </p>
                      <code className="block max-h-28 overflow-y-auto break-all rounded-xl bg-slate-950 p-3 text-[11px] text-emerald-300 border border-slate-700/60">
                        {results.suggestion}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-1 space-y-4 text-xs text-slate-400">
                  <p>
                    Start typing a password to see AI-powered strength feedback, entropy estimation,
                    and time-to-crack projections.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Stronger, unique passwords dramatically reduce breach risk.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                      <span>Symbols, numbers, and length increase entropy non-linearly.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span>Avoid reused credentials and common patterns.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ label, ok }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-950/40 px-3 py-2 border border-slate-700/60">
      {ok ? (
        <CheckCircle className="h-4 w-4 text-emerald-400" />
      ) : (
        <XCircle className="h-4 w-4 text-slate-500" />
      )}
      <span className={`text-[11px] ${ok ? 'text-emerald-300' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}

function InsightStat({ label, value, emphasize = false }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`text-xs font-medium ${
          emphasize ? 'text-emerald-300' : 'text-slate-100'
        }`}
      >
        {value || '—'}
      </p>
    </div>
  );
}

export default App;
