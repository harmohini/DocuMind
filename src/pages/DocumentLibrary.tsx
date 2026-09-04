import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Trash2,
  Eye,
  GitCompare,
  Sparkles,
  FileSpreadsheet,
  X,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { documentService } from '../services/documentService';
import type { DocumentItem } from '../types';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { toast } from 'sonner';

export const DocumentLibrary: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [summaryModalDoc, setSummaryModalDoc] = useState<DocumentItem | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadDocs = () => {
    setApiError(null);
    documentService.getDocuments()
      .then(setDocuments)
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await documentService.deleteDocument(id);
        toast.success(`Deleted ${name}`);
        loadDocs();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete document');
      }
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || doc.type === selectedType;
    const matchesRisk = selectedRisk === 'All' || doc.riskLevel === selectedRisk;
    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <div className="space-y-6 fade-in text-[#242321]">
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadDocs}
      />

      {/* API ERROR BANNER */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-[#9A4F45]/10 border border-[#9A4F45]/30 text-[#9A4F45] text-xs font-semibold flex items-center justify-between gap-3 shadow-warm-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={loadDocs}
            className="px-3 py-1 bg-[#9A4F45] text-white text-[11px] font-bold rounded-lg shadow-warm-sm hover:bg-[#9A4F45]/90 transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* QUICK SUMMARY MODAL */}
      {summaryModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-lg w-full p-6 text-[#242321] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B7355]" />
                <h3 className="font-heading font-bold text-base">Quick Executive Summary</h3>
              </div>
              <button onClick={() => setSummaryModalDoc(null)} className="p-1 text-[#9A948A] hover:text-[#242321]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-heading font-bold text-base text-[#242321]">{summaryModalDoc.name}</h4>
              <span className="text-[10px] font-semibold bg-[#8B7355]/10 text-[#8B7355] px-2 py-0.5 rounded-md">
                {summaryModalDoc.type} • {summaryModalDoc.pages} Pages
              </span>
              <p className="text-[#6F6A62] leading-relaxed pt-2">{summaryModalDoc.summary}</p>
            </div>

            <div className="pt-4 border-t border-[#E4DED4] flex justify-end gap-2">
              <button
                onClick={() => {
                  setSummaryModalDoc(null);
                  navigate(`/documents/${summaryModalDoc.id}`);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#8B7355] text-white rounded-xl shadow-warm-sm"
              >
                Open Workspace →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242321]">Document Library</h1>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Ingest, search, analyze, and manage enterprise contracts and corporate policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/contract-summarizer')}
            className="bg-[#FAF8F5] border border-[#E4DED4] hover:bg-[#F1EDE5] text-[#242321] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-warm-sm transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#8B7355]" />
            Summarize Contract
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-warm-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      {/* FILTERS & SEARCH ROW */}
      <div className="bg-white border border-[#E4DED4] rounded-2xl p-4 shadow-warm-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8B7355] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by file name or text content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#242321] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-[#6F6A62]">
            <Filter className="w-3.5 h-3.5 text-[#8B7355]" />
            <span>Category:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-2.5 py-1 text-xs text-[#242321] focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Contract">Contract</option>
              <option value="Policy">Policy</option>
              <option value="Financial Report">Financial Report</option>
              <option value="HR Document">HR Document</option>
              <option value="Compliance">Compliance</option>
              <option value="Security">Security</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6F6A62]">
            <span>Risk Level:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-2.5 py-1 text-xs text-[#242321] focus:outline-none"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCUMENTS TABLE OR EMPTY STATE */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">
              {documents.length === 0 ? 'No documents uploaded yet.' : 'No matching documents found.'}
            </h3>
            <p className="text-xs text-[#6F6A62]">
              {documents.length === 0 ? 'Upload a document to get started.' : 'Try adjusting your search query or filters.'}
            </p>
          </div>
          {documents.length === 0 && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs shadow-warm-sm transition"
            >
              <Plus className="w-4 h-4" />
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4DED4] text-[#9A948A] uppercase tracking-wider font-bold bg-[#FAF8F5]">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pages / Size</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DED4]/60">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#242321]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E4DED4] text-[#8B7355]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-[#242321]">{doc.name}</p>
                          <p className="text-[11px] text-[#6F6A62] line-clamp-1">{doc.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6A62] font-medium">{doc.type}</td>
                    <td className="py-3.5 px-4 text-[#6F6A62]">{doc.pages} pgs • {doc.fileSize}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        doc.riskLevel === 'High' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' :
                        doc.riskLevel === 'Medium' ? 'bg-[#A4773C]/10 text-[#A4773C]' : 'bg-[#58745A]/10 text-[#58745A]'
                      }`}>
                        {doc.riskLevel} ({doc.riskScore}/100)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6A62]">{doc.updatedAt}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doc.type === 'Contract' && (
                          <button
                            onClick={() => navigate('/contract-summarizer')}
                            title="Summarize Contract"
                            className="p-1.5 rounded-lg text-[#8B7355] hover:bg-[#8B7355]/10 transition flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            Summarize
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/documents/${doc.id}`)}
                          title="View Document"
                          className="p-1.5 rounded-lg text-[#6F6A62] hover:text-[#242321] hover:bg-[#F1EDE5] transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSummaryModalDoc(doc)}
                          title="Quick AI Summary"
                          className="p-1.5 rounded-lg text-[#6F6A62] hover:text-[#8B7355] hover:bg-[#F1EDE5] transition"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate('/changes')}
                          title="Compare Version"
                          className="p-1.5 rounded-lg text-[#6F6A62] hover:text-[#242321] hover:bg-[#F1EDE5] transition"
                        >
                          <GitCompare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          title="Delete Document"
                          className="p-1.5 rounded-lg text-[#9A948A] hover:text-[#9A4F45] hover:bg-[#9A4F45]/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
