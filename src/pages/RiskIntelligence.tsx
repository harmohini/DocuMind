import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Filter,
  X,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { riskService } from '../services/riskService';
import type { RiskItem } from '../types';
import { toast } from 'sonner';

export const RiskIntelligence: React.FC = () => {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedRiskDetail, setSelectedRiskDetail] = useState<RiskItem | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadRisks = () => {
    setApiError(null);
    riskService.getRisks()
      .then(setRisks)
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: RiskItem['status']) => {
    try {
      await riskService.updateRiskStatus(id, newStatus);
      toast.success(`Risk status updated to ${newStatus}`);
      if (selectedRiskDetail && selectedRiskDetail.id === id) {
        setSelectedRiskDetail({ ...selectedRiskDetail, status: newStatus });
      }
      loadRisks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update risk status');
    }
  };

  const highCount = risks.filter((r) => r.severity === 'High').length;
  const medCount = risks.filter((r) => r.severity === 'Medium').length;
  const lowCount = risks.filter((r) => r.severity === 'Low').length;

  const overallScore = risks.length > 0
    ? Math.min(100, Math.round((highCount * 35 + medCount * 20 + lowCount * 5) / risks.length))
    : 0;

  const filteredRisks = selectedSeverity === 'All'
    ? risks
    : risks.filter((r) => r.severity === selectedSeverity);

  const pieData = [
    { name: 'High Risk', value: highCount, color: '#9A4F45' },
    { name: 'Medium Risk', value: medCount, color: '#A4773C' },
    { name: 'Low Risk', value: lowCount, color: '#58745A' },
  ].filter(d => d.value > 0);

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
            onClick={loadRisks}
            className="px-3 py-1 bg-[#9A4F45] text-white text-[11px] font-bold rounded-lg shadow-warm-sm hover:bg-[#9A4F45]/90 transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* RISK DETAIL DRAWER */}
      {selectedRiskDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-xl w-full h-full max-h-[90vh] p-6 text-[#242321] overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E4DED4] pb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#9A4F45]" />
                  <h3 className="font-heading font-bold text-lg">Risk Intelligence Detail</h3>
                </div>
                <button
                  onClick={() => setSelectedRiskDetail(null)}
                  className="p-1 rounded-lg text-[#9A948A] hover:text-[#242321]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    selectedRiskDetail.severity === 'High' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' : 'bg-[#A4773C]/10 text-[#A4773C]'
                  }`}>
                    {selectedRiskDetail.severity} Severity Risk
                  </span>
                  <h2 className="font-heading font-bold text-lg text-[#242321] mt-2">
                    {selectedRiskDetail.title}
                  </h2>
                  <p className="text-xs text-[#6F6A62] mt-1">
                    Detected on {selectedRiskDetail.detectedAt} in{' '}
                    <strong
                      onClick={() => navigate(`/documents/${selectedRiskDetail.documentId}`)}
                      className="text-[#8B7355] underline cursor-pointer"
                    >
                      {selectedRiskDetail.documentName}
                    </strong>
                  </p>
                </div>

                {/* Detection Reason */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] space-y-1">
                  <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider block">
                    WHY IT WAS DETECTED
                  </span>
                  <p className="text-xs text-[#6F6A62] leading-relaxed">{selectedRiskDetail.explanation}</p>
                </div>

                {/* Evidence Quote */}
                {selectedRiskDetail.evidence && (
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] space-y-1">
                    <span className="text-[11px] font-bold text-[#6F6A62] uppercase tracking-wider block">
                      EVIDENCE SNIPPET ({selectedRiskDetail.section}, Page {selectedRiskDetail.page})
                    </span>
                    <p className="font-serif italic text-xs text-[#242321] p-2 bg-white rounded border border-[#E4DED4]">
                      "{selectedRiskDetail.evidence}"
                    </p>
                  </div>
                )}

                {/* Potential Impact */}
                {selectedRiskDetail.potentialImpact && (
                  <div className="p-3.5 rounded-xl bg-[#9A4F45]/10 border border-[#9A4F45]/20 space-y-1">
                    <span className="text-[11px] font-bold text-[#9A4F45] uppercase tracking-wider block">
                      POTENTIAL IMPACT
                    </span>
                    <p className="text-xs text-[#9A4F45] font-medium">{selectedRiskDetail.potentialImpact}</p>
                  </div>
                )}

                {/* Recommendation */}
                {selectedRiskDetail.recommendation && (
                  <div className="p-3.5 rounded-xl bg-[#58745A]/10 border border-[#58745A]/20 space-y-1">
                    <span className="text-[11px] font-bold text-[#58745A] uppercase tracking-wider block">
                      AI MITIGATION RECOMMENDATION
                    </span>
                    <p className="text-xs text-[#58745A] font-medium">{selectedRiskDetail.recommendation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status update buttons */}
            <div className="pt-6 border-t border-[#E4DED4] flex items-center justify-between gap-2">
              <span className="text-xs text-[#6F6A62]">Status: <strong>{selectedRiskDetail.status}</strong></span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedRiskDetail.id, 'Mitigated')}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#F1EDE5] border border-[#E4DED4] text-[#242321] rounded-xl transition"
                >
                  Mark Mitigated
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedRiskDetail.id, 'Resolved')}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#58745A] hover:bg-[#58745A]/90 text-white rounded-xl shadow-warm-sm transition"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242321]">Risk Intelligence</h1>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Automated legal risk detection, uncapped liability alerts, and mitigation recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-[#9A948A] uppercase">Overall Risk Rating</span>
              <p className="font-heading font-extrabold text-xl text-[#9A4F45]">{overallScore} / 100</p>
            </div>
            <ShieldAlert className="w-6 h-6 text-[#9A4F45]" />
          </div>
        </div>
      </div>

      {/* RISKS BODY OR EMPTY STATE */}
      {risks.length === 0 ? (
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">No risk items detected yet.</h3>
            <p className="text-xs text-[#6F6A62]">
              Upload documents in the Document Library or Contract Summarizer to trigger automated risk intelligence scanning.
            </p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs shadow-warm-sm transition"
          >
            Go to Document Library
          </button>
        </div>
      ) : (
        <>
          {/* CHARTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Chart 1: Risk Distribution */}
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-[#242321]">Severity Distribution</h3>
                <p className="text-xs text-[#6F6A62]">Categorization of identified document risks.</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center my-2">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={45} outerRadius={65} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-[#9A948A]">No severity metrics to render</p>
                )}
              </div>

              <div className="flex justify-center gap-6 text-xs pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#9A4F45]"></span>
                  <span>High ({highCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#A4773C]"></span>
                  <span>Medium ({medCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#58745A]"></span>
                  <span>Low ({lowCount})</span>
                </div>
              </div>
            </div>

            {/* Summary Breakdown Card */}
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#242321]">Risk Summary Breakdown</h3>
                <p className="text-xs text-[#6F6A62]">Calculated directly from uploaded document analysis.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#9A4F45]/10 border border-[#9A4F45]/20 flex justify-between items-center">
                  <span className="font-bold text-[#9A4F45]">High Severity Exposure</span>
                  <span className="font-extrabold text-sm text-[#9A4F45]">{highCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#A4773C]/10 border border-[#A4773C]/20 flex justify-between items-center">
                  <span className="font-bold text-[#A4773C]">Medium Severity Risk</span>
                  <span className="font-extrabold text-sm text-[#A4773C]">{medCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#58745A]/10 border border-[#58745A]/20 flex justify-between items-center">
                  <span className="font-bold text-[#58745A]">Low Severity Advisory</span>
                  <span className="font-extrabold text-sm text-[#58745A]">{lowCount}</span>
                </div>
              </div>
            </div>

          </div>

          {/* DETECTED RISKS TABLE */}
          <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm overflow-hidden">
            <div className="p-4 border-b border-[#E4DED4] flex items-center justify-between flex-wrap gap-3 bg-[#FAF8F5]">
              <h3 className="font-heading font-bold text-base text-[#242321]">Detected Risk Items</h3>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#8B7355]" />
                <span className="text-xs text-[#6F6A62]">Severity:</span>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-white border border-[#E4DED4] rounded-xl px-2.5 py-1 text-xs text-[#242321] focus:outline-none"
                >
                  <option value="All">All Severities</option>
                  <option value="High">High Severity</option>
                  <option value="Medium">Medium Severity</option>
                  <option value="Low">Low Severity</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4DED4] text-[#9A948A] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Risk Item</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Source Document</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DED4]/60">
                  {filteredRisks.map((risk) => (
                    <tr
                      key={risk.id}
                      onClick={() => setSelectedRiskDetail(risk)}
                      className="hover:bg-[#FAF8F5] cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#242321]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#242321]">{risk.title}</p>
                          <p className="text-[11px] text-[#6F6A62] line-clamp-1">{risk.explanation}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          risk.severity === 'High' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' :
                          risk.severity === 'Medium' ? 'bg-[#A4773C]/10 text-[#A4773C]' : 'bg-[#58745A]/10 text-[#58745A]'
                        }`}>
                          {risk.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6F6A62]">
                        <p className="font-medium text-[#242321]">{risk.documentName}</p>
                        <p className="text-[10px] text-[#9A948A]">{risk.section}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          risk.status === 'Resolved' ? 'bg-[#58745A]/10 text-[#58745A]' : 'bg-[#A4773C]/10 text-[#A4773C]'
                        }`}>
                          {risk.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#8B7355] font-semibold">
                        Inspect Detail →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
