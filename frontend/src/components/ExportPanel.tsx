import React, { useState } from 'react';
import { FileText, Download, Check, Loader2, BookOpen, Scroll, FileCode2 } from 'lucide-react';
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
    showToast(`Inscribing ${format.toUpperCase()} export...`);

    try {
      if (format === 'docx') {
        if (taskId) {
          try {
            const blob = await api.exportDocx(taskId);
            downloadBlob(blob, `aurora-review-${taskId.slice(0, 8)}.docx`);
            showToast('Word manuscript (.docx) exported successfully!');
            return;
          } catch (e) {
            console.error('DOCX export error:', e);
          }
        }
        if (markdownContent) {
          const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
          downloadBlob(blob, 'aurora-review-draft.md');
          showToast('Markdown draft exported!');
        } else {
          showToast('Awaiting manuscript compilation before exporting.');
        }
      } else if (format === 'pdf') {
        if (taskId) {
          try {
            const blob = await api.exportPdf(taskId);
            downloadBlob(blob, `aurora-review-${taskId.slice(0, 8)}.pdf`);
            showToast('Academic PDF exported successfully!');
            return;
          } catch (e) {
            console.error('PDF export error:', e);
          }
        }
        if (markdownContent) {
          const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
          downloadBlob(blob, 'aurora-review-draft.md');
          showToast('Markdown draft exported!');
        } else {
          showToast('Awaiting manuscript compilation before exporting.');
        }
      } else if (format === 'latex') {
        if (taskId) {
          try {
            const blob = await api.exportLatex(taskId);
            downloadBlob(blob as any, `aurora-latex-${taskId.slice(0, 8)}.zip`);
            showToast('LaTeX package (.zip) exported successfully!');
            return;
          } catch (e) {
            console.error('LaTeX export error:', e);
          }
        }
        if (markdownContent) {
          const blob = new Blob([markdownContent], { type: 'text/plain;charset=utf-8' });
          downloadBlob(blob, 'aurora-review.tex');
          showToast('LaTeX template created!');
        }
      } else if (format === 'bibtex') {
        const bib = bibtexContent || `@article{aurora2026,\n  title={Systematic Literature Review},\n  author={AURORA Multi-Agent Framework},\n  year={2026}\n}`;
        const blob = new Blob([bib], { type: 'application/x-bibtex;charset=utf-8' });
        downloadBlob(blob, 'references.bib');
        showToast('BibTeX library exported!');
      }
    } catch (err) {
      console.error(`Export failed for ${format}:`, err);
      showToast(`Error preparing ${format.toUpperCase()} export`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const buttonClass =
    'relative inline-flex items-center justify-center px-4 py-2.5 text-xs font-serif font-bold uppercase tracking-wider rounded-xl border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#350E18] text-[#F6EBD5] px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-serif border border-[#C69B48]">
          <Check className="w-4 h-4 text-[#E5C477]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Word Button */}
        <button
          onClick={() => handleExport('docx')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-[#350E18] hover:bg-[#401923] text-[#F6EBD5] border-[#75502F] hover:border-[#C69B48]`}
        >
          {downloadingFormat === 'docx' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#E5C477]" />
          ) : (
            <Download className="w-4 h-4 mr-2 text-[#C69B48]" />
          )}
          <span>Word DOCX</span>
        </button>

        {/* PDF Button */}
        <button
          onClick={() => handleExport('pdf')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-[#350E18] hover:bg-[#401923] text-[#F6EBD5] border-[#75502F] hover:border-[#C69B48]`}
        >
          {downloadingFormat === 'pdf' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#E5C477]" />
          ) : (
            <Download className="w-4 h-4 mr-2 text-[#C69B48]" />
          )}
          <span>PDF Manuscript</span>
        </button>

        {/* LaTeX Button */}
        <button
          onClick={() => handleExport('latex')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-[#350E18] hover:bg-[#401923] text-[#F6EBD5] border-[#75502F] hover:border-[#C69B48]`}
        >
          {downloadingFormat === 'latex' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#E5C477]" />
          ) : (
            <Download className="w-4 h-4 mr-2 text-[#C69B48]" />
          )}
          <span>LaTeX Package</span>
        </button>

        {/* BibTeX Button */}
        <button
          onClick={() => handleExport('bibtex')}
          disabled={downloadingFormat !== null}
          className={`${buttonClass} bg-gradient-to-r from-[#C69B48] to-[#E5C477] text-[#24090F] border-transparent font-bold`}
        >
          {downloadingFormat === 'bibtex' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#24090F]" />
          ) : (
            <Download className="w-4 h-4 mr-2 text-[#24090F]" />
          )}
          <span>BibTeX (.bib)</span>
        </button>
      </div>
    </div>
  );
}
