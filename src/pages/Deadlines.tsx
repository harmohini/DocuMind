import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Clock,
  Trash2,
  X,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { deadlineService } from '../services/deadlineService';
import type { DeadlineItem } from '../types';
import { toast } from 'sonner';

export const Deadlines: React.FC = () => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'timeline'>('list');
  const [selectedDeadline, setSelectedDeadline] = useState<DeadlineItem | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadDeadlines = () => {
    setApiError(null);
    deadlineService.getDeadlines()
      .then(setDeadlines)
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  };

  useEffect(() => {
    loadDeadlines();
  }, []);

  const handleToggleStatus = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deadlineService.toggleDeadlineStatus(id);
      toast.success('Deadline status updated');
      loadDeadlines();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update deadline status');
    }
  };

  const handleDelete = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Delete deadline "${title}"?`)) {
      try {
        await deadlineService.deleteDeadline(id);
        toast.success('Deadline removed');
        setSelectedDeadline(null);
        loadDeadlines();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete deadline');
      }
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
            onClick={loadDeadlines}
            className="px-3 py-1 bg-[#9A4F45] text-white text-[11px] font-bold rounded-lg shadow-warm-sm hover:bg-[#9A4F45]/90 transition shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedDeadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-in">
          <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-md w-full p-6 text-[#242321] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4DED4] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#8B7355]" />
                <h3 className="font-heading font-bold text-base">Deadline Intelligence</h3>
              </div>
              <button onClick={() => setSelectedDeadline(null)} className="p-1 text-[#9A948A] hover:text-[#242321]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#6F6A62]">
              <div>
                <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">DUE DATE</span>
                <span className="font-bold text-base text-[#242321]">{selectedDeadline.date}</span>
                <h4 className="font-bold text-sm text-[#242321] mt-1">{selectedDeadline.title}</h4>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E4DED4]/60 space-y-1">
                <span className="text-[10px] font-bold text-[#6F6A62] uppercase block">Contract Obligation</span>
                <p className="text-xs text-[#242321] leading-relaxed">{selectedDeadline.obligation}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#F1EDE5]">
                  <span className="text-[#9A948A] block">Responsible Team</span>
                  <span className="font-bold text-[#242321]">{selectedDeadline.responsibleTeam}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F1EDE5]">
                  <span className="text-[#9A948A] block">Priority</span>
                  <span className="font-bold text-[#9A4F45]">{selectedDeadline.priority} Priority</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DED4] flex justify-between items-center">
              <button
                onClick={(e) => handleDelete(selectedDeadline.id, selectedDeadline.title, e)}
                className="text-xs font-semibold text-[#9A4F45] hover:underline"
              >
                Delete Deadline
              </button>

              <button
                onClick={() => handleToggleStatus(selectedDeadline.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#8B7355] hover:bg-[#5F4B35] rounded-xl shadow-warm-sm transition"
              >
                {selectedDeadline.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#242321]">Contract & Filing Deadlines</h1>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            Track renewal windows, non-renewal opt-outs, and regulatory compliance milestones.
          </p>
        </div>

        {/* VIEW SWITCHER */}
        <div className="flex items-center gap-1 bg-white border border-[#E4DED4] p-1 rounded-2xl shadow-warm-sm">
          <button
            onClick={() => setActiveView('list')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeView === 'list' ? 'bg-[#8B7355] text-white shadow-warm-sm' : 'text-[#6F6A62] hover:text-[#242321]'
            }`}
          >
            <List className="w-3.5 h-3.5" /> List View
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeView === 'calendar' ? 'bg-[#8B7355] text-white shadow-warm-sm' : 'text-[#6F6A62] hover:text-[#242321]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar View
          </button>
          <button
            onClick={() => setActiveView('timeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
              activeView === 'timeline' ? 'bg-[#8B7355] text-white shadow-warm-sm' : 'text-[#6F6A62] hover:text-[#242321]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Timeline View
          </button>
        </div>
      </div>

      {deadlines.length === 0 ? (
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-12 text-center shadow-warm-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F1EDE5] text-[#8B7355] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#242321]">No contract deadlines recorded yet.</h3>
            <p className="text-xs text-[#6F6A62]">
              Deadlines and milestone opt-out dates will appear here as contract documents are ingested.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* VIEW 1: LIST VIEW */}
          {activeView === 'list' && (
            <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-sm overflow-hidden">
              <div className="p-4 border-b border-[#E4DED4] bg-[#FAF8F5]">
                <h3 className="font-heading font-bold text-base text-[#242321]">Upcoming Contract Deadlines</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4DED4] text-[#9A948A] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Deadline Title</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Source Document</th>
                      <th className="py-3 px-4">Responsible Team</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DED4]/60">
                    {deadlines.map((dl) => (
                      <tr
                        key={dl.id}
                        onClick={() => setSelectedDeadline(dl)}
                        className="hover:bg-[#FAF8F5] cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 font-semibold text-[#242321]">
                          <p className="font-bold text-[#242321]">{dl.title}</p>
                          <p className="text-[11px] text-[#6F6A62] line-clamp-1">{dl.obligation}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#8B7355] bg-[#E8E0D2]/60 px-2 py-0.5 rounded-md">
                            {dl.date}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#6F6A62]">
                          <p className="font-medium text-[#242321]">{dl.documentName}</p>
                        </td>
                        <td className="py-3.5 px-4 text-[#6F6A62]">{dl.responsibleTeam}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            dl.status === 'Completed' ? 'bg-[#58745A]/10 text-[#58745A]' : 'bg-[#A4773C]/10 text-[#A4773C]'
                          }`}>
                            {dl.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleToggleStatus(dl.id, e)}
                              className="text-[11px] font-semibold text-[#8B7355] hover:underline"
                            >
                              {dl.status === 'Completed' ? 'Undo' : 'Mark Done'}
                            </button>
                            <button
                              onClick={(e) => handleDelete(dl.id, dl.title, e)}
                              className="p-1 text-[#9A4F45] hover:bg-[#9A4F45]/10 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* VIEW 2: CALENDAR VIEW */}
          {activeView === 'calendar' && (
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DED4]">
                <h3 className="font-heading font-bold text-base">Milestone Calendar</h3>
                <span className="text-xs text-[#6F6A62]">{deadlines.length} Active Milestone Deadlines</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deadlines.map((dl) => (
                  <div
                    key={dl.id}
                    onClick={() => setSelectedDeadline(dl)}
                    className="p-4 rounded-xl border border-[#E4DED4] bg-[#FAF8F5] hover:border-[#8B7355] cursor-pointer transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7355] bg-[#E8E0D2] px-2 py-0.5 rounded">
                        {dl.date}
                      </span>
                      <span className="text-[10px] font-semibold text-[#9A4F45] bg-[#9A4F45]/10 px-1.5 py-0.5 rounded">
                        {dl.priority} Priority
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#242321]">{dl.title}</h4>
                    <p className="text-[11px] text-[#6F6A62] line-clamp-2">{dl.obligation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: TIMELINE VIEW */}
          {activeView === 'timeline' && (
            <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-warm-sm space-y-6">
              <h3 className="font-heading font-bold text-base border-b border-[#E4DED4] pb-3">Contract Milestone Chronology</h3>

              <div className="relative pl-6 border-l-2 border-[#8B7355]/40 space-y-6">
                {deadlines.map((dl) => (
                  <div key={dl.id} className="relative space-y-1 group">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#8B7355] border-2 border-white shadow-warm-sm"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8B7355]">{dl.date}</span>
                      <span className="text-[10px] font-semibold text-[#6F6A62] bg-[#F1EDE5] px-2 py-0.5 rounded">
                        {dl.responsibleTeam}
                      </span>
                    </div>
                    <h4
                      onClick={() => setSelectedDeadline(dl)}
                      className="font-bold text-sm text-[#242321] hover:text-[#8B7355] cursor-pointer transition"
                    >
                      {dl.title}
                    </h4>
                    <p className="text-xs text-[#6F6A62] leading-relaxed max-w-xl">{dl.obligation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
