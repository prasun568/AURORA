import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Sparkles,
  Bot,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronDown,
  Rocket,
  Plus,
  Clock,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import axios from 'axios';

export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('aurora_token');
        const res = await axios.get('http://localhost:8000/api/review/history', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setRecentReviews(res.data || []);
      } catch (err) {
        // Expected if history endpoint is not present or user has no past reviews
        setRecentReviews([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* TOP NAVIGATION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aurora-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-aurora-500/20 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">AURORA</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pl-2.5 pr-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aurora-600 to-indigo-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-800 hidden sm:inline-block">
                  {user?.name || user?.email || 'Researcher'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-sm z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 truncate">{user?.name || 'Researcher'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Greeting */}
        <div className="text-center sm:text-left mb-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-aurora-50 text-aurora-700 border border-aurora-200 mb-4">
            Autonomous Literature Orchestrator
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'Researcher'}! 👋
          </h1>
          <p className="text-base text-slate-600 mt-2 max-w-2xl">
            Coordinate multi-agent academic intelligence to synthesize comprehensive, verifiable review papers following PRISMA guidelines.
          </p>
        </div>

        {/* Big CTA Banner */}
        <div className="mb-12 bg-gradient-to-r from-aurora-600 via-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-10 text-white shadow-xl shadow-aurora-500/15 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to generate your next review paper?
            </h2>
            <p className="text-blue-100 text-sm mt-2 leading-relaxed">
              Launch our 11 autonomous agents to discover literature, extract evidence, screen candidates, and produce publication-ready manuscripts.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="shrink-0 bg-white text-aurora-700 hover:bg-blue-50 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 text-base"
          >
            <Rocket className="w-5 h-5 text-aurora-600" />
            <span>Start New Review</span>
            <ArrowRight className="w-4 h-4 text-aurora-600 ml-1" />
          </button>
        </div>

        {/* 3 Feature Cards in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="card hover:border-aurora-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-aurora-600 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Multi-Agent Research</span>
            </h3>
            <p className="text-xs font-semibold text-aurora-600 mt-1 uppercase tracking-wider">
              12 AI Agents Mesh
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Planner, searcher, screener, reader, analyzer, writer, and mediator agents orchestrated with deterministic LangGraph execution.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>Verified Citations</span>
            </h3>
            <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wider">
              98% Semantic Accuracy
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              VeriCite™ engine matches every extracted claim against CrossRef and SBERT embeddings, rejecting any hallucinated sources.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span>All Formats Supported</span>
            </h3>
            <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">
              IEEE, APA, MLA, LaTeX
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Export completed manuscripts directly into IEEE 2-column templates, Springer LNCS, Word DOCX, and clean BibTeX libraries.
            </p>
          </div>
        </div>

        {/* Recent Reviews Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Systematic Reviews</h3>
              <p className="text-xs text-slate-500">History of dispatched literature synthesis tasks</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Review
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading recent reviews...
            </div>
          ) : recentReviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentReviews.map((rev, i) => (
                <div key={i} className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{rev.topic}</h4>
                    <span className="text-xs text-slate-500">{rev.review_type} • {rev.citation_style}</span>
                  </div>
                  <span className="badge bg-emerald-50 text-emerald-700">Completed</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">No reviews yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't generated any systematic reviews yet. Click below to launch your first AI synthesis pipeline.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary mt-4 text-xs px-4 py-2"
              >
                Start Your First Review
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
