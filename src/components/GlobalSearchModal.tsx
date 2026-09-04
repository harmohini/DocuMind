import React, { useState, useEffect } from 'react';
import { Search, X, FileText, AlertTriangle, Calendar, FileBarChart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { riskService } from '../services/riskService';
import { deadlineService } from '../services/deadlineService';
import { reportService } from '../services/reportService';
import type { DocumentItem, RiskItem, DeadlineItem, ReportItem } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      documentService.getDocuments().then(setDocs);
      riskService.getRisks().then(setRisks);
      deadlineService.getDeadlines().then(setDeadlines);
      reportService.getReports().then(setReports);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredDocs = q ? docs.filter(d => d.name.toLowerCase().includes(q) || d.summary?.toLowerCase().includes(q)) : docs.slice(0, 3);
  const filteredRisks = q ? risks.filter(r => r.title.toLowerCase().includes(q) || r.documentName.toLowerCase().includes(q)) : risks.slice(0, 2);
  const filteredDeadlines = q ? deadlines.filter(dl => dl.title.toLowerCase().includes(q) || dl.documentName.toLowerCase().includes(q)) : deadlines.slice(0, 2);
  const filteredReports = q ? reports.filter(r => r.title.toLowerCase().includes(q)) : reports.slice(0, 2);

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 fade-in">
      <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-2xl w-full overflow-hidden text-[#242321]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-[#E4DED4] bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-[#8B7355] mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search documents, risks, deadlines, reports... (press Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#242321] placeholder-[#9A948A] focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#9A948A] hover:text-[#242321] mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] uppercase font-bold text-[#9A948A] bg-[#E8E0D2] px-2 py-0.5 rounded-md">Esc</span>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 divide-y divide-[#E4DED4]/60">

          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div className="pt-2 first:pt-0">
              <div className="text-[11px] font-bold text-[#9A948A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8B7355]" />
                Documents
              </div>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelect(`/documents/${doc.id}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F1EDE5] flex items-center justify-between group transition"
                  >
                    <div className="truncate pr-4">
                      <p className="text-xs font-semibold text-[#242321] truncate">{doc.name}</p>
                      <p className="text-[11px] text-[#6F6A62] truncate">{doc.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        doc.riskLevel === 'High' ? 'bg-[#9A4F45]/10 text-[#9A4F45]' : 'bg-[#58745A]/10 text-[#58745A]'
                      }`}>
                        {doc.riskLevel} Risk
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#9A948A] group-hover:text-[#8B7355] group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Risks Section */}
          {filteredRisks.length > 0 && (
            <div className="pt-3">
              <div className="text-[11px] font-bold text-[#9A948A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#A4773C]" />
                Risk Intelligence
              </div>
              <div className="space-y-1">
                {filteredRisks.map((risk) => (
                  <button
                    key={risk.id}
                    onClick={() => handleSelect('/risks')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F1EDE5] flex items-center justify-between group transition"
                  >
                    <div className="truncate pr-4">
                      <p className="text-xs font-semibold text-[#242321] truncate">{risk.title}</p>
                      <p className="text-[11px] text-[#6F6A62] truncate">{risk.documentName} • {risk.section}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9A948A] group-hover:text-[#8B7355] shrink-0 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deadlines Section */}
          {filteredDeadlines.length > 0 && (
            <div className="pt-3">
              <div className="text-[11px] font-bold text-[#9A948A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8B7355]" />
                Upcoming Deadlines
              </div>
              <div className="space-y-1">
                {filteredDeadlines.map((dl) => (
                  <button
                    key={dl.id}
                    onClick={() => handleSelect('/deadlines')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F1EDE5] flex items-center justify-between group transition"
                  >
                    <div className="truncate pr-4">
                      <p className="text-xs font-semibold text-[#242321] truncate">{dl.title}</p>
                      <p className="text-[11px] text-[#6F6A62] truncate">Due {dl.date} • {dl.responsibleTeam}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9A948A] group-hover:text-[#8B7355] shrink-0 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reports Section */}
          {filteredReports.length > 0 && (
            <div className="pt-3">
              <div className="text-[11px] font-bold text-[#9A948A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileBarChart className="w-3.5 h-3.5 text-[#58745A]" />
                Executive Reports
              </div>
              <div className="space-y-1">
                {filteredReports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => handleSelect('/reports')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#F1EDE5] flex items-center justify-between group transition"
                  >
                    <div className="truncate pr-4">
                      <p className="text-xs font-semibold text-[#242321] truncate">{rep.title}</p>
                      <p className="text-[11px] text-[#6F6A62] truncate">{rep.type} • {rep.createdAt}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9A948A] group-hover:text-[#8B7355] shrink-0 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredDocs.length === 0 && filteredRisks.length === 0 && filteredDeadlines.length === 0 && (
            <div className="py-8 text-center text-[#9A948A] text-xs">
              No matching documents, risks, or deadlines found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
