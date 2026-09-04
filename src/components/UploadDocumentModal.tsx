import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { DocumentType } from '../types';
import { documentService } from '../services/documentService';
import { toast } from 'sonner';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>('Contract');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
        setError('Only PDF, DOCX, and TXT files are supported.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(10);
    setProgressStep('Initializing document ingest pipeline...');

    try {
      await documentService.uploadDocument(file, docType, (p, stepMsg) => {
        setProgress(p);
        setProgressStep(stepMsg);
      });

      toast.success(`Successfully analyzed ${file.name}`);
      setIsUploading(false);
      setFile(null);
      setProgress(0);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || 'Failed to upload and analyze document.');
      toast.error('Upload failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 fade-in">
      <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-lg w-full p-6 text-[#242321]">
        <div className="flex items-center justify-between border-b border-[#E4DED4] pb-4 mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#242321]">Upload Enterprise Document</h3>
            <p className="text-xs text-[#6F6A62]">Analyze contracts, policies, and reports with DocuMind AI agents.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-[#9A948A] hover:text-[#242321] hover:bg-[#F1EDE5] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#9A4F45]/10 border border-[#9A4F45]/20 text-[#9A4F45] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-[#E4DED4] hover:border-[#8B7355] rounded-xl p-6 text-center bg-[#FAF8F5] transition cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-[#8B7355]" />
                <div className="text-left">
                  <p className="font-medium text-sm text-[#242321] truncate max-w-xs">{file.name}</p>
                  <p className="text-xs text-[#9A948A]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-10 h-10 text-[#8B7355] mb-2" />
                <p className="text-sm font-medium text-[#242321]">
                  Click to choose file <span className="text-[#6F6A62]">or drag and drop</span>
                </p>
                <p className="text-xs text-[#9A948A] mt-1">Supports PDF, DOCX, TXT up to 50MB</p>
              </div>
            )}
          </div>

          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#6F6A62] uppercase tracking-wider mb-1.5">
              Document Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              disabled={isUploading}
              className="w-full bg-[#FAF8F5] border border-[#E4DED4] rounded-xl px-3 py-2 text-sm text-[#242321] focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40"
            >
              <option value="Contract">Contract / Master Agreement</option>
              <option value="Policy">Policy / Handbook</option>
              <option value="Financial Report">Financial Report / Audit</option>
              <option value="HR Document">HR Document</option>
              <option value="Compliance">Compliance & Regulatory</option>
              <option value="Security">Security & Audit</option>
              <option value="Technical">Technical Specifications</option>
            </select>
          </div>

          {/* Progress Indicator */}
          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-[#6F6A62]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B7355]" />
                  {progressStep}
                </span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-[#F1EDE5] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#8B7355] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#E4DED4]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-[#6F6A62] hover:text-[#242321] hover:bg-[#F1EDE5] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#8B7355] hover:bg-[#5F4B35] disabled:opacity-50 rounded-xl shadow-warm-sm transition flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Start AI Ingestion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
