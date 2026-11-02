import React from 'react';
import { Phase } from '../types';
import { Clock, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';

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
    <div className="academia-card my-6 border border-[#75502F] bg-[#401923]/95 shadow-2xl p-6 text-[#F6EBD5]">
      {/* Overall Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h3 className="text-base font-serif font-black uppercase tracking-wider text-[#F6EBD5] flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5C477] animate-pulse" />
              <span>Multi-Agent Research Pipeline Execution</span>
            </h3>
            <p className="text-xs font-academic text-[#C8B99F] mt-0.5">
              Autonomous LangGraph nodes orchestrating literature discovery, empirical extraction, CrossRef verification, and manuscript composition
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-serif font-bold text-[#E5C477] font-mono">{avgProgress}%</span>
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#C8B99F] block">
              Synthesis State
            </span>
          </div>
        </div>

        {/* Global Antique Gold Progress Bar */}
        <div className="w-full bg-[#24090F] border border-[#75502F] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#C69B48] via-[#E5C477] to-[#C69B48] h-2.5 rounded-full transition-all duration-500 shadow-sm"
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

          let stateStyle = 'bg-[#24090F]/70 border-[#75502F]/50 text-[#C8B99F]/70';
          let icon = <Clock className="w-4 h-4 text-[#75502F]" />;
          let barFill = 'bg-[#75502F]';

          if (isComplete) {
            stateStyle = 'bg-[#350E18] border-[#C69B48]/50 text-[#E5C477]';
            icon = <Check className="w-4 h-4 text-[#E5C477] stroke-[2.5]" />;
            barFill = 'bg-[#C69B48]';
          } else if (isActive) {
            stateStyle = 'bg-[#350E18] border-2 border-[#E5C477] text-[#F6EBD5] shadow-lg shadow-[#C69B48]/15';
            icon = <Loader2 className="w-4 h-4 text-[#E5C477] animate-spin" />;
            barFill = 'bg-gradient-to-r from-[#C69B48] to-[#E5C477]';
          } else if (isError) {
            stateStyle = 'bg-[#24090F] border-[#C69B48] text-[#E5C477]';
            icon = <AlertCircle className="w-4 h-4 text-[#E5C477]" />;
            barFill = 'bg-[#75502F]';
          }

          const currentPct = isComplete ? 100 : phase.progress || 0;

          return (
            <div
              key={phase.name}
              className={`px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 ${stateStyle}`}
            >
              {/* Left Column: Icon + Number + Name + Agent Tag */}
              <div className="flex items-center space-x-3.5 min-w-[280px]">
                <div className="w-7 h-7 rounded-lg bg-[#24090F] border border-[#75502F] flex items-center justify-center shrink-0">
                  {icon}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#C69B48] shrink-0">
                    {num}
                  </span>
                  <span className="font-serif font-semibold text-xs sm:text-sm text-[#F6EBD5]">
                    {phase.label.replace(/^\d+\.\s*/, '')}
                  </span>
                </div>

                <span className="hidden md:inline-block px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wide bg-[#24090F] border border-[#75502F] text-[#C8B99F] shrink-0 uppercase">
                  {agentTag}
                </span>
              </div>

              {/* Right Column: Mini Progress Bar + Percentage */}
              <div className="flex items-center space-x-3 flex-1 sm:max-w-xs justify-end">
                <div className="w-full bg-[#24090F] border border-[#75502F]/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${barFill} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${currentPct}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-[#E5C477] w-10 text-right">
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
