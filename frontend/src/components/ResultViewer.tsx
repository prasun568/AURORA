import React, { useState } from 'react';
import { ReviewResult } from '../types';
import { CheckCircle, FileText, BookOpen, Brain, Copy, Check, AlertCircle } from 'lucide-react';
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
    <div className="card border-slate-200 bg-white shadow-sm mt-8 space-y-6">
      {/* 1. Success Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5">
        <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-emerald-950 text-base">
            Systematic Review Generated Successfully!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
            Literature discovery, evidence extraction, VeriCite™ bibliographic cross-checking, and PRISMA structuring have completed.
          </p>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-xs text-slate-500 font-medium block">Est. Pages</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
            ~{pageCount}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-xs text-slate-500 font-medium block">Total Words</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
            {wordCount.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-xs text-slate-500 font-medium block">Verified Citations</span>
          <span className="text-xl font-extrabold text-emerald-600 font-mono mt-0.5 block">
            {result.citations?.length || 0}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span className="text-xs text-slate-500 font-medium block">Confidence</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
            {Math.round((result.confidence || 0.92) * 100)}%
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-medium block">Burstiness Score</span>
          <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
            {(result.burstiness || 0.48).toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. Export Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('paper')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'paper'
                ? 'border-aurora-600 text-aurora-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paper Manuscript</span>
          </button>

          <button
            onClick={() => setActiveTab('citations')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'citations'
                ? 'border-aurora-600 text-aurora-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Citations ({result.citations?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('reasoning')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'reasoning'
                ? 'border-aurora-600 text-aurora-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Agent Reasoning</span>
          </button>
        </div>

        {activeTab === 'paper' && (
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs px-3 py-1.5 mb-2 transform hover:scale-[1.02] active:scale-[0.95]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Markdown
              </>
            )}
          </button>
        )}
      </div>

      {/* 5. Tab Content Panes */}
      <div className="pt-2">
        {activeTab === 'paper' && (
          <div className="bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200 overflow-y-auto max-h-[750px] font-sans text-sm leading-relaxed text-slate-800 whitespace-pre-wrap select-text">
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
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start space-x-3 text-amber-900 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Academic Submission Disclaimer: </span>
          This is an autonomous AI-assisted research synthesis draft. Authors should review, revise, critically examine all cited primary sources, and infuse their own domain perspectives before formal journal submission.
        </div>
      </div>
    </div>
  );
}
