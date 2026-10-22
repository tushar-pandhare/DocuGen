// frontend/src/components/SummariseResult.jsx
// Displays AI-generated summary and extracted key entities (people, organizations,
// dates, money amounts) with copy buttons and glassmorphism styling.

import { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  Brain,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";

/**
 * @param {object} props
 * @param {string} [props.summary] - The AI summary text
 * @param {{ people?: string[], organizations?: string[], dates?: string[], amounts?: string[] }} [props.entities]
 * @param {boolean} [props.loading] - Whether summarisation is in progress
 * @param {function} [props.onGenerateSummary] - Trigger function to (re)generate summary
 * @param {boolean} [props.hasText] - Whether OCR text exists
 */
export default function SummariseResult({
  summary = "",
  entities = { people: [], organizations: [], dates: [], amounts: [] },
  loading = false,
  onGenerateSummary,
  hasText = false,
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedEntities, setCopiedEntities] = useState(false);

  const people = entities?.people || [];
  const organizations = entities?.organizations || [];
  const dates = entities?.dates || [];
  const amounts = entities?.amounts || [];

  const totalEntities = people.length + organizations.length + dates.length + amounts.length;

  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyEntities = () => {
    if (!entities) return;
    navigator.clipboard.writeText(JSON.stringify(entities, null, 2));
    setCopiedEntities(true);
    setTimeout(() => setCopiedEntities(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ── Summary Card ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100/80 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-semibold tracking-wide text-base">AI Summary</h2>
                  <span className="bg-white/20 text-indigo-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                    Gemini / AI
                  </span>
                </div>
                <p className="text-indigo-100 text-xs">Concise overview generated from extracted text</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {summary && !loading && (
                <button
                  id="copy-summary-btn"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition backdrop-blur-sm active:scale-95"
                  title="Copy summary to clipboard"
                >
                  {copiedSummary ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  {copiedSummary ? "Copied" : "Copy Summary"}
                </button>
              )}

              {onGenerateSummary && hasText && !loading && (
                <button
                  id="generate-summary-btn"
                  onClick={onGenerateSummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
                >
                  <Sparkles size={13} className="text-indigo-600" />
                  {summary ? "Regenerate" : "Generate Summary"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center animate-pulse">
                <Loader2 size={24} className="text-indigo-600 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Synthesizing document summary…</p>
                <p className="text-xs text-slate-400 mt-1">Extracting key entities and compressing main ideas</p>
              </div>
            </div>
          ) : summary ? (
            <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-violet-50/40 rounded-xl p-5 border border-indigo-100 shadow-sm relative group">
              <p className="text-slate-800 leading-relaxed font-sans text-sm md:text-base selection:bg-indigo-200">
                {summary}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No summary generated yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Extract text first or click Generate Summary to produce an AI summary and extract entities.
              </p>
              {hasText && onGenerateSummary && (
                <button
                  onClick={onGenerateSummary}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition shadow-indigo-200"
                >
                  <Sparkles size={14} />
                  Generate Summary Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Key Entities Card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
                <FileSpreadsheet size={20} className="text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-semibold tracking-wide text-base">Key Entities</h2>
                  <span className="bg-white/10 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                    {totalEntities} detected
                  </span>
                </div>
                <p className="text-slate-400 text-xs">People, organizations, dates, and currency amounts</p>
              </div>
            </div>

            {totalEntities > 0 && !loading && (
              <button
                id="copy-entities-btn"
                onClick={handleCopyEntities}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition backdrop-blur-sm active:scale-95"
                title="Copy structured entities as JSON"
              >
                {copiedEntities ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                {copiedEntities ? "Copied" : "Copy Entities (JSON)"}
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-4 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : totalEntities > 0 ? (
            <div className="grid sm:grid-cols-2 gap-5">
              {/* People */}
              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 transition-all hover:border-violet-200 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-900">People</span>
                  </div>
                  <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                    {people.length}
                  </span>
                </div>
                {people.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {people.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-violet-200/70 text-violet-900 shadow-2xs hover:bg-violet-100/50 transition"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">None detected</p>
                )}
              </div>

              {/* Organizations */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 transition-all hover:border-blue-200 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Building2 size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Organizations</span>
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {organizations.length}
                  </span>
                </div>
                {organizations.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {organizations.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-blue-200/70 text-blue-900 shadow-2xs hover:bg-blue-100/50 transition"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">None detected</p>
                )}
              </div>

              {/* Dates */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 transition-all hover:border-emerald-200 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Calendar size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Dates</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {dates.length}
                  </span>
                </div>
                {dates.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {dates.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-emerald-200/70 text-emerald-900 shadow-2xs hover:bg-emerald-100/50 transition"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">None detected</p>
                )}
              </div>

              {/* Amounts */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 transition-all hover:border-amber-200 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <DollarSign size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Amounts</span>
                  </div>
                  <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    {amounts.length}
                  </span>
                </div>
                {amounts.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {amounts.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-amber-200/70 text-amber-900 shadow-2xs hover:bg-amber-100/50 transition"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">None detected</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center">
              <AlertCircle size={20} className="text-slate-300 mb-2" />
              <span>No entities extracted yet. Run summarisation to detect key entities.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
