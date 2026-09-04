import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Download,
  Share2,
  Trash2,
  Eye,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { reportService } from '../services/reportService';
import type { ReportItem } from '../types';
import { toast } from 'sonner';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadReports = () => {
    setApiError(null);
    reportService.getReports()
      .then(setReports)
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownload = (title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toast.success(`Downloaded report: ${title}.pdf`);
  };

  const handleShare = (title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toast.info(`Share link for "${title}" copied to clipboard.`);
  };

  const handleDelete = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Delete report "${title}"?`)) {
      try {
        await reportService.deleteReport(id);
        toast.success('Report deleted');
        if (selectedReport?.id === id) setSelectedReport(null);
        loadReports();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete report');
      }
    }
  };

  const handleCreateNewReport = async () => {
    try {
      const title = `Executive Intelligence Briefing (${new Date().toLocaleDateString()})`;
      const newReport = await reportService.generateReport(title, 'Executive Summary');
      toast.success('Generated new executive report!');
      loadReports();
      setSelectedReport(newReport);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report');
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
            onClick={loadReports}
            className="px-3 py-1 bg-[#9A4F45] text-white text-[11px] font-bold rounded-lg shadow-warm-sm hover:bg-[#9A4F45]/90 transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* REPORT VIEWER MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-2xl w-full max-h-[90vh] p-6 text-[#242321] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7355] bg-[#E8E0D2] px-2 py-0.5 rounded-md">
                  {selectedReport.type}
                </span>
                <h2 className="font-heading font-bold text-xl text-[#242321] mt-1">{selectedReport.title}</h2>
                <p className="text-xs text-[#6F6A62]">Generated on {selectedReport.createdAt}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1.5 rounded-lg text-[#9A948A] hover:text-[#242321]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedReport.contentSummary && (
              <div className="space-y-4 text-xs">
                {/* Executive Summary */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] space-y-1">
                  <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">
                    EXECUTIVE SUMMARY
                  </span>
                  <p className="text-xs text-[#242321] leading-relaxed">
                    {selectedReport.contentSummary.executiveSummary}
                  </p>
                </div>

                {/* Key Findings */}
                {selectedReport.contentSummary.keyFindings && selectedReport.contentSummary.keyFindings.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#6F6A62] uppercase tracking-wider block">
                      KEY FINDINGS & LIABILITIES
                    </span>
                    <ul className="space-y-1.5">
                      {selectedReport.contentSummary.keyFindings.map((kf, idx) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-white border border-[#E4DED4] text-[#242321] flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#58745A] shrink-0 mt-0.5" />
                          <span>{kf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Compliance Status */}
                {selectedReport.contentSummary.complianceStatus && (
                  <div className="p-3.5 rounded-xl bg-[#58745A]/10 border border-[#58745A]/20">
                    <span className="text-[10px] font-bold text-[#58745A] uppercase tracking-wider block">
                      COMPLIANCE AUDIT STATUS
                    </span>
                    <p className="text-xs font-semibold text-[#58745A] mt-0.5">
                      {selectedReport.contentSummary.complianceStatus}
                    </p>
                  </div>
                )}

                {/* Recommended Actions */}
                {selectedReport.contentSummary.recommendedActions && selectedReport.contentSummary.recommendedActions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#6F6A62] uppercase tracking-wider block">
                      RECOMMENDED ACTIONS
                    </span>
                    {selectedReport.contentSummary.recommendedActions.map((ra, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E4DED4] font-medium text-[#242321]">
                        • {ra}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-[#E4DED4] flex justify-end gap-2">
              <button
                onClick={() => handleShare(selectedReport.title)}
                className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] rounded-xl flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Report
              </button>
              <button
                onClick={() => handleDownload(selectedReport.title)}
                className="px-4 py-2 text-xs font-semibold bg-[#8B7355] hover:bg-[#5F4B35] text-white rounded-xl shadow-warm-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242321]">Executive Reports</h1>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Automated executive briefings, risk assessments, and compliance audit summaries.
          </p>
        </div>

        <button
          onClick={handleCreateNewReport}
          className="bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-warm-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Generate New Report
        </button>
      </div>

      {/* REPORT TABLE OR EMPTY STATE */}
      {reports.length === 0 ? (
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">No executive reports generated yet.</h3>
            <p className="text-xs text-[#6F6A62]">
              Click "Generate New Report" above to generate structured executive intelligence reports from your documents.
            </p>
          </div>
          <button
            onClick={handleCreateNewReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs shadow-warm-sm transition"
          >
            <Plus className="w-4 h-4" />
            Generate New Report
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm overflow-hidden">
          <div className="p-4 border-b border-[#E4DED4] bg-[#FAF8F5]">
            <h3 className="font-heading font-bold text-base text-[#242321]">Generated Report Library</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E4DED4] text-[#9A948A] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Report Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DED4]/60">
                {reports.map((rep) => (
                  <tr
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className="hover:bg-[#FAF8F5] cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#242321]">
                      <div className="flex items-center gap-2">
                        <FileBarChart className="w-4 h-4 text-[#8B7355] shrink-0" />
                        <span className="font-bold text-[#242321]">{rep.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#6F6A62]">{rep.type}</td>
                    <td className="py-3.5 px-4 text-[#6F6A62]">{rep.createdAt}</td>
                    <td className="py-3.5 px-4 text-[#9A948A]">{rep.fileSize}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold text-[#58745A] bg-[#58745A]/10 px-2 py-0.5 rounded-md">
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedReport(rep)}
                          title="View Report"
                          className="p-1.5 rounded-lg text-[#6F6A62] hover:text-[#242321] hover:bg-[#E8E0D2]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDownload(rep.title, e)}
                          title="Download PDF"
                          className="p-1.5 rounded-lg text-[#8B7355] hover:text-[#5F4B35] hover:bg-[#E8E0D2]"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleShare(rep.title, e)}
                          title="Share Report"
                          className="p-1.5 rounded-lg text-[#6F6A62] hover:text-[#242321] hover:bg-[#E8E0D2]"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(rep.id, rep.title, e)}
                          title="Delete Report"
                          className="p-1.5 rounded-lg text-[#9A4F45] hover:bg-[#9A4F45]/10"
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
