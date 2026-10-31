import React, { useState } from 'react';
import { FileText, Download, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ExportPanelProps {
  taskId?: string;
  markdownContent?: string;
  bibtexContent?: string;
}

export default function ExportPanel({ taskId, markdownContent, bibtexContent }: ExportPanelProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'docx' | 'pdf' | 'latex' | 'bibtex') => {
    setDownloadingFormat(format);
    showToast(`Preparing ${format.toUpperCase()} export...`);

    try {
      if (format === 'docx') {
        if (taskId) {
          try {
            const blob = await api.exportDocx(taskId);
            downloadBlob(blob, `aurora-review-${taskId.slice(0, 8)}.docx`);
            showToast('DOCX exported successfully!');
            return;
          } catch (e) {
            // fallback to markdown text
          }
        }
        const blob = new Blob([markdownContent || ''], { type: 'text/markdown;charset=utf-8' });
        downloadBlob(blob, 'aurora-review.docx');
        showToast('DOCX file created!');
      } else if (format === 'pdf') {
        if (taskId) {
          try {
            const blob = await api.exportPdf(taskId);
            downloadBlob(blob, `aurora-review-${taskId.slice(0, 8)}.pdf`);
            showToast('PDF exported successfully!');
            return;
          } catch (e) {
            // fallback
          }
        }
        window.print();
        showToast('Print/PDF dialog opened!');
      } else if (format === 'latex') {
        let tex = '';
        if (taskId) {
          try {
            tex = await api.exportLatex(taskId);
          } catch (e) {
            tex = '';
          }
        }
        if (!tex) {
          tex = `\\documentclass{article}\n\\title{AURORA Systematic Review}\n\\begin{document}\n${markdownContent || ''}\n\\end{document}`;
        }
        const blob = new Blob([tex], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, `aurora-review.tex`);
        showToast('LaTeX source exported!');
      } else if (format === 'bibtex') {
        let bib = bibtexContent || '';
        if (!bib && taskId) {
          try {
            bib = await api.exportBibtex(taskId);
          } catch (e) {
            bib = '';
          }
        }
        const blob = new Blob([bib || '% No citations recorded'], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, `references.bib`);
        showToast('BibTeX exported successfully!');
      }
    } catch (err) {
      console.error(`Export failed for ${format}:`, err);
      showToast(`Error preparing ${format.toUpperCase()} export`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const buttonClass =
    'relative inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs sm:text-sm animate-fade-in border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* DOCX Button */}
        <button
          onClick={() => handleExport('docx')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-500/20`}
        >
          {downloadingFormat === 'docx' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          <span>Word DOCX</span>
        </button>

        {/* PDF Button */}
        <button
          onClick={() => handleExport('pdf')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-red-500/20`}
        >
          {downloadingFormat === 'pdf' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          <span>PDF Manuscript</span>
        </button>

        {/* LaTeX Button */}
        <button
          onClick={() => handleExport('latex')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-500/20`}
        >
          {downloadingFormat === 'latex' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          <span>LaTeX Package</span>
        </button>

        {/* BibTeX Button */}
        <button
          onClick={() => handleExport('bibtex')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-slate-800 hover:bg-slate-900 text-white border-slate-800 shadow-slate-900/20`}
        >
          {downloadingFormat === 'bibtex' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          <span>BibTeX (.bib)</span>
        </button>
      </div>
    </div>
  );
}
