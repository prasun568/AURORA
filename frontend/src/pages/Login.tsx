import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BookOpen,
  Feather,
  ShieldCheck,
  Award,
  Scroll,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock
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
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid scholarly credentials. Please re-verify your inscription.');
    }
  };

  const academicFeatures = [
    {
      icon: Scroll,
      title: 'Twelve AI Agents',
      desc: 'LangGraph multi-agent deterministic synthesis mesh'
    },
    {
      icon: ShieldCheck,
      title: 'VeriCite™ Engine',
      desc: 'Real CrossRef DOI validation and semantic claim alignment'
    },
    {
      icon: Feather,
      title: 'Scholarly Outputs',
      desc: 'IEEE 2-Column, ACM SigConf, Springer LNCS & Word'
    },
    {
      icon: Award,
      title: 'PRISMA 2020 Rigor',
      desc: 'Full methodological transparency and flowchart diagramming'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#24090F] bg-library-grid text-[#F6EBD5] font-sans selection:bg-[#C69B48] selection:text-[#24090F]">
      {/* LEFT PANEL - University Crest & Lore */}
      <div className="relative overflow-hidden md:w-1/2 p-8 lg:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#75502F]/70 bg-[#350E18]/80 backdrop-blur-md">
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-serif uppercase tracking-widest text-[#C8B99F] hover:text-[#E5C477] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Great Hall</span>
          </Link>

          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src="/aurora-logo.png"
                alt="AURORA Academic Emblem"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(229,196,119,0.4)]"
              />
            </div>
            <div>
              <span className="font-serif font-extrabold text-2xl tracking-widest text-[#F6EBD5]">AURORA</span>
              <span className="block text-[10px] font-serif font-bold tracking-widest text-[#E5C477] uppercase -mt-0.5">
                Autonomous Research Intelligence
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase mt-6 leading-snug">
            Enter the Sacred Vault of Academic Discovery.
          </h2>
          <p className="text-[#C8B99F] font-academic text-base mt-3 leading-relaxed max-w-md">
            Sign in to access your empirical syntheses, verified PRISMA tracking protocols, and compiled manuscripts.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 my-10">
          {academicFeatures.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="academia-card p-4 border border-[#75502F] bg-[#401923]/80 hover:border-[#C69B48] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#24090F] border border-[#75502F] flex items-center justify-center text-[#E5C477] mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#F6EBD5] tracking-wide">{card.title}</h4>
                <p className="text-xs font-academic text-[#C8B99F] mt-1 leading-normal">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Left Footer */}
        <div className="relative z-10 text-xs font-serif uppercase tracking-widest text-[#C8B99F]/70 border-t border-[#75502F]/50 pt-4 flex items-center justify-between">
          <span>AURORA Research Technologies</span>
          <span className="text-[#E5C477]">EST. 2026</span>
        </div>
      </div>

      {/* RIGHT PANEL - Authentication Parchment Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="max-w-md w-full academia-card p-8 sm:p-10 border border-[#75502F] shadow-2xl relative z-10">
          <div className="mb-8">
            <h3 className="text-2xl font-serif font-black uppercase tracking-wider text-[#F6EBD5]">Sign In</h3>
            <p className="text-xs sm:text-sm font-academic text-[#C8B99F] mt-1.5">
              Enter your scholarly credentials to access the research repository
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 bg-[#24090F] border border-[#C69B48] rounded-xl flex items-start space-x-2.5 text-[#E5C477] text-xs sm:text-sm font-academic">
              <AlertCircle className="w-4 h-4 text-[#C69B48] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Scholarly Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@university.edu"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Secret Cipher / Password</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C8B99F] hover:text-[#E5C477] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-serif text-[#C8B99F] py-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#75502F] bg-[#24090F] text-[#C69B48] focus:ring-[#C69B48]"
                />
                <span>Remember Credentials</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password recovery: Contact the Chief Librarian or register a new research account.')}
                className="font-medium text-[#E5C477] hover:text-[#F0E3C6] transition-colors"
              >
                Forgot Cipher?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-xs flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#24090F]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Enter Repository</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-[#24090F]" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs font-serif uppercase tracking-wider text-[#C8B99F] mt-8">
            New to the Academy?{' '}
            <Link to="/signup" className="font-bold text-[#E5C477] hover:text-[#F0E3C6] transition-colors">
              Inscribe Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
