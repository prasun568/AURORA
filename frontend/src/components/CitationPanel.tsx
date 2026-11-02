import React from 'react';
import { Citation } from '../types';
import { ExternalLink, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

interface CitationPanelProps {
  citations: Citation[];
}

export default function CitationPanel({ citations }: CitationPanelProps) {
  if (!citations || citations.length === 0) {
    return (
      <div className="text-center py-12 text-[#C8B99F] bg-[#24090F] rounded-xl border border-dashed border-[#75502F]">
        <p className="text-sm font-academic">No bibliographic citations indexed for this manuscript.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
      {citations.map((cite, index) => {
        const conf = typeof cite.confidence === 'number' ? cite.confidence : 0.85;
        const confPercent = Math.round(conf * 100);

        const isVerified = cite.status === 'VERIFIED' || cite.verified;
        const isPartial = cite.status === 'PARTIAL' || (!cite.verified && conf >= 0.35);

        let statusBadge = (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10.5px] font-serif font-bold uppercase tracking-wider bg-[#072412] text-[#4ADE80] border border-[#166534] shadow-[0_0_10px_rgba(74,222,128,0.25)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
            <span>VERIFIED</span>
          </span>
        );
        let borderClass = 'border-l-4 border-l-[#22C55E]';
        let barGradient = 'bg-gradient-to-r from-[#14532D] to-[#22C55E]';
        let percentColor = 'text-[#4ADE80]';

        if (isPartial) {
          statusBadge = (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10.5px] font-serif font-bold uppercase tracking-wider bg-[#2D1F07] text-[#FACC15] border border-[#A16207] shadow-[0_0_10px_rgba(250,204,21,0.25)]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FACC15]" />
              <span>PARTIAL</span>
            </span>
          );
          borderClass = 'border-l-4 border-l-[#EAB308]';
          barGradient = 'bg-gradient-to-r from-[#B45309] to-[#FACC15]';
          percentColor = 'text-[#FACC15]';
        } else if (!isVerified) {
          statusBadge = (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10.5px] font-serif font-bold uppercase tracking-wider bg-[#24090F] text-[#F87171] border border-[#991B1B]">
              <XCircle className="w-3.5 h-3.5 text-[#F87171]" />
              <span>UNCONFIRMED</span>
            </span>
          );
          borderClass = 'border-l-4 border-l-[#EF4444]';
          barGradient = 'bg-[#7F1D1D]';
          percentColor = 'text-[#F87171]';
        }

        const displayTitle = cite.title || (cite as any).source_title || 'Scholarly Publication';

        return (
          <div
            key={index}
            className={`p-4 bg-[#350E18] border border-[#75502F] rounded-xl hover:border-[#C69B48] transition-all shadow-md ${borderClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#24090F] text-[#E5C477] font-serif font-bold text-xs shrink-0 mt-0.5 border border-[#75502F]">
                  [{index + 1}]
                </span>
                <div>
                  <h4 className="font-serif font-bold text-[#F6EBD5] text-sm leading-snug">
                    {displayTitle}
                  </h4>

                  {cite.authors && cite.authors.length > 0 && (
                    <p className="text-xs font-academic text-[#C8B99F] mt-1">
                      {cite.authors.slice(0, 3).join(', ')}
                      {cite.authors.length > 3 ? ' et al.' : ''}
                      {cite.year ? ` (${cite.year})` : ''}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
                    {cite.doi && (
                      <span className="text-[#E5C477] font-mono text-[11px] bg-[#24090F] px-2 py-0.5 rounded border border-[#75502F]/60">
                        DOI: {cite.doi}
                      </span>
                    )}

                    {cite.url && (
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[#E5C477] hover:text-[#F0E3C6] font-serif text-xs font-semibold"
                      >
                        <span>Examine Registry</span>
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
            <div className="mt-3.5 pt-3 border-t border-[#75502F]/50 flex items-center justify-between gap-4 text-xs font-academic">
              <span className="text-[#C8B99F]">Semantic Match Index:</span>
              <div className="flex items-center space-x-2.5 flex-1 max-w-xs">
                <div className="w-full bg-[#24090F] border border-[#75502F]/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${barGradient} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${confPercent}%` }}
                  />
                </div>
                <span className={`font-mono text-xs font-bold ${percentColor}`}>
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
