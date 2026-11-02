import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Sparkles, ArrowRight, Loader2, AlertCircle, ArrowLeft, Feather, ShieldCheck } from 'lucide-react';

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

  const strengthLabels = ['Incipient', 'Adequate', 'Formidable'];
  const strengthColors = ['bg-[#75502F]', 'bg-[#C69B48]', 'bg-[#E5C477]'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Secret cipher must be at least 8 characters in length.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(name, email, password);
      localStorage.setItem('aurora_token', response.token);
      localStorage.setItem('aurora_user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Inscription failed. A research profile with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#24090F] bg-library-grid text-[#F6EBD5] font-sans px-4 py-12 relative selection:bg-[#C69B48] selection:text-[#24090F]">
      <div className="max-w-md w-full academia-card p-8 sm:p-10 border border-[#75502F] shadow-2xl relative z-10">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-serif uppercase tracking-widest text-[#C8B99F] hover:text-[#E5C477] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Great Hall</span>
        </Link>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <img
              src="/aurora-logo.png"
              alt="AURORA Academic Emblem"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(229,196,119,0.4)]"
            />
          </div>
          <h1 className="text-2xl font-serif font-black uppercase tracking-wider text-[#F6EBD5]">
            Inscribe Research Profile
          </h1>
          <p className="text-xs sm:text-sm font-academic text-[#C8B99F] mt-1">
            Access the twelve-agent autonomous synthesis repository
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-[#24090F] border border-[#C69B48] rounded-xl flex items-start space-x-2.5 text-[#E5C477] text-xs sm:text-sm font-academic">
            <AlertCircle className="w-4 h-4 text-[#C69B48] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Scholarly Name & Honorific</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Eleanor Vance / Prof. Sterling"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">University / Institutional Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scholar@oxford.edu"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Secret Cipher / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="input-field"
              required
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-serif">
                  <span className="text-[#C8B99F]">Cipher Fortitude:</span>
                  <span className="font-bold text-[#E5C477]">
                    {strengthLabels[strengthScore - 1] || 'Vulnerable'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#24090F] border border-[#75502F]/60 rounded-full overflow-hidden flex gap-1 p-[1px]">
                  <div
                    className={`h-full flex-1 rounded-full ${
                      strengthScore >= 1 ? strengthColors[0] : 'bg-transparent'
                    }`}
                  ></div>
                  <div
                    className={`h-full flex-1 rounded-full ${
                      strengthScore >= 2 ? strengthColors[1] : 'bg-transparent'
                    }`}
                  ></div>
                  <div
                    className={`h-full flex-1 rounded-full ${
                      strengthScore >= 3 ? strengthColors[2] : 'bg-transparent'
                    }`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-xs flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#24090F]" />
                  <span>Inscribing Profile...</span>
                </>
              ) : (
                <>
                  <Feather className="w-4 h-4 mr-1 text-[#24090F]" />
                  <span>Inscribe Profile</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-[#24090F]" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs font-serif uppercase tracking-wider text-[#C8B99F] mt-8">
          Already Inscribed?{' '}
          <Link to="/login" className="font-bold text-[#E5C477] hover:text-[#F0E3C6] transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
