import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Calendar,
  FileCheck,
  GitCompare,
  Trash2,
  Loader2,
  BookOpen,
  ArrowRight,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { documentService } from '../services/documentService';
import type { ChatMessage, DocumentItem } from '../types';
import { toast } from 'sonner';

export const AIWorkspace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const contractIdParam = searchParams.get('contractId');
  const contractNameParam = searchParams.get('name');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(contractIdParam || 'all');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: contractNameParam
        ? `Analyzing contract context: ${decodeURIComponent(contractNameParam)}. Ask any question to perform grounded RAG search and extract liabilities, terms, or obligations.`
        : 'Welcome to the DocuMind Enterprise AI Workspace. Select a document or query your uploaded documents to extract legal obligations, liability risks, compliance gaps, and contract deadlines.',
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    documentService.getDocuments()
      .then(setDocuments)
      .catch((err: any) => {
        setApiError(err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputQuery;
    if (!prompt.trim()) return;

    setApiError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const response = await aiService.sendChatMessage(prompt, selectedDocId);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      const msg = err.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let prompt = '';
    switch (action) {
      case 'summarize':
        prompt = 'Summarize key terms, obligations, and scope of services.';
        break;
      case 'risks':
        prompt = 'Identify all high-severity risk items, uncapped liability clauses, and legal exposure.';
        break;
      case 'deadlines':
        prompt = 'Extract all critical deadlines, opt-out notice windows, and renewal dates.';
        break;
      case 'compliance':
        prompt = 'Run a compliance audit for GDPR, CCPA, and SOC2 standards.';
        break;
      default:
        prompt = 'Generate executive intelligence summary.';
    }
    handleSend(prompt);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: 'Conversation history reset. Select a document or type a query to begin analysis.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    toast.info('Conversation history cleared');
  };

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col fade-in text-[#242321]">
      {/* API ERROR BANNER */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-[#9A4F45]/10 border border-[#9A4F45]/30 text-[#9A4F45] text-xs font-semibold flex items-center justify-between gap-3 shrink-0 shadow-warm-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="text-xs underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* WORKSPACE TOOLBAR HEADER */}
      <div className="bg-white border border-[#E4DED4] p-4 rounded-2xl shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#8B7355] text-white">
              <Bot className="w-4 h-4" />
            </div>
            <h1 className="font-heading text-xl font-bold text-[#242321]">AI Intelligence Workspace</h1>
          </div>
          <p className="text-xs text-[#6F6A62] mt-0.5">
            RAG document synthesis, citation lookup, and contract analysis via FastAPI backend.
          </p>
        </div>

        {/* Document Target Selector */}
        <div className="flex items-center gap-2">
          {contractNameParam && (
            <span className="text-xs font-semibold bg-[#8B7355]/10 text-[#8B7355] px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Targeting: {decodeURIComponent(contractNameParam)}
            </span>
          )}

          <span className="text-xs font-semibold text-[#6F6A62]">Target Context:</span>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-1.5 text-xs font-medium text-[#242321] focus:outline-none max-w-xs truncate"
          >
            <option value="all">Entire Document Corpus ({documents.length} Docs)</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleClearHistory}
            title="Reset Chat"
            className="p-2 rounded-xl text-[#9A948A] hover:text-[#9A4F45] hover:bg-[#9A4F45]/10 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK ACTION SHORTCUT CHIPS */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={() => handleQuickAction('summarize')}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E4DED4] hover:border-[#8B7355] text-xs font-medium text-[#242321] shadow-warm-sm transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8B7355]" /> Summarize
        </button>
        <button
          onClick={() => handleQuickAction('risks')}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E4DED4] hover:border-[#9A4F45] text-xs font-medium text-[#242321] shadow-warm-sm transition flex items-center gap-1.5"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#9A4F45]" /> Find Risks
        </button>
        <button
          onClick={() => handleQuickAction('deadlines')}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E4DED4] hover:border-[#A4773C] text-xs font-medium text-[#242321] shadow-warm-sm transition flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-[#A4773C]" /> Find Deadlines
        </button>
        <button
          onClick={() => handleQuickAction('compliance')}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E4DED4] hover:border-[#58745A] text-xs font-medium text-[#242321] shadow-warm-sm transition flex items-center gap-1.5"
        >
          <FileCheck className="w-3.5 h-3.5 text-[#58745A]" /> Check Compliance
        </button>
        <button
          onClick={() => navigate('/changes')}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E4DED4] hover:border-[#8B7355] text-xs font-medium text-[#242321] shadow-warm-sm transition flex items-center gap-1.5"
        >
          <GitCompare className="w-3.5 h-3.5 text-[#6F6A62]" /> Compare Versions
        </button>
      </div>

      {/* CHAT MESSAGES BODY */}
      <div className="flex-1 bg-white border border-[#E4DED4] rounded-2xl p-4 md:p-6 shadow-warm-sm overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-2 text-[10px] text-[#9A948A] px-1">
              <span className="font-semibold uppercase tracking-wider text-[#6F6A62]">
                {msg.sender === 'user' ? 'You' : 'DocuMind AI Agent'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#8B7355] text-white rounded-br-none shadow-warm-sm font-medium'
                  : 'bg-[#FAF8F5] border border-[#E4DED4] text-[#242321] rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>

              {/* CITATIONS CARD IF INCLUDED */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E4DED4] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7355] block">
                    SOURCE CITATION
                  </span>
                  {msg.citations.map((cit, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-[#E4DED4] text-xs text-[#242321] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-[#8B7355]">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{cit.documentName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#6F6A62] bg-[#F1EDE5] px-1.5 py-0.5 rounded">
                          Page {cit.page} • {cit.section}
                        </span>
                      </div>

                      <p className="font-serif italic text-[11px] text-[#6F6A62] bg-[#FAF8F5] p-2 rounded border border-[#E4DED4]/60">
                        "{cit.snippet}"
                      </p>

                      <button
                        onClick={() => navigate(`/documents/${cit.documentId}`)}
                        className="text-[11px] font-bold text-[#8B7355] hover:text-[#5F4B35] flex items-center gap-1 transition pt-1"
                      >
                        View in document workspace <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#8B7355] font-medium p-3 bg-[#FAF8F5] rounded-xl border border-[#E4DED4] max-w-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching ChromaDB and querying FastAPI backend...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT BAR */}
      <div className="bg-white border border-[#E4DED4] p-3 rounded-2xl shadow-warm-sm shrink-0 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask any question about your uploaded documents, liabilities, or clauses..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-[#242321] placeholder-[#9A948A] focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          className="bg-[#8B7355] hover:bg-[#5F4B35] disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
