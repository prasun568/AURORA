import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Sparkles, ArrowRight, Loader2, AlertCircle, Check, Shield } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength calculation
  const isMinLength = password.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);

  let strengthScore = 0;
  if (isMinLength) strengthScore++;
  if (hasNumberOrSpecial) strengthScore++;
  if (hasUpperCase) strengthScore++;

  const strengthLabels = ['Weak', 'Moderate', 'Strong'];
  const strengthColors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(name, email, password);
      localStorage.setItem('aurora_token', response.token);
      localStorage.setItem('aurora_user', JSON.stringify(response.user));
      navigate('/landing');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-aurora-600 to-indigo-600 text-white mb-4 shadow-md shadow-aurora-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">
            Join researchers synthesizing verified review papers with AURORA
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Katherine Johnson"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Academic Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kjohnson@nasa.gov"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Password (min 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Password strength:</span>
                  <span className="font-semibold text-slate-700">
                    {strengthLabels[strengthScore - 1] || 'Too short'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5">
                  <div className={`rounded-full transition-all ${isMinLength ? strengthColors[0] : 'bg-slate-200'}`} />
                  <div className={`rounded-full transition-all ${isMinLength && hasNumberOrSpecial ? strengthColors[1] : 'bg-slate-200'}`} />
                  <div className={`rounded-full transition-all ${isMinLength && hasNumberOrSpecial && hasUpperCase ? strengthColors[2] : 'bg-slate-200'}`} />
                </div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-1">
                  <span className={`w-3.5 h-3.5 rounded-full inline-flex items-center justify-center text-[9px] ${isMinLength ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                    ✓
                  </span>
                  <span>Minimum 8 characters</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 mt-4 bg-aurora-600 hover:bg-aurora-700 shadow-md shadow-aurora-600/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-aurora-600 hover:text-aurora-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
