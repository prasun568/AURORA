import React from 'react';
import { Citation } from '../types';
import { ExternalLink, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface CitationPanelProps {
  citations: Citation[];
}

export default function CitationPanel({ citations }: CitationPanelProps) {
  if (!citations || citations.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-sm">No citations extracted or verified for this paper.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
      {citations.map((cite, index) => {
        const conf = typeof cite.confidence === 'number' ? cite.confidence : 0.85;
        const confPercent = Math.round(conf * 100);

        // Confidence bar color
        let barColor = 'bg-emerald-500';
        let barTextColor = 'text-emerald-700';
        if (conf < 0.4) {
          barColor = 'bg-red-500';
          barTextColor = 'text-red-700';
        } else if (conf <= 0.7) {
          barColor = 'bg-amber-500';
          barTextColor = 'text-amber-700';
        }

        // Status badge
        let statusBadge = (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>VERIFIED</span>
          </span>
        );
        if (cite.status === 'PARTIAL' || (!cite.verified && conf >= 0.4)) {
          statusBadge = (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3 h-3" />
              <span>PARTIAL</span>
            </span>
          );
        } else if (cite.status === 'REJECTED' || (!cite.verified && conf < 0.4)) {
          statusBadge = (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
              <XCircle className="w-3 h-3" />
              <span>REJECTED</span>
            </span>
          );
        }

        return (
          <div
            key={index}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs shrink-0 mt-0.5">
                  [{index + 1}]
                </span>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                    {cite.title}
                  </h4>

                  {cite.authors && cite.authors.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {cite.authors.slice(0, 3).join(', ')}
                      {cite.authors.length > 3 ? ' et al.' : ''}
                      {cite.year ? ` (${cite.year})` : ''}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
                    {cite.doi && (
                      <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        DOI: {cite.doi}
                      </span>
                    )}

                    {cite.url && (
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-aurora-600 hover:text-aurora-700 font-medium"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">{statusBadge}</div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-400 font-medium">Semantic Match:</span>
              <div className="flex items-center space-x-2.5 flex-1 max-w-xs">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${barColor} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${confPercent}%` }}
                  />
                </div>
                <span className={`font-bold font-mono text-[11px] ${barTextColor}`}>
                  {confPercent}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
