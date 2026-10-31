import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  FileCode2,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/landing');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password. Please try again.');
    }
  };

  const featureCards = [
    {
      icon: Bot,
      title: 'Multi-Agent Mesh',
      desc: '11 autonomous AI agents coordinated with LangGraph'
    },
    {
      icon: ShieldCheck,
      title: 'Verified Citations',
      desc: 'VeriCite™ engine cross-checking CrossRef & DOIs'
    },
    {
      icon: FileCode2,
      title: 'All Formats Supported',
      desc: 'Instant export to IEEE, APA, MLA, LaTeX & Word'
    },
    {
      icon: Clock,
      title: 'Under 5 Minutes',
      desc: 'Autonomous end-to-end systematic literature synthesis'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT PANEL - Gradient & Highlights */}
      <div className="relative overflow-hidden md:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white p-8 lg:p-12 flex flex-col justify-between">
        {/* Animated Floating Background Circles */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-purple-500/25 blur-3xl"></div>

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-wider text-white">AURORA</span>
              <span className="block text-[11px] font-semibold tracking-widest text-blue-200 uppercase">
                Multi-Agent Review Generator
              </span>
            </div>
          </div>
          <p className="text-blue-100/90 text-sm max-w-md mt-3 leading-relaxed">
            The next-generation autonomous research engine for high-fidelity systematic reviews, PRISMA flowcharts, and hallucination-free citations.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-8">
          {featureCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl hover:bg-white/15 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-white text-sm">{card.title}</h4>
                <p className="text-xs text-blue-100/80 mt-1 leading-normal">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Left Footer */}
        <div className="relative z-10 text-xs text-blue-200/70 border-t border-white/10 pt-4">
          © 2026 AURORA Research Technologies • Academic Excellence Engine
        </div>
      </div>

      {/* RIGHT PANEL - Authentication Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Enter your credentials to access your systematic reviews
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
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@university.edu"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-aurora-600 focus:ring-aurora-500"
                />
                <span className="text-slate-600 text-xs sm:text-sm">Remember me</span>
              </label>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password recovery: Contact your system administrator or register a new account.');
                }}
                className="text-xs sm:text-sm font-medium text-aurora-600 hover:text-aurora-700"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 bg-aurora-600 hover:bg-aurora-700 shadow-md shadow-aurora-600/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-aurora-600 hover:text-aurora-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
