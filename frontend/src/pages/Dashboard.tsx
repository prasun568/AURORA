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
  const [currentConfig, setCurrentConfig] = useState<any>(null);

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

  // Live Polling interval to ensure real-time progression even if WS packets drop
  useEffect(() => {
    if (!isGenerating || !taskId) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await api.getStatus(taskId);

        // Advance phases based on polling step
        const step = (statusRes as any).step || '';
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

        if (statusRes.status === 'completed') {
          const res = await api.getResult(taskId);
          setResult(res);
          setIsGenerating(false);
          setPhases((prev) => prev.map((p) => ({ ...p, status: 'completed', progress: 100 })));
        }
      } catch (e) {
        // Silent catch during polling
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isGenerating, taskId]);

  // Smooth progress ticker while awaiting agent node completion
  useEffect(() => {
    if (!isGenerating) return;

    const ticker = setInterval(() => {
      setPhases((prevPhases) => {
        let changed = false;
        const updated = prevPhases.map((phase) => {
          if (phase.status === 'in_progress' && phase.progress < 90) {
            changed = true;
            return { ...phase, progress: Math.min(90, phase.progress + 6) };
          }
          return phase;
        });
        return changed ? updated : prevPhases;
      });
    }, 850);

    return () => clearInterval(ticker);
  }, [isGenerating]);

  const handleStart = async (config: any) => {
    setCurrentConfig(config);
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
    <div className="flex h-screen bg-[#24090F] bg-library-grid text-[#F6EBD5] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={user} isConnected={isConnected} isGenerating={isGenerating} />

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'new' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-serif font-black tracking-wider uppercase text-[#F6EBD5]">
                  Research Scribe & Inscription
                </h1>
                <p className="text-xs sm:text-sm font-academic text-[#C8B99F] mt-1">
                  Configure research scope and dispatch the twelve-agent autonomous literature synthesis intelligence.
                </p>
              </div>

              <ReviewConfig onStart={handleStart} isGenerating={isGenerating} />

              {isGenerating && <ProgressTimeline phases={phases} />}

              {result && (
                <ResultViewer
                  result={result}
                  taskId={taskId || result.task_id}
                  template={result.template || currentConfig?.template}
                  citationStyle={result.citation_style || currentConfig?.citation_style}
                />
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto academia-card p-6 border border-[#75502F] bg-[#401923]/90">
              <div className="flex items-center space-x-3 pb-4 border-b border-[#75502F]/60 mb-6">
                <History className="w-5 h-5 text-[#C69B48]" />
                <h2 className="text-lg font-serif font-bold tracking-wider uppercase text-[#F6EBD5]">
                  Manuscript Vault
                </h2>
              </div>
              <p className="text-sm font-academic text-[#C8B99F] text-center py-12">
                No archived manuscripts found in this session. Initiate a new research synthesis from the Scribe.
              </p>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="max-w-4xl mx-auto academia-card p-6 border border-[#75502F] bg-[#401923]/90">
              <div className="flex items-center space-x-3 pb-4 border-b border-[#75502F]/60 mb-6">
                <LayoutTemplate className="w-5 h-5 text-[#C69B48]" />
                <h2 className="text-lg font-serif font-bold tracking-wider uppercase text-[#F6EBD5]">
                  Publishing Formats & Templates
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['IEEE Conference', 'IEEE Journal', 'APA Journal', 'ACM Conference', 'Springer Nature LNCS', 'Elsevier Standard'].map((tmpl) => (
                  <div key={tmpl} className="p-4 bg-[#24090F]/80 border border-[#75502F] rounded-xl hover:border-[#C69B48] transition-colors">
                    <span className="font-serif font-bold text-[#E5C477] text-sm block">{tmpl}</span>
                    <span className="text-xs font-academic text-[#C8B99F] mt-1 block">
                      Authentic peer-reviewed typography and automated reference formatting.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto academia-card p-6 border border-[#75502F] bg-[#401923]/90">
              <div className="flex items-center space-x-3 pb-4 border-b border-[#75502F]/60 mb-6">
                <Settings className="w-5 h-5 text-[#C69B48]" />
                <h2 className="text-lg font-serif font-bold tracking-wider uppercase text-[#F6EBD5]">
                  Twelve Agents & Architecture Settings
                </h2>
              </div>
              <div className="space-y-4 text-sm font-academic text-[#F6EBD5]">
                <div className="flex items-center justify-between p-3.5 bg-[#24090F]/80 rounded-xl border border-[#75502F]">
                  <div>
                    <span className="font-serif font-bold text-[#F6EBD5] block">LangGraph Orchestrator</span>
                    <span className="text-xs text-[#C8B99F]">Groq Llama 3.3 70B & Gemini 2.5 Flash</span>
                  </div>
                  <span className="badge">Twelve Agents Active</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-[#24090F]/80 rounded-xl border border-[#75502F]">
                  <div>
                    <span className="font-serif font-bold text-[#F6EBD5] block">VeriCite™ Validation Pipeline</span>
                    <span className="text-xs text-[#C8B99F]">CrossRef Scholarly Registry & SBERT Embeddings</span>
                  </div>
                  <span className="badge">Three Layers Enforced</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
