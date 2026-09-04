import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldAlert,
  FileCheck,
  ArrowRight,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Upload,
  FolderOpen,
  AlertTriangle
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import type { DocumentItem } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadDocuments = () => {
    setApiError(null);
    documentService.getDocuments()
      .then((docs) => setDocuments(docs))
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const totalDocs = documents.length;
  const contractsCount = documents.filter((d) => d.type === 'Contract').length;
  const policiesCount = documents.filter((d) => d.type === 'Policy').length;
  const reportsCount = documents.filter((d) => (d.type as string) === 'Financial Report' || (d.type as string) === 'Report').length;
  const recentDocs = documents.slice(0, 5);

  return (
    <div className="space-y-6 fade-in text-[#242321]">
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          loadDocuments();
          navigate('/documents');
        }}
      />

      {/* API ERROR BANNER */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-[#9A4F45]/10 border border-[#9A4F45]/30 text-[#9A4F45] text-xs font-semibold flex items-center justify-between gap-3 shadow-warm-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={loadDocuments}
            className="px-3 py-1 bg-[#9A4F45] text-white text-[11px] font-bold rounded-lg shadow-warm-sm hover:bg-[#9A4F45]/90 transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* WELCOME BANNER & QUICK ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242321]">
            Document Intelligence Dashboard
          </h1>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Enterprise document analysis, RAG search, and AI risk intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-warm-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL DOCUMENTS */}
        <div
          onClick={() => navigate('/documents')}
          className="bg-white border border-[#E4DED4] hover:border-[#8B7355] rounded-2xl p-5 shadow-warm-sm cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A948A]">Total Documents</span>
            <div className="p-2 rounded-xl bg-[#F1EDE5] text-[#8B7355]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-[#242321]">{totalDocs}</span>
            <span className="text-[11px] font-semibold text-[#6F6A62]">
              {totalDocs === 1 ? '1 file' : `${totalDocs} files`}
            </span>
          </div>
        </div>

        {/* KPI 2: CONTRACTS */}
        <div
          onClick={() => navigate('/documents')}
          className="bg-white border border-[#E4DED4] hover:border-[#8B7355] rounded-2xl p-5 shadow-warm-sm cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A948A]">Contracts</span>
            <div className="p-2 rounded-xl bg-[#8B7355]/10 text-[#8B7355]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-[#242321]">{contractsCount}</span>
            <span className="text-[10px] font-bold text-[#8B7355] bg-[#8B7355]/10 px-2 py-0.5 rounded-md">
              Contracts
            </span>
          </div>
        </div>

        {/* KPI 3: POLICIES */}
        <div
          onClick={() => navigate('/documents')}
          className="bg-white border border-[#E4DED4] hover:border-[#58745A] rounded-2xl p-5 shadow-warm-sm cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A948A]">Policies</span>
            <div className="p-2 rounded-xl bg-[#58745A]/10 text-[#58745A]">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-[#242321]">{policiesCount}</span>
            <span className="text-[11px] font-medium text-[#6F6A62]">Policies</span>
          </div>
        </div>

        {/* KPI 4: REPORTS */}
        <div
          onClick={() => navigate('/documents')}
          className="bg-white border border-[#E4DED4] hover:border-[#A4773C] rounded-2xl p-5 shadow-warm-sm cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A948A]">Reports</span>
            <div className="p-2 rounded-xl bg-[#A4773C]/10 text-[#A4773C]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-[#242321]">{reportsCount}</span>
            <span className="text-[11px] font-semibold text-[#6F6A62]">Reports</span>
          </div>
        </div>
      </div>

      {/* MAIN BODY AREA: RECENT DOCUMENTS OR EMPTY STATE */}
      {totalDocs === 0 ? (
        /* CLEAN EMPTY STATE */
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">No documents uploaded yet.</h3>
            <p className="text-xs text-[#6F6A62]">
              Upload a PDF, DOCX, or TXT contract, policy, or report to get started with RAG Q&A, summarization, and risk intelligence.
            </p>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs shadow-warm-sm transition"
          >
            <Upload className="w-4 h-4" />
            Upload Your First Document
          </button>
        </div>
      ) : (
        /* RECENT DOCUMENTS TABLE */
        <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm overflow-hidden">
          <div className="p-4 border-b border-[#E4DED4] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B7355]" />
              <h3 className="font-heading font-bold text-base text-[#242321]">Recent Documents</h3>
            </div>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs font-semibold text-[#8B7355] hover:text-[#5F4B35] flex items-center gap-1 transition"
            >
              View Document Library <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4DED4] text-[#9A948A] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DED4]/60">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3 px-4 font-semibold text-[#242321] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8B7355] shrink-0" />
                      <span className="truncate max-w-xs">{doc.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#6F6A62]">{doc.type}</td>
                    <td className="py-3 px-4 text-[#6F6A62]">{doc.pages}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#58745A]/10 text-[#58745A]">
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/documents/${doc.id}`)}
                        className="text-xs font-semibold text-[#8B7355] hover:underline"
                      >
                        View Workspace →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
