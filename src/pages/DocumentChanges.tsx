import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { documentService } from '../services/documentService';
import type { DocumentChange, DocumentItem } from '../types';
import { toast } from 'sonner';

export const DocumentChanges: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [origDocId, setOrigDocId] = useState<string>('');
  const [newDocId, setNewDocId] = useState<string>('');
  const [changes, setChanges] = useState<DocumentChange[]>([]);
  const [selectedChange, setSelectedChange] = useState<DocumentChange | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    documentService.getDocuments().then((docs) => {
      setDocuments(docs);
      if (docs.length > 0) setOrigDocId(docs[0].id);
      if (docs.length > 1) setNewDocId(docs[1].id);
      else if (docs.length > 0) setNewDocId(docs[0].id);
    }).catch(() => {});
  }, []);

  const handleRunAnalysis = async () => {
    if (!origDocId || !newDocId) {
      toast.error('Select two documents to analyze changes.');
      return;
    }
    setIsAnalyzing(true);
    toast.info('Running Document Comparison via FastAPI...');
    try {
      const result = await aiService.getDocumentChanges();
      setChanges(result);
      if (result.length > 0) setSelectedChange(result[0]);
      setHasAnalyzed(true);
      toast.success('Document comparison complete.');
    } catch (err: any) {
      toast.error('Comparison failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 fade-in text-[#242321]">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-[#242321]">Document Change Detection</h1>
          </div>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Compare contract revisions, detect clause modifications, and evaluate legal impact.
          </p>
        </div>
      </div>

      {documents.length < 2 ? (
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">Not enough documents to compare.</h3>
            <p className="text-xs text-[#6F6A62]">
              Upload at least two document revisions to run side-by-side clause comparison and change detection.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* VERSION SELECTION TOOLBAR */}
          <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Document Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#6F6A62] uppercase tracking-wider mb-1.5">
                  Original Document (v1.0 Baseline)
                </label>
                <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2">
                  <FileText className="w-4 h-4 text-[#8B7355] shrink-0" />
                  <select
                    value={origDocId}
                    onChange={(e) => setOrigDocId(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[#242321] focus:outline-none"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* New Document Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#6F6A62] uppercase tracking-wider mb-1.5">
                  New Document (v2.0 Revision)
                </label>
                <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2">
                  <FileText className="w-4 h-4 text-[#8B7355] shrink-0" />
                  <select
                    value={newDocId}
                    onChange={(e) => setNewDocId(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[#242321] focus:outline-none"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E4DED4]/60">
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-warm-sm transition flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Semantic Delta...
                  </>
                ) : (
                  <>
                    <GitCompare className="w-4 h-4" />
                    Analyze Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ANALYSIS SUMMARY BANNER IF ANALYZED */}
          {hasAnalyzed && (
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#8B7355]/10 text-[#8B7355]">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider">AI Change Summary</span>
                  <h3 className="font-heading font-bold text-base text-[#242321]">
                    {changes.length} Modifications Detected
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* DETECTED CHANGES LIST & SIDE-BY-SIDE DIFF */}
          {hasAnalyzed && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT COLUMN: DETECTED CHANGES LIST (4 Columns) */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="font-heading font-bold text-sm text-[#242321] px-1">Detected Modifications</h3>

                {changes.length === 0 ? (
                  <div className="p-6 bg-white border border-[#E4DED4] rounded-2xl text-center text-xs text-[#9A948A]">
                    No significant clause modifications found between selected documents.
                  </div>
                ) : (
                  changes.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedChange(c)}
                      className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                        selectedChange?.id === c.id
                          ? 'border-[#8B7355] bg-white shadow-warm-md'
                          : 'border-[#E4DED4] bg-white hover:border-[#8B7355]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#242321]">{c.changeType}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          c.impactLevel === 'High' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' : 'bg-[#A4773C]/10 text-[#A4773C]'
                        }`}>
                          {c.impactLevel} Impact
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#6F6A62]">{c.section}</p>
                      <p className="text-[11px] text-[#6F6A62] line-clamp-2 leading-relaxed">{c.aiAnalysis}</p>
                    </div>
                  ))
                )}
              </div>

              {/* RIGHT COLUMN: SIDE-BY-SIDE COMPARISON VIEW (8 Columns) */}
              {selectedChange && (
                <div className="lg:col-span-8 bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-6">
                  <div className="border-b border-[#E4DED4] pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">
                        SELECTED SECTION COMPARISON
                      </span>
                      <h3 className="font-heading font-bold text-lg text-[#242321]">{selectedChange.section}</h3>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${
                      selectedChange.impactLevel === 'High' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' : 'bg-[#A4773C]/10 text-[#A4773C]'
                    }`}>
                      {selectedChange.impactLevel} Severity Change
                    </span>
                  </div>

                  {/* SIDE-BY-SIDE DIFF PANELS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OLD VERSION PANE */}
                    <div className="p-4 rounded-xl bg-[#9A4F45]/5 border border-[#9A4F45]/20 space-y-2">
                      <span className="text-[10px] font-bold text-[#9A4F45] uppercase tracking-wider block">
                        OLD VERSION (v1.0 Baseline)
                      </span>
                      <p className="font-serif italic text-xs text-[#242321] leading-relaxed bg-white p-3 rounded border border-[#9A4F45]/20">
                        "{selectedChange.oldText}"
                      </p>
                    </div>

                    {/* NEW VERSION PANE */}
                    <div className="p-4 rounded-xl bg-[#58745A]/5 border border-[#58745A]/20 space-y-2">
                      <span className="text-[10px] font-bold text-[#58745A] uppercase tracking-wider block">
                        NEW VERSION (v2.0 Revision)
                      </span>
                      <p className="font-serif italic text-xs text-[#242321] leading-relaxed bg-white p-3 rounded border border-[#58745A]/20">
                        "{selectedChange.newText}"
                      </p>
                    </div>
                  </div>

                  {/* AI IMPACT ANALYSIS */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-xs text-[#242321]">AI Legal Exposure Analysis</h4>
                    </div>
                    <p className="text-xs text-[#6F6A62] leading-relaxed">{selectedChange.aiAnalysis}</p>
                  </div>

                  {/* RECOMMENDATION */}
                  <div className="p-4 rounded-xl bg-[#58745A]/10 border border-[#58745A]/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#58745A]" />
                      <h4 className="font-heading font-bold text-xs text-[#58745A]">Recommended Action</h4>
                    </div>
                    <p className="text-xs text-[#58745A] font-semibold">{selectedChange.recommendation}</p>
                  </div>
                </div>
              )}

            </div>
          )}
        </>
      )}
    </div>
  );
};
