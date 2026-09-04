import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ShieldAlert,
  Bot,
  GitCompare,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  FileCheck
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { contractService } from '../services/contractService';
import type { DocumentItem, KeyFinding } from '../types';
import { toast } from 'sonner';

export const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState<'findings' | 'clauses' | 'obligations'>('findings');
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setApiError(null);
      documentService.getDocumentById(id)
        .then((doc) => {
          if (doc) {
            setDocument(doc);
            setLoadingAnalysis(true);
            contractService.analyzeDocumentAgent(id)
              .then((data) => setAnalysisData(data))
              .catch((err: any) => console.warn('Analysis agent notice:', err.message))
              .finally(() => setLoadingAnalysis(false));
          }
        })
        .catch((err: any) => {
          setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
        });
    }
  }, [id]);

  if (apiError) {
    return (
      <div className="p-8 text-center space-y-4 text-[#242321]">
        <div className="p-4 rounded-2xl bg-[#9A4F45]/10 border border-[#9A4F45]/30 text-[#9A4F45] text-xs font-semibold max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/documents')}
          className="px-4 py-2 bg-[#8B7355] text-white text-xs font-semibold rounded-xl"
        >
          Return to Document Library
        </button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-8 text-center text-[#6F6A62] space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#8B7355] mx-auto" />
        <p className="text-xs">Loading document intelligence workspace...</p>
      </div>
    );
  }

  const findings: KeyFinding[] = analysisData?.risks ? analysisData.risks.map((r: any, idx: number) => ({
    id: `f-${idx}`,
    documentId: document.id,
    title: r.title || 'Risk Item',
    type: 'Risk',
    severity: (r.severity as any) || 'Medium',
    page: r.sourcePage || 1,
    section: r.section || 'General',
    snippet: r.explanation || '',
    explanation: r.explanation || '',
    recommendation: r.recommendation || ''
  })) : [];

  const clauses = analysisData?.keyClauses || [];
  const obligations = analysisData?.obligations || [];

  const handleFindingClick = (finding: KeyFinding) => {
    setCurrentPage(finding.page);
    setHighlightedSection(finding.section);
    toast.info(`Jumped to Page ${finding.page}: ${finding.section}`);
  };

  return (
    <div className="space-y-4 fade-in text-[#242321]">
      {/* TOOLBAR HEADER */}
      <div className="bg-white border border-[#E4DED4] p-4 rounded-2xl shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 rounded-xl text-[#6F6A62] hover:bg-[#F1EDE5] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold text-[#242321]">{document.name}</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                document.riskLevel === 'High' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' : 'bg-[#58745A]/10 text-[#58745A]'
              }`}>
                {document.riskLevel} Risk ({document.riskScore}/100)
              </span>
            </div>
            <p className="text-xs text-[#6F6A62] mt-0.5">
              Category: <span className="font-semibold text-[#242321]">{document.type}</span> • Total Pages: {document.pages} • Status: {document.status}
            </p>
          </div>
        </div>

        {/* WORKSPACE ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          {document.type === 'Contract' && (
            <button
              onClick={() => navigate('/contract-summarizer')}
              className="px-3 py-1.5 rounded-xl bg-[#8B7355] text-white hover:bg-[#5F4B35] text-xs font-semibold shadow-warm-sm transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Summarize Contract
            </button>
          )}

          <button
            onClick={() => navigate(`/ai-workspace?documentId=${document.id}`)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] hover:bg-[#F1EDE5] text-xs font-semibold text-[#242321] transition flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-[#8B7355]" /> Ask AI
          </button>

          <button
            onClick={() => navigate('/risks')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] hover:bg-[#F1EDE5] text-xs font-semibold text-[#242321] transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#9A4F45]" /> Find Risks
          </button>

          <button
            onClick={() => navigate('/changes')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] hover:bg-[#F1EDE5] text-xs font-semibold text-[#242321] transition flex items-center gap-1.5"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#6F6A62]" /> Compare
          </button>

          <button
            onClick={() => toast.success('Exporting full document audit trail PDF...')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] hover:bg-[#F1EDE5] text-xs font-semibold text-[#242321] transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#8B7355]" /> Export Audit
          </button>
        </div>
      </div>

      {/* MAIN SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN: PDF DOCUMENT VIEWER (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-[#E4DED4] rounded-2xl p-4 shadow-warm-sm space-y-4">
          {/* PDF CONTROLS BAR */}
          <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1 rounded hover:bg-[#F1EDE5] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-[#242321]">
                Page {currentPage} of {document.pages}
              </span>
              <button
                disabled={currentPage >= document.pages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1 rounded hover:bg-[#F1EDE5] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))} className="p-1 text-[#6F6A62] hover:text-[#242321]">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-medium w-10 text-center">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))} className="p-1 text-[#6F6A62] hover:text-[#242321]">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#9A948A] absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Find in document..."
                  className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl pl-8 pr-2 py-1 text-xs focus:outline-none w-32"
                />
              </div>
            </div>
          </div>

          {/* SIMULATED DOCUMENT PAGE CANVAS */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-6 min-h-[520px] shadow-inner font-serif leading-relaxed text-xs text-[#242321] overflow-y-auto space-y-4">
            <div className="flex justify-between text-[10px] text-[#9A948A] uppercase tracking-widest font-sans border-b border-[#E4DED4] pb-2">
              <span>{document.name}</span>
              <span>Page {currentPage}</span>
            </div>

            <h3 className="font-heading font-bold text-sm text-[#242321] pt-2">
              {document.name} — Workspace Preview
            </h3>

            <p>
              {document.summary}
            </p>

            {/* AI HIGHLIGHTED SECTION IF AVAILABLE */}
            {highlightedSection && (
              <div className="p-4 rounded-xl bg-[#8B7355]/10 border-l-4 border-[#8B7355] text-xs font-sans space-y-1 my-3 shadow-warm-sm">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#8B7355] uppercase tracking-wider">
                  <span>[AI HIGHLIGHTED SECTION] {highlightedSection}</span>
                </div>
                <p className="text-[11px] text-[#6F6A62] pt-1">
                  Selected section inspect view from FastAPI RAG extraction.
                </p>
              </div>
            )}

            <div className="pt-8 border-t border-[#E4DED4] text-[10px] text-[#9A948A] font-sans flex justify-between">
              <span>FastAPI RAG Ingest Record</span>
              <span>ID: {document.id}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI INSIGHTS & KEY FINDINGS (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">AI EXTRACTED INTELLIGENCE</span>
              <h3 className="font-heading font-bold text-base text-[#242321]">Document Audit Report</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-[#9A4F45]/10 px-2.5 py-1 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-[#9A4F45]" />
              <span className="font-heading font-bold text-xs text-[#9A4F45]">Risk: {document.riskScore}/100</span>
            </div>
          </div>

          {/* TAB HEADERS */}
          <div className="flex border-b border-[#E4DED4] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('findings')}
              className={`pb-2 px-3 border-b-2 transition ${
                activeTab === 'findings' ? 'border-[#8B7355] text-[#8B7355]' : 'border-transparent text-[#6F6A62]'
              }`}
            >
              Key Findings ({findings.length})
            </button>
            <button
              onClick={() => setActiveTab('clauses')}
              className={`pb-2 px-3 border-b-2 transition ${
                activeTab === 'clauses' ? 'border-[#8B7355] text-[#8B7355]' : 'border-transparent text-[#6F6A62]'
              }`}
            >
              Important Clauses ({clauses.length})
            </button>
            <button
              onClick={() => setActiveTab('obligations')}
              className={`pb-2 px-3 border-b-2 transition ${
                activeTab === 'obligations' ? 'border-[#8B7355] text-[#8B7355]' : 'border-transparent text-[#6F6A62]'
              }`}
            >
              Obligations ({obligations.length})
            </button>
          </div>

          {/* FINDINGS LIST OR EMPTY STATE */}
          {loadingAnalysis ? (
            <div className="py-12 text-center text-xs text-[#8B7355] space-y-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              <p>Analyzing document using FastAPI Document Analyst...</p>
            </div>
          ) : activeTab === 'findings' ? (
            findings.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9A948A]">
                No key findings extracted yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {findings.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleFindingClick(f)}
                    className="p-3.5 rounded-xl border border-[#E4DED4] hover:border-[#8B7355] bg-[#FAF8F5] cursor-pointer transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#242321]">{f.title}</h4>
                      <span className="text-[10px] font-semibold text-[#8B7355] bg-[#E8E0D2] px-2 py-0.5 rounded">
                        Page {f.page}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6F6A62] line-clamp-2 leading-relaxed">{f.explanation}</p>

                    {f.recommendation && (
                      <div className="p-2 rounded bg-white border border-[#E4DED4]/60 text-[10px] text-[#58745A] font-medium flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 shrink-0 text-[#58745A]" />
                        <span>{f.recommendation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'clauses' ? (
            clauses.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9A948A]">
                No clauses extracted yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {clauses.map((c: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#E4DED4] bg-[#FAF8F5] space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#242321]">{c.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#8B7355]/10 text-[#8B7355]">
                        {c.status || 'Identified'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F6A62]">{c.explanation}</p>
                  </div>
                ))}
              </div>
            )
          ) : (
            obligations.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9A948A]">
                No obligations recorded yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {obligations.map((o: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#E4DED4] bg-[#FAF8F5] space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#242321]">{o.party}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#58745A]/10 text-[#58745A]">
                        {o.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F6A62]">{o.obligation}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};
