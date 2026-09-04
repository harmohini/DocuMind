import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Calendar,
  FileCheck,
  GitCompare,
  Download,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  Bot,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { contractService } from '../services/contractService';
import type { ContractItem, ContractClause, ContractObligation, ContractDate, ContractRisk } from '../types';
import { toast } from 'sonner';

export const ContractSummarizer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Upload & processing state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');

  // Re-analyze state
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeStep, setReanalyzeStep] = useState('');

  // Clause modal state
  const [selectedClause, setSelectedClause] = useState<ContractClause | null>(null);

  const loadContracts = () => {
    setApiError(null);
    contractService.getContracts()
      .then((items) => {
        setContracts(items);
        if (id) {
          contractService.getContractById(id).then((found) => {
            if (found) setSelectedContract(found);
          });
        }
      })
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  };

  useEffect(() => {
    loadContracts();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
        toast.error('Only PDF, DOCX, and TXT contract files are supported.');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsProcessing(true);
    setApiError(null);
    try {
      const newContract = await contractService.uploadContract(uploadFile, (p, stepMsg) => {
        setProgress(p);
        setProgressStep(stepMsg);
      });

      toast.success(`Successfully analyzed ${uploadFile.name}`);
      setContracts((prev) => [newContract, ...prev]);
      setSelectedContract(newContract);
      setUploadFile(null);
    } catch (err: any) {
      const msg = err.message || 'Contract analysis failed due to backend connection error.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteContract = async (contractId: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Remove "${name}" from contract library?`)) {
      try {
        await contractService.deleteContract(contractId);
        toast.success(`Deleted ${name}`);
        setContracts((prev) => prev.filter((c) => c.id !== contractId));
        if (selectedContract?.id === contractId) setSelectedContract(null);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete contract');
      }
    }
  };

  const handleReanalyze = async () => {
    if (!selectedContract) return;
    setIsReanalyzing(true);
    try {
      const updated = await contractService.reanalyzeContract(selectedContract.id, (_p, step) => {
        setReanalyzeStep(step);
      });
      setSelectedContract(updated);
      toast.success('Re-analysis complete');
    } catch (err: any) {
      toast.error(err.message || 'Re-analysis failed');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleExportSummary = () => {
    toast.success('Generated printable contract summary PDF');
    window.print();
  };

  const handleAddDeadline = async (dateTitle: string, dateStr: string) => {
    if (!selectedContract) return;
    await contractService.addContractDeadline({ title: dateTitle, date: dateStr, description: dateTitle, type: 'Review' });
    toast.success(`Added "${dateTitle}" to Deadlines!`);
  };

  const handleAskAIAboutContract = () => {
    if (selectedContract) {
      navigate(`/ai-workspace?contractId=${selectedContract.id}&name=${encodeURIComponent(selectedContract.name)}`);
    } else {
      navigate('/ai-workspace');
    }
  };

  return (
    <div className="space-y-6 fade-in text-[#242321]">
      {/* API ERROR BANNER */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-[#9A4F45]/10 border border-[#9A4F45]/30 text-[#9A4F45] text-xs font-semibold flex items-center justify-between gap-3 shadow-warm-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={loadContracts}
            className="px-3 py-1 bg-[#9A4F45] text-white text-[11px] font-bold rounded-lg shadow-warm-sm hover:bg-[#9A4F45]/90 transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* CLAUSE DETAIL MODAL */}
      {selectedClause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-lg w-full p-6 text-[#242321] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B7355]" />
                <h3 className="font-heading font-bold text-base">Contract Clause Intelligence</h3>
              </div>
              <button onClick={() => setSelectedClause(null)} className="p-1 text-[#9A948A] hover:text-[#242321]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6F6A62]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8E0D2] text-[#8B7355] px-2 py-0.5 rounded">
                  {selectedClause.status}
                </span>
                <h4 className="font-heading font-bold text-base text-[#242321] mt-1.5">{selectedClause.name}</h4>
                <p className="text-[11px] text-[#8B7355] font-semibold">{selectedClause.relevantSection} • Page {selectedClause.sourcePage}</p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E4DED4]/60 space-y-1">
                <span className="text-[10px] font-bold text-[#6F6A62] uppercase block">Analysis</span>
                <p className="text-xs text-[#242321] leading-relaxed">{selectedClause.explanation}</p>
              </div>

              {selectedClause.snippet && (
                <div className="p-3 rounded-xl bg-white border border-[#E4DED4] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A948A] uppercase block">Exact Text Snippet</span>
                  <p className="font-serif italic text-xs text-[#242321]">"{selectedClause.snippet}"</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E4DED4] flex justify-end gap-2">
              {selectedContract && (
                <button
                  onClick={() => {
                    setSelectedClause(null);
                    navigate(`/documents/${selectedContract.id}`);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#8B7355] hover:bg-[#5F4B35] text-white rounded-xl shadow-warm-sm transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View in Document Workspace
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: SUMMARY RESULT VIEW */}
      {selectedContract ? (
        <div className="space-y-6">
          {/* HEADER BAR & BACK LINK */}
          <div className="bg-white border border-[#E4DED4] p-5 rounded-2xl shadow-warm-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedContract(null)}
                className="inline-flex items-center gap-1.5 text-xs text-[#8B7355] font-semibold hover:text-[#5F4B35] transition mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Contract Summarizer
              </button>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl font-bold text-[#242321]">{selectedContract.name}</h1>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-[#8B7355]/10 text-[#8B7355]">
                  {selectedContract.type} • {selectedContract.pages} pages
                </span>
              </div>
              <p className="text-xs text-[#6F6A62]">
                Parties: <strong className="text-[#242321]">{selectedContract.parties.organization}</strong> & <strong className="text-[#242321]">{selectedContract.parties.vendor}</strong>
              </p>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAskAIAboutContract}
                className="px-3.5 py-2 text-xs font-semibold bg-[#8B7355] hover:bg-[#5F4B35] text-white rounded-xl shadow-warm-sm transition flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                Ask AI
              </button>
              <button
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="px-3.5 py-2 text-xs font-semibold bg-[#F1EDE5] hover:bg-[#E8E0D2] border border-[#E4DED4] text-[#242321] rounded-xl transition flex items-center gap-1.5"
              >
                {isReanalyzing ? <Loader2 className="w-4 h-4 animate-spin text-[#8B7355]" /> : <Sparkles className="w-4 h-4 text-[#8B7355]" />}
                Re-analyze
              </button>
              <button
                onClick={() => navigate('/changes')}
                className="px-3.5 py-2 text-xs font-semibold bg-[#F1EDE5] hover:bg-[#E8E0D2] border border-[#E4DED4] text-[#242321] rounded-xl transition flex items-center gap-1.5"
              >
                <GitCompare className="w-4 h-4 text-[#6F6A62]" />
                Compare
              </button>
              <button
                onClick={handleExportSummary}
                className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] text-[#242321] rounded-xl transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-[#8B7355]" />
                Export Summary
              </button>
            </div>
          </div>

          {/* RE-ANALYZE SIMULATION PROGRESS */}
          {isReanalyzing && (
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#8B7355] text-xs font-semibold text-[#8B7355] flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing contract via FastAPI... {reanalyzeStep}</span>
            </div>
          )}

          {/* CONTRACT OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm">
              <span className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block">Contract Value</span>
              <p className="font-heading font-extrabold text-2xl text-[#242321] mt-1">{selectedContract.contractValue}</p>
            </div>
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm">
              <span className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block">Duration</span>
              <p className="font-heading font-extrabold text-2xl text-[#242321] mt-1">{selectedContract.duration}</p>
            </div>
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm">
              <span className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block">Risk Score</span>
              <p className="font-heading font-extrabold text-2xl text-[#9A4F45] mt-1">{selectedContract.riskScore} / 100</p>
            </div>
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm">
              <span className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block">Renewal Type</span>
              <p className="font-heading font-extrabold text-2xl text-[#58745A] mt-1">{selectedContract.renewalType}</p>
            </div>
          </div>

          {/* MAIN SUMMARY CONTENT SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT MAIN DETAILS (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">

              {/* EXECUTIVE SUMMARY */}
              <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E4DED4] pb-3">
                  <FileText className="w-5 h-5 text-[#8B7355]" />
                  <h3 className="font-heading font-bold text-base text-[#242321]">Executive Summary</h3>
                </div>
                <p className="text-xs text-[#6F6A62] leading-relaxed font-sans">{selectedContract.summary}</p>
              </div>

              {/* KEY CONTRACT TERMS */}
              <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-4">
                <div className="border-b border-[#E4DED4] pb-3">
                  <h3 className="font-heading font-bold text-base text-[#242321]">Key Terms</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Contracting Parties</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.parties.organization}</span>
                    <span className="text-[#6F6A62] text-[11px] block">Vendor: {selectedContract.parties.vendor}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Contract Value</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.contractValue}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Start Date</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.startDate}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Expiry Date</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.expiryDate}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Payment Terms</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.paymentTerms}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Termination Notice</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.terminationNotice}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Renewal</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.renewalType}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E4DED4]/60">
                    <span className="text-[#9A948A] text-[10px] uppercase font-bold block">Governing Law</span>
                    <span className="font-bold text-[#242321] block mt-0.5">{selectedContract.governingLaw}</span>
                  </div>
                </div>
              </div>

              {/* IMPORTANT CLAUSES */}
              {selectedContract.clauses.length > 0 && (
                <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-4">
                  <div className="border-b border-[#E4DED4] pb-3">
                    <h3 className="font-heading font-bold text-base text-[#242321]">Important Clauses</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedContract.clauses.map((clause: ContractClause) => (
                      <div
                        key={clause.id}
                        onClick={() => setSelectedClause(clause)}
                        className="p-4 rounded-xl border border-[#E4DED4] hover:border-[#8B7355] bg-[#FAF8F5] cursor-pointer transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-[#242321]">{clause.name}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            (clause.status as string) === 'Requires Review' || (clause.status as string) === 'Needs Review' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' :
                            clause.status === 'Important' ? 'bg-[#A4773C]/10 text-[#A4773C]' : 'bg-[#58745A]/10 text-[#58745A]'
                          }`}>
                            {clause.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6F6A62] line-clamp-2">{clause.explanation}</p>
                        <span className="text-[10px] text-[#8B7355] font-semibold block">Click to inspect →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTRACT OBLIGATIONS */}
              {selectedContract.obligations.length > 0 && (
                <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-4" id="obligations-section">
                  <div className="border-b border-[#E4DED4] pb-3">
                    <h3 className="font-heading font-bold text-base text-[#242321]">Contract Obligations</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E4DED4] text-[#9A948A] uppercase tracking-wider font-bold">
                          <th className="pb-2 pl-2">Responsible Party</th>
                          <th className="pb-2">Obligation</th>
                          <th className="pb-2">Frequency</th>
                          <th className="pb-2">Deadline</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4DED4]/60">
                        {selectedContract.obligations.map((ob: ContractObligation) => (
                          <tr key={ob.id} className="hover:bg-[#FAF8F5] cursor-pointer">
                            <td className="py-2.5 pl-2 font-bold text-[#242321]">{ob.party}</td>
                            <td className="py-2.5 text-[#6F6A62]">{ob.obligation}</td>
                            <td className="py-2.5 text-[#6F6A62]">{ob.frequency}</td>
                            <td className="py-2.5 font-semibold text-[#8B7355]">{ob.deadline}</td>
                            <td className="py-2.5">
                              <span className="text-[10px] font-semibold bg-[#58745A]/10 text-[#58745A] px-2 py-0.5 rounded">
                                {ob.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* IMPORTANT DATES */}
              {selectedContract.importantDates.length > 0 && (
                <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-4" id="dates-section">
                  <div className="border-b border-[#E4DED4] pb-3">
                    <h3 className="font-heading font-bold text-base text-[#242321]">Important Dates</h3>
                  </div>

                  <div className="space-y-3">
                    {selectedContract.importantDates.map((dt: ContractDate) => (
                      <div
                        key={dt.id}
                        className="p-3.5 rounded-xl border border-[#E4DED4] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#8B7355] bg-[#E8E0D2] px-2.5 py-1 rounded-lg">
                            {dt.date}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-[#242321]">{dt.title}</h4>
                            <p className="text-[11px] text-[#6F6A62]">{dt.description}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddDeadline(dt.title || 'Important Date', dt.date || 'TBD')}
                          className="text-xs font-semibold text-[#8B7355] hover:text-[#5F4B35] bg-white border border-[#E4DED4] px-3 py-1.5 rounded-xl self-start sm:self-auto transition"
                        >
                          + Add to Deadlines
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* POTENTIAL RISKS */}
              {selectedContract.risks.length > 0 && (
                <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-4" id="risks-section">
                  <div className="border-b border-[#E4DED4] pb-3">
                    <h3 className="font-heading font-bold text-base text-[#242321]">Potential Risks</h3>
                  </div>

                  <div className="space-y-3">
                    {selectedContract.risks.map((risk: ContractRisk) => (
                      <div
                        key={risk.id}
                        onClick={() => navigate('/risks')}
                        className="p-4 rounded-xl border border-[#E4DED4] hover:border-[#9A4F45] bg-[#FAF8F5] cursor-pointer transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            risk.severity === 'HIGH' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' : 'bg-[#A4773C]/10 text-[#A4773C]'
                          }`}>
                            {risk.severity} RISK
                          </span>
                          <span className="text-[11px] text-[#6F6A62] font-semibold">Page {risk.sourcePage} • {risk.section}</span>
                        </div>
                        <h4 className="font-bold text-xs text-[#242321]">{risk.title}</h4>
                        <p className="text-[11px] text-[#6F6A62]">{risk.explanation}</p>
                        <div className="p-2 rounded-lg bg-[#58745A]/10 text-[11px] text-[#58745A] font-medium">
                          Recommendation: {risk.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR / QUICK ACTIONS PANEL (4 Columns) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm space-y-4">
                <h3 className="font-heading font-bold text-base text-[#242321]">Quick Actions</h3>

                <div className="space-y-2 text-xs font-semibold">
                  <button
                    onClick={handleAskAIAboutContract}
                    className="w-full text-left p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] text-[#242321] flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#8B7355]" />
                      Ask AI About Contract
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => navigate('/risks')}
                    className="w-full text-left p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] text-[#242321] flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#9A4F45]" />
                      Find Risks
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => {
                      const elem = document.getElementById('obligations-section');
                      elem?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full text-left p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] text-[#242321] flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#58745A]" />
                      Find Obligations
                    </span>
                    <span>↓</span>
                  </button>

                  <button
                    onClick={() => navigate('/deadlines')}
                    className="w-full text-left p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] text-[#242321] flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#A4773C]" />
                      View Important Dates
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => navigate('/changes')}
                    className="w-full text-left p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] text-[#242321] flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-[#6F6A62]" />
                      Compare Contract
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={handleExportSummary}
                    className="w-full text-left p-3 rounded-xl bg-[#8B7355] text-white hover:bg-[#5F4B35] flex items-center justify-between transition"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Summary PDF
                    </span>
                    <span>↓</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* VIEW MODE 2: LANDING STATE (UPLOAD & RECENT CONTRACTS) */
        <div className="space-y-8">
          {/* HEADER BAR */}
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#242321]">Contract Summarizer</h1>
            <p className="text-xs text-[#6F6A62] mt-0.5">
              Understand complex contracts in seconds with structured AI analysis.
            </p>
          </div>

          {/* MAIN UPLOAD CARD */}
          <div className="bg-white border border-[#E4DED4] rounded-2xl p-8 shadow-warm-sm max-w-3xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h2 className="font-heading font-bold text-xl text-[#242321]">Upload a contract</h2>
              <p className="text-xs text-[#6F6A62]">
                Drag and drop your contract here, or browse from your device.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-[#E4DED4] hover:border-[#8B7355] bg-[#FAF8F5] rounded-2xl p-8 text-center cursor-pointer transition relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                {uploadFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-[#8B7355]" />
                    <div className="text-left">
                      <p className="font-bold text-sm text-[#242321]">{uploadFile.name}</p>
                      <p className="text-xs text-[#9A948A]">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-12 h-12 text-[#8B7355] mb-2" />
                    <p className="text-sm font-semibold text-[#242321]">Choose PDF, DOCX, or TXT contract</p>
                    <p className="text-xs text-[#9A948A] mt-1">Supports Master Services Agreements, Employment Contracts, Vendor Agreements</p>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between text-[#6F6A62]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B7355]" />
                      {progressStep}
                    </span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#F1EDE5] rounded-full h-2 overflow-hidden">
                    <div className="bg-[#8B7355] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-[11px] text-[#9A948A]">
                  Your contract stays within your local workspace.
                </p>

                <button
                  type="submit"
                  disabled={!uploadFile || isProcessing}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#8B7355] hover:bg-[#5F4B35] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-warm-sm transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing Contract...' : 'Upload Contract'}
                  {!isProcessing && <Sparkles className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>

          {/* RECENT CONTRACTS SECTION */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-base text-[#242321]">Recent Contracts</h3>

            {contracts.length === 0 ? (
              <div className="bg-white border border-[#E4DED4] rounded-2xl p-8 text-center text-xs text-[#9A948A] space-y-2 shadow-warm-sm">
                <FolderOpen className="w-8 h-8 text-[#E4DED4] mx-auto" />
                <p className="font-semibold text-sm text-[#242321]">No contracts uploaded yet.</p>
                <p>Upload a contract above to generate automated summaries and key terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contracts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContract(c)}
                    className="bg-white border border-[#E4DED4] hover:border-[#8B7355] rounded-2xl p-5 shadow-warm-sm cursor-pointer transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8E0D2] text-[#8B7355] px-2 py-0.5 rounded">
                          {c.type}
                        </span>
                        <span className="text-[10px] text-[#9A948A]">{c.analyzedAt}</span>
                      </div>

                      <h4 className="font-heading font-bold text-sm text-[#242321] line-clamp-1">{c.name}</h4>
                      <p className="text-xs text-[#6F6A62]">{c.pages} pages • Risk Score: {c.riskScore}/100</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E4DED4]/60">
                      <span className="text-xs font-semibold text-[#8B7355] flex items-center gap-1">
                        View Summary →
                      </span>

                      <button
                        onClick={(e) => handleDeleteContract(c.id, c.name, e)}
                        title="Delete contract"
                        className="p-1 text-[#9A948A] hover:text-[#9A4F45] rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
