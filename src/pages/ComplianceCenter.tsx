import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileBarChart,
  ShieldCheck,
  X,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { complianceService } from '../services/complianceService';
import type { ComplianceItem } from '../types';
import { toast } from 'sonner';

export const ComplianceCenter: React.FC = () => {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadCompliance = () => {
    setApiError(null);
    complianceService.getComplianceItems()
      .then(setItems)
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  };

  useEffect(() => {
    loadCompliance();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ComplianceItem['status']) => {
    try {
      await complianceService.updateComplianceStatus(id, newStatus);
      toast.success(`Updated status to ${newStatus}`);
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
      loadCompliance();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update compliance item');
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await complianceService.generateComplianceReport();
      toast.success('Generated Executive Compliance Report!');
      navigate('/reports');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate compliance report');
    } finally {
      setIsGenerating(false);
    }
  };

  const passedCount = items.filter((i) => i.status === 'Passed').length;
  const scorePct = items.length > 0 ? Math.round((passedCount / items.length) * 100) : 0;

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
            onClick={loadCompliance}
            className="px-3 py-1 bg-[#9A4F45] text-white text-[11px] font-bold rounded-lg shadow-warm-sm hover:bg-[#9A4F45]/90 transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-md w-full p-6 text-[#242321] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#8B7355]" />
                <h3 className="font-heading font-bold text-base">Compliance Criteria Detail</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1 text-[#9A948A] hover:text-[#242321]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6F6A62]">
              <div>
                <span className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block">Category</span>
                <span className="font-bold text-sm text-[#242321]">{selectedItem.category}</span>
                <p className="font-semibold text-xs text-[#8B7355] mt-0.5">{selectedItem.requirementName}</p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E4DED4]/60 space-y-1">
                <span className="text-[10px] font-bold text-[#6F6A62] uppercase block">Audit Notes</span>
                <p className="text-xs text-[#242321] leading-relaxed">{selectedItem.notes}</p>
              </div>

              {selectedItem.documents && selectedItem.documents.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#9A948A] uppercase tracking-wider block mb-1">
                    Affected Documents ({selectedItem.affectedDocumentsCount})
                  </span>
                  <ul className="space-y-1">
                    {selectedItem.documents.map((doc, idx) => (
                      <li key={idx} className="p-2 rounded bg-[#F1EDE5] text-[#242321] font-medium flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8B7355]" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E4DED4] flex justify-between items-center">
              <span className="text-xs text-[#6F6A62]">Status: <strong>{selectedItem.status}</strong></span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, 'Passed')}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#58745A] text-white rounded-xl"
                >
                  Mark Passed
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, 'Failed')}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#9A4F45] text-white rounded-xl"
                >
                  Mark Failed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242321]">Compliance Center</h1>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Monitor governance policies, SOC2 standards, GDPR sub-processor rules, and liability requirements.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-warm-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <FileBarChart className="w-4 h-4" />
          {isGenerating ? 'Generating Report...' : 'Generate Compliance Report'}
        </button>
      </div>

      {/* COMPLIANCE SCORE BANNER */}
      <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-[#8B7355] bg-[#8B7355]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
            Governance & Audit Readiness
          </span>
          <h2 className="font-heading text-xl font-bold text-[#242321]">
            Overall Enterprise Compliance Score
          </h2>
          <p className="text-xs text-[#6F6A62] max-w-md">
            Calculated across SOC2 Type II, GDPR, CCPA, corporate NDA policies, and vendor liability caps.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="font-heading font-extrabold text-4xl text-[#58745A]">{scorePct}%</span>
            <span className="text-xs text-[#6F6A62] block mt-1">Audit Score</span>
          </div>
          <div className="w-px h-12 bg-[#E4DED4] hidden sm:block"></div>
          <div className="space-y-1 text-xs text-[#6F6A62]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#58745A]" />
              <span>{passedCount} Categories Passed</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#A4773C]" />
              <span>{items.filter(i => i.status === 'Needs Review').length} Require Review</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-[#9A4F45]" />
              <span>{items.filter(i => i.status === 'Failed').length} Failed Requirements</span>
            </div>
          </div>
        </div>
      </div>

      {/* REQUIREMENTS TABLE OR EMPTY STATE */}
      {items.length === 0 ? (
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">No compliance requirements recorded yet.</h3>
            <p className="text-xs text-[#6F6A62]">
              Compliance audit records will appear here as documents are ingested and analyzed by the FastAPI backend.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm overflow-hidden">
          <div className="p-4 border-b border-[#E4DED4] bg-[#FAF8F5]">
            <h3 className="font-heading font-bold text-base text-[#242321]">Compliance Requirements Checklist</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4DED4] text-[#9A948A] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Requirement Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Affected Documents</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4">Last Audited</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DED4]/60">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-[#FAF8F5] cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#242321]">
                      <p className="font-bold text-[#242321]">{item.requirementName}</p>
                      <p className="text-[11px] text-[#6F6A62] line-clamp-1">{item.notes}</p>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6A62] font-medium">{item.category}</td>
                    <td className="py-3.5 px-4 text-[#6F6A62]">
                      <span className="font-bold text-[#242321]">{item.affectedDocumentsCount} docs</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit ${
                        item.status === 'Passed' ? 'bg-[#58745A]/10 text-[#58745A]' :
                        item.status === 'Failed' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' : 'bg-[#A4773C]/10 text-[#A4773C]'
                      }`}>
                        {item.status === 'Passed' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Failed' && <XCircle className="w-3 h-3" />}
                        {item.status === 'Needs Review' && <AlertCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6A62]">{item.lastAudited}</td>
                    <td className="py-3.5 px-4 text-right text-[#8B7355] font-semibold">
                      Audit Item →
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
