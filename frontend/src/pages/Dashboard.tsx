import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ReviewConfig from '../components/ReviewConfig';
import ProgressTimeline from '../components/ProgressTimeline';
import ResultViewer from '../components/ResultViewer';
import { useWebSocket } from '../hooks/useWebSocket';
import { api } from '../services/api';
import { Phase, ReviewResult } from '../types';
import { LayoutTemplate, History, Settings, FileText, CheckCircle2 } from 'lucide-react';

const INITIAL_PHASES: Phase[] = [
  { name: 'planner', label: '1. Planning (Planner)', status: 'pending', progress: 0 },
  { name: 'searcher', label: '2. Literature Search (Searcher)', status: 'pending', progress: 0 },
  { name: 'screener', label: '3. Screening (Screener)', status: 'pending', progress: 0 },
  { name: 'reader', label: '4. Deep Reading (Reader)', status: 'pending', progress: 0 },
  { name: 'analyzer', label: '5. Thematic Analysis (Analyzer)', status: 'pending', progress: 0 },
  { name: 'writer', label: '6. Writing (Writer)', status: 'pending', progress: 0 },
  { name: 'polish', label: '7. Polish (Polish)', status: 'pending', progress: 0 },
  { name: 'citation_validator', label: '8. Citation Verification (Citation Validator)', status: 'pending', progress: 0 },
  { name: 'quality_control', label: '9. Quality Control (QC)', status: 'pending', progress: 0 },
  { name: 'formatter', label: '10. Formatting (Formatter)', status: 'pending', progress: 0 },
];

const STEP_TO_PHASE_INDEX: Record<string, number> = {
  'planning_complete': 0,
  'search_complete': 1,
  'screening_complete': 2,
  'reading_complete': 3,
  'analysis_complete': 4,
  'writing_complete': 5,
  'polish_complete': 6,
  'polish_skipped': 6,
  'citation_verification_complete': 7,
  'quality_control_complete': 8,
  'mediation_complete': 8,
  'formatting_complete': 9,
};

import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'templates' | 'settings'>('new');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);

  const { messages, isConnected } = useWebSocket(taskId);

  // Update phases when WebSocket messages arrive
  useEffect(() => {
    if (!messages.length) return;

    const latest = messages[messages.length - 1];
    const step = latest.step || '';

    if (step in STEP_TO_PHASE_INDEX) {
      const activeIdx = STEP_TO_PHASE_INDEX[step];

      setPhases((prevPhases) =>
        prevPhases.map((phase, idx) => {
          if (idx < activeIdx) {
            return { ...phase, status: 'completed', progress: 100 };
          }
          if (idx === activeIdx) {
            return { ...phase, status: 'completed', progress: 100 };
          }
          if (idx === activeIdx + 1) {
            return { ...phase, status: 'in_progress', progress: 50 };
          }
          return { ...phase, status: 'pending', progress: 0 };
        })
      );
    }

    // Check if pipeline has finished
    if (latest.type === 'result' || step === 'formatting_complete' || (latest.progress && latest.progress >= 100)) {
      if (taskId) {
        api.getResult(taskId).then((res) => {
          setResult(res);
          setIsGenerating(false);
          setPhases((prev) => prev.map((p) => ({ ...p, status: 'completed', progress: 100 })));
        }).catch((err) => {
          console.warn('Could not fetch review result:', err);
          setIsGenerating(false);
        });
      }
    }
  }, [messages, taskId]);

  // Fallback Polling interval to ensure completion even if WS drops
  useEffect(() => {
    if (!isGenerating || !taskId) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await api.getStatus(taskId);
        if (statusRes.status === 'completed') {
          const res = await api.getResult(taskId);
          setResult(res);
          setIsGenerating(false);
          setPhases((prev) => prev.map((p) => ({ ...p, status: 'completed', progress: 100 })));
        }
      } catch (e) {
        // Silent catch during polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isGenerating, taskId]);

  const handleStart = async (config: any) => {
    setResult(null);
    setPhases(
      INITIAL_PHASES.map((p, idx) =>
        idx === 0 ? { ...p, status: 'in_progress', progress: 20 } : { ...p, status: 'pending', progress: 0 }
      )
    );
    setIsGenerating(true);

    try {
      const response = await api.startReview(config);
      setTaskId(response.task_id);
    } catch (err) {
      console.error('Failed to start review generation:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={user} isConnected={isConnected} />

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'new' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">New Review Paper</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Configure review criteria and dispatch the 11-agent autonomous systematic review engine.
                </p>
              </div>

              <ReviewConfig onStart={handleStart} isGenerating={isGenerating} />

              {isGenerating && <ProgressTimeline phases={phases} />}

              {result && <ResultViewer result={result} />}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto card">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-6">
                <History className="w-5 h-5 text-aurora-600" />
                <h2 className="text-lg font-bold text-slate-900">Review History</h2>
              </div>
              <p className="text-sm text-slate-500 text-center py-12">
                No archived reviews found. Start a new systematic review from the dashboard.
              </p>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="max-w-4xl mx-auto card">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-6">
                <LayoutTemplate className="w-5 h-5 text-aurora-600" />
                <h2 className="text-lg font-bold text-slate-900">Publishing Templates</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['IEEE Conference', 'IEEE Journal', 'APA Journal', 'ACM Conference', 'Springer Nature LNCS', 'Elsevier Standard'].map((tmpl) => (
                  <div key={tmpl} className="p-4 border border-slate-200 rounded-xl hover:border-aurora-400 transition-colors">
                    <span className="font-semibold text-slate-900 text-sm block">{tmpl}</span>
                    <span className="text-xs text-slate-500 mt-1 block">Standard verified citation formatting and column layout.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto card">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 mb-6">
                <Settings className="w-5 h-5 text-aurora-600" />
                <h2 className="text-lg font-bold text-slate-900">Settings & Agent Preferences</h2>
              </div>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-900 block">LLM Provider</span>
                    <span className="text-xs text-slate-500">Groq Llama 3.3 70B & Gemini 1.5 Flash</span>
                  </div>
                  <span className="badge bg-emerald-50 text-emerald-700">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-900 block">VeriCite™ Validation</span>
                    <span className="text-xs text-slate-500">CrossRef live API & SBERT Embedding Similarity</span>
                  </div>
                  <span className="badge bg-emerald-50 text-emerald-700">Enforced</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
