import React from 'react';
import { Phase } from '../types';
import { Clock, Loader2, Check, AlertCircle } from 'lucide-react';

interface ProgressTimelineProps {
  phases: Phase[];
}

const AGENT_MAP: Record<string, string> = {
  planner: 'Planner Agent',
  searcher: 'Searcher Agent',
  screener: 'Screener Agent',
  reader: 'Reader Agent',
  analyzer: 'Analyzer Agent',
  writer: 'Writer Agent',
  polish: 'Polish Agent',
  citation_validator: 'Citation Validator',
  quality_control: 'QC Agent',
  formatter: 'Formatter Agent',
};

export default function ProgressTimeline({ phases }: ProgressTimelineProps) {
  const avgProgress = Math.round(
    phases.reduce((sum, p) => sum + (p.progress || 0), 0) / Math.max(phases.length, 1)
  );

  return (
    <div className="card my-6 border-slate-200 bg-white shadow-sm p-6">
      {/* Overall Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-aurora-600 animate-pulse" />
              <span>Multi-Agent Research Pipeline Execution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              10 autonomous pipeline stages coordinating academic discovery, extraction, verification, and drafting
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-aurora-600 font-mono">{avgProgress}%</span>
            <span className="text-[11px] text-slate-400 block font-medium">Pipeline Progress</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-aurora-600 via-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      {/* Row-by-Row Phase List */}
      <div className="space-y-2.5">
        {phases.map((phase, idx) => {
          const num = String(idx + 1).padStart(2, '0');
          const agentTag = AGENT_MAP[phase.name] || 'AI Agent';
          const isComplete = phase.status === 'completed' || (phase.progress && phase.progress >= 100);
          const isActive = phase.status === 'in_progress';
          const isError = phase.status === 'failed';

          let stateStyle = 'bg-slate-50 border-slate-200 text-slate-600';
          let icon = <Clock className="w-4 h-4 text-slate-400" />;
          let barFill = 'bg-slate-300';

          if (isComplete) {
            stateStyle = 'bg-emerald-50/70 border-emerald-200 text-emerald-900';
            icon = <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />;
            barFill = 'bg-emerald-500';
          } else if (isActive) {
            stateStyle = 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm ring-1 ring-blue-500/20';
            icon = <Loader2 className="w-4 h-4 text-aurora-600 animate-spin" />;
            barFill = 'bg-aurora-600';
          } else if (isError) {
            stateStyle = 'bg-red-50 border-red-200 text-red-900';
            icon = <AlertCircle className="w-4 h-4 text-red-600" />;
            barFill = 'bg-red-500';
          }

          const currentPct = isComplete ? 100 : phase.progress || 0;

          return (
            <div
              key={phase.name}
              className={`px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 ${stateStyle}`}
            >
              {/* Left Column: Icon + Number + Name + Agent Tag */}
              <div className="flex items-center space-x-3.5 min-w-[280px]">
                <div className="w-7 h-7 rounded-lg bg-white/80 border border-slate-200/60 flex items-center justify-center shrink-0 shadow-xs">
                  {icon}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
                    {num}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900">
                    {phase.label.replace(/^\d+\.\s*/, '')}
                  </span>
                </div>

                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-white/70 border border-slate-200/80 text-slate-600 shrink-0 uppercase font-mono">
                  {agentTag}
                </span>
              </div>

              {/* Right Column: Mini Progress Bar + Percentage */}
              <div className="flex items-center space-x-3 flex-1 sm:max-w-xs justify-end">
                <div className="w-full bg-white/80 border border-slate-200/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${barFill} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${currentPct}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-slate-700 w-10 text-right">
                  {currentPct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
