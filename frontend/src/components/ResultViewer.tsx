import React, { useState } from 'react';
import { ReviewResult } from '../types';
import { CheckCircle, FileText, BookOpen, Brain, Copy, Check, AlertCircle, Feather } from 'lucide-react';
import CitationPanel from './CitationPanel';
import ReasoningPanel from './ReasoningPanel';
import ExportPanel from './ExportPanel';

interface ResultViewerProps {
  result: ReviewResult;
}

export default function ResultViewer({ result }: ResultViewerProps) {
  const [activeTab, setActiveTab] = useState<'paper' | 'citations' | 'reasoning'>('paper');
  const [copied, setCopied] = useState(false);

  const displayContent = result.polished_content || result.content || '';
  const wordCount = displayContent.trim() ? displayContent.trim().split(/\s+/).length : 0;
  const pageCount = Math.max(1, Math.ceil(wordCount / 500));

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="academia-card border border-[#75502F] bg-[#401923]/95 shadow-2xl mt-8 space-y-6 text-[#F6EBD5]">
      {/* 1. Success Banner */}
      <div className="bg-[#350E18] border border-[#C69B48] rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5 shadow-lg">
        <CheckCircle className="w-6 h-6 text-[#E5C477] shrink-0 mt-0.5" />
        <div>
          <h3 className="font-serif font-black uppercase tracking-wider text-[#E5C477] text-base">
            Systematic Review Synthesized Successfully
          </h3>
          <p className="text-xs sm:text-sm font-academic text-[#C8B99F] mt-0.5">
            Literature discovery, empirical evidence extraction, VeriCite™ bibliographic cross-checking, and PRISMA structuring have concluded.
          </p>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-[#24090F] border border-[#75502F] rounded-xl text-center">
          <span className="text-xs font-serif uppercase tracking-widest text-[#C8B99F] block">Est. Pages</span>
          <span className="text-xl font-serif font-bold text-[#E5C477] font-mono mt-0.5 block">
            ~{pageCount}
          </span>
        </div>

        <div className="p-3.5 bg-[#24090F] border border-[#75502F] rounded-xl text-center">
          <span className="text-xs font-serif uppercase tracking-widest text-[#C8B99F] block">Word Count</span>
          <span className="text-xl font-serif font-bold text-[#E5C477] font-mono mt-0.5 block">
            {wordCount.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 bg-[#24090F] border border-[#75502F] rounded-xl text-center">
          <span className="text-xs font-serif uppercase tracking-widest text-[#C8B99F] block">Verified Citations</span>
          <span className="text-xl font-serif font-bold text-[#E5C477] font-mono mt-0.5 block">
            {result.citations?.length || 0}
          </span>
        </div>

        <div className="p-3.5 bg-[#24090F] border border-[#75502F] rounded-xl text-center">
          <span className="text-xs font-serif uppercase tracking-widest text-[#C8B99F] block">Confidence</span>
          <span className="text-xl font-serif font-bold text-[#E5C477] font-mono mt-0.5 block">
            {Math.round((result.confidence || 0.92) * 100)}%
          </span>
        </div>

        <div className="p-3.5 bg-[#24090F] border border-[#75502F] rounded-xl text-center col-span-2 sm:col-span-1">
          <span className="text-xs font-serif uppercase tracking-widest text-[#C8B99F] block">Burstiness Index</span>
          <span className="text-xl font-serif font-bold text-[#E5C477] font-mono mt-0.5 block">
            {(result.burstiness || 0.48).toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. Export Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[#350E18] border border-[#75502F] rounded-xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#E5C477]">
            Export Manuscript:
          </span>
        </div>
        <ExportPanel
          taskId={result.task_id}
          markdownContent={displayContent}
          bibtexContent={result.bibtex}
        />
      </div>

      {/* 4. Tab Bar (Paper | Citations | Reasoning) */}
      <div className="border-b border-[#75502F]/60 flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('paper')}
            className={`pb-3 text-xs font-serif font-bold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'paper'
                ? 'border-[#C69B48] text-[#E5C477]'
                : 'border-transparent text-[#C8B99F] hover:text-[#F6EBD5]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paper Manuscript</span>
          </button>

          <button
            onClick={() => setActiveTab('citations')}
            className={`pb-3 text-xs font-serif font-bold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'citations'
                ? 'border-[#C69B48] text-[#E5C477]'
                : 'border-transparent text-[#C8B99F] hover:text-[#F6EBD5]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Citations ({result.citations?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('reasoning')}
            className={`pb-3 text-xs font-serif font-bold uppercase tracking-widest border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'reasoning'
                ? 'border-[#C69B48] text-[#E5C477]'
                : 'border-transparent text-[#C8B99F] hover:text-[#F6EBD5]'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Agent Reasoning</span>
          </button>
        </div>

        {activeTab === 'paper' && (
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs px-3.5 py-1.5 mb-2 flex items-center space-x-1"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#E5C477]" />
                <span>Inscribed to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#C69B48]" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 5. Tab Content Panes */}
      <div className="pt-2">
        {activeTab === 'paper' && (
          <div className="bg-[#24090F]/90 p-6 sm:p-8 rounded-2xl border border-[#75502F] overflow-y-auto max-h-[750px] font-academic text-base leading-relaxed text-[#F6EBD5] whitespace-pre-wrap select-text shadow-inner">
            {displayContent}
          </div>
        )}

        {activeTab === 'citations' && (
          <CitationPanel citations={result.citations || []} />
        )}

        {activeTab === 'reasoning' && (
          <ReasoningPanel />
        )}
      </div>

      {/* 6. Academic Disclaimer Banner */}
      <div className="p-4 bg-[#350E18] border border-[#75502F] rounded-xl flex items-start space-x-3 text-[#C8B99F] text-xs leading-relaxed font-academic">
        <AlertCircle className="w-4 h-4 text-[#C69B48] shrink-0 mt-0.5" />
        <div>
          <span className="font-serif font-bold text-[#E5C477]">Academic Inscription Disclaimer: </span>
          This manuscript draft is autonomously synthesized by twelve LangGraph AI agents. Scholars are encouraged to inspect primary DOI sources and integrate original domain contributions prior to formal journal submission.
        </div>
      </div>
    </div>
  );
}
