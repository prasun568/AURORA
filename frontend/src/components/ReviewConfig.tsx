import React, { useState } from 'react';
import {
  Rocket,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Calendar,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { ReviewType, CitationStyle, WritingStyle, Template } from '../types';

interface ReviewConfigProps {
  onStart: (config: {
    topic: string;
    review_type: ReviewType;
    citation_style: CitationStyle;
    template: Template | string;
    writing_style: WritingStyle;
    date_start?: number;
    date_end?: number;
    max_papers: number;
    custom_template_name?: string;
    ai_format_description?: string;
  }) => void;
  isGenerating: boolean;
  defaultCitationStyle?: CitationStyle;
  defaultTemplate?: Template | string;
}

export default function ReviewConfig({
  onStart,
  isGenerating,
  defaultCitationStyle = 'IEEE',
  defaultTemplate = 'IEEE Conference'
}: ReviewConfigProps) {
  const [topic, setTopic] = useState('');
  const [reviewType, setReviewType] = useState<ReviewType>('systematic');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>(defaultCitationStyle);
  const [template, setTemplate] = useState<string>(defaultTemplate);
  const [writingStyle, setWritingStyle] = useState<WritingStyle>('academic');
  const [dateStart, setDateStart] = useState<number>(2019);
  const [dateEnd, setDateEnd] = useState<number>(2025);
  const [maxPapers, setMaxPapers] = useState<number>(100);

  // Custom template state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiFormatDescription, setAiFormatDescription] = useState('');

  const reviewTypes: Array<{ id: ReviewType; name: string; desc: string }> = [
    { id: 'systematic', name: 'Systematic', desc: 'Exhaustive PRISMA protocol synthesis' },
    { id: 'narrative', name: 'Narrative', desc: 'Broad contextual descriptive overview' },
    { id: 'scoping', name: 'Scoping', desc: 'Exploratory mapping of emerging concepts' },
    { id: 'meta-analysis', name: 'Meta-Analysis', desc: 'Quantitative statistical data aggregation' },
    { id: 'critical', name: 'Critical', desc: 'Rigorous critique of methodology & validity' },
    { id: 'state-of-the-art', name: 'State-of-the-Art', desc: 'Survey of frontier architectures & benchmarks' },
    { id: 'bibliometric', name: 'Bibliometric', desc: 'Citation network & co-occurrence analysis' },
  ];

  const citationStyles: CitationStyle[] = [
    'IEEE',
    'APA',
    'MLA',
    'Chicago',
    'Harvard',
    'Vancouver',
    'BibTeX'
  ];

  const templates: string[] = [
    'IEEE Conference',
    'IEEE Journal',
    'APA Journal',
    'ACM SIGCHI',
    'Springer LNCS',
    'Elsevier',
    'Custom DOCX'
  ];

  const writingStyles: Array<{ id: WritingStyle; title: string; subtitle: string }> = [
    { id: 'academic', title: 'Academic', subtitle: 'Formal, passive, rigorous' },
    { id: 'natural', title: 'Natural', subtitle: 'Varied sentence pacing, active' },
    { id: 'concise', title: 'Concise', subtitle: 'Short, direct, bulleted summary' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onStart({
      topic: topic.trim(),
      review_type: reviewType,
      citation_style: citationStyle,
      template,
      writing_style: writingStyle,
      date_start: dateStart,
      date_end: dateEnd,
      max_papers: maxPapers,
      custom_template_name: uploadedFile ? uploadedFile.name : undefined,
      ai_format_description: template === 'Custom DOCX' ? aiFormatDescription : undefined
    });
  };

  return (
    <div className="card shadow-sm border border-slate-200 bg-white">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Research Topic Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label text-base font-bold text-slate-900">
              Research Topic or Question <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs font-mono ${topic.length > 450 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
              {topic.length}/500 chars
            </span>
          </div>
          <textarea
            value={topic}
            maxLength={500}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
            rows={3}
            placeholder="e.g. Multi-agent Reinforcement Learning in Autonomous Driving Systems: A Systematic Review of Safety and Coordination Protocols"
            className="input-field text-sm leading-relaxed resize-none"
            required
          />
        </div>

        {/* SECTION 2: 7 Interactive Review Type Cards */}
        <div>
          <label className="label text-sm font-bold text-slate-900 mb-2.5">
            Review Type Methodology
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {reviewTypes.map((t) => {
              const isSelected = reviewType === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setReviewType(t.id)}
                  disabled={isGenerating}
                  className={`p-3.5 text-left rounded-xl border transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.95] flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-aurora-500 bg-aurora-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-aurora-700' : 'text-slate-900'}`}>
                      {t.name}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-aurora-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Citation Style & Template Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label text-sm font-semibold text-slate-900">Citation Style</label>
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
              disabled={isGenerating}
              className="input-field"
            >
              {citationStyles.map((cs) => (
                <option key={cs} value={cs}>
                  {cs} Citation Standard
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label text-sm font-semibold text-slate-900">Publishing Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              disabled={isGenerating}
              className="input-field"
            >
              {templates.map((tpl) => (
                <option key={tpl} value={tpl}>
                  {tpl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom DOCX Dropzone (only shown if Custom DOCX) */}
        {template === 'Custom DOCX' && (
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-4 animate-fade-in">
            <div>
              <label className="label text-xs font-bold text-slate-800">
                Upload Custom Word Template (.docx)
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-aurora-600">
                  {uploadedFile ? uploadedFile.name : 'Click or drag .docx file to upload'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 10MB</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="label text-xs font-bold text-slate-800">
                AI Formatting Description
              </label>
              <textarea
                value={aiFormatDescription}
                onChange={(e) => setAiFormatDescription(e.target.value)}
                rows={2}
                placeholder="Specify font sizes, mandatory section names, column styles, or custom margin constraints..."
                className="input-field text-xs resize-none"
              />
            </div>
          </div>
        )}

        {/* SECTION 4: Writing Style (3 Radio Cards) */}
        <div>
          <label className="label text-sm font-bold text-slate-900 mb-2">Writing Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {writingStyles.map((ws) => {
              const isSelected = writingStyle === ws.id;
              return (
                <button
                  type="button"
                  key={ws.id}
                  onClick={() => setWritingStyle(ws.id)}
                  disabled={isGenerating}
                  className={`p-3.5 text-left rounded-xl border transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.95] flex items-center justify-between ${
                    isSelected
                      ? 'border-2 border-aurora-500 bg-aurora-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className={`font-bold text-sm block ${isSelected ? 'text-aurora-700' : 'text-slate-900'}`}>
                      {ws.title}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">{ws.subtitle}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-aurora-600 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: Date Range & Max Papers Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Date Range Inputs */}
          <div>
            <label className="label text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Publication Date Range</span>
            </label>
            <div className="flex items-center space-x-3 mt-1.5">
              <div className="flex-1">
                <input
                  type="number"
                  value={dateStart}
                  min={1990}
                  max={2030}
                  onChange={(e) => setDateStart(parseInt(e.target.value) || 2018)}
                  disabled={isGenerating}
                  className="input-field text-center font-mono"
                  placeholder="Start Year"
                />
              </div>
              <span className="text-slate-400 font-bold">to</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={dateEnd}
                  min={1990}
                  max={2030}
                  onChange={(e) => setDateEnd(parseInt(e.target.value) || 2025)}
                  disabled={isGenerating}
                  className="input-field text-center font-mono"
                  placeholder="End Year"
                />
              </div>
            </div>
          </div>

          {/* Max Papers Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Max Papers to Mine</span>
              </label>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-aurora-50 text-aurora-700 border border-aurora-200 font-mono">
                {maxPapers} papers
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={maxPapers}
              onChange={(e) => setMaxPapers(parseInt(e.target.value))}
              disabled={isGenerating}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-aurora-600 mt-2.5"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>20</span>
              <span>100 (Default)</span>
              <span>200</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="btn-primary px-8 py-3 text-base font-bold bg-aurora-600 hover:bg-aurora-700 shadow-lg shadow-aurora-600/30 transform hover:scale-[1.02] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <span className="w-5 h-5 mr-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Synthesizing Review Paper...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" /> Start Generation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
