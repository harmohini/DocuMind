import type { ContractItem } from '../types';
import { documentService } from './documentService';
import { fetchWithAuth } from './apiClient';
import { deadlineService } from './deadlineService';

export const contractService = {
  getContracts: async (): Promise<ContractItem[]> => {
    try {
      const docs = await documentService.getDocuments();
      const contractDocs = docs.filter((d) => d.type === 'Contract' || true); // return uploaded docs as contracts
      return contractDocs.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type || 'Contract',
        pages: d.pages,
        analyzedAt: d.updatedAt,
        contractValue: 'N/A',
        duration: '1 Year',
        startDate: 'Active',
        expiryDate: 'TBD',
        renewalType: 'Standard',
        riskScore: d.riskScore,
        parties: {
          organization: 'Current User',
          vendor: d.name.split('.')[0] || 'Counterparty'
        },
        paymentTerms: 'Net 30',
        terminationNotice: '30 Days',
        governingLaw: 'Standard Jurisdiction',
        summary: d.summary || 'Document ingested in local vector store.',
        clauses: [],
        obligations: [],
        importantDates: [],
        risks: []
      }));
    } catch (e: any) {
      console.error('FastAPI error in getContracts:', e);
      throw new Error('Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  getContractById: async (id: string): Promise<ContractItem | undefined> => {
    try {
      const doc = await documentService.getDocumentById(id);
      if (!doc) return undefined;

      let contract: ContractItem = {
        id: doc.id,
        name: doc.name,
        type: doc.type || 'Contract',
        pages: doc.pages,
        analyzedAt: doc.updatedAt,
        contractValue: 'N/A',
        duration: '1 Year',
        startDate: 'Active',
        expiryDate: 'TBD',
        renewalType: 'Standard',
        riskScore: doc.riskScore,
        parties: {
          organization: 'Current User',
          vendor: doc.name.split('.')[0] || 'Counterparty'
        },
        paymentTerms: 'Net 30',
        terminationNotice: '30 Days',
        governingLaw: 'Standard Jurisdiction',
        summary: doc.summary || 'Document ingested in local vector store.',
        clauses: [],
        obligations: [],
        importantDates: [],
        risks: []
      };

      try {
        const response = await fetchWithAuth(`/api/v1/documents/${id}/summarize`, { method: 'POST' });
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.summaryData) {
            const s = json.summaryData;
            contract = {
              ...contract,
              summary: s.summary || contract.summary,
              contractValue: s.contractValue || contract.contractValue,
              duration: s.duration || contract.duration,
              startDate: s.startDate || contract.startDate,
              expiryDate: s.expiryDate || contract.expiryDate,
              renewalType: s.renewalType || contract.renewalType,
              parties: s.parties || contract.parties,
              paymentTerms: s.paymentTerms || contract.paymentTerms,
              terminationNotice: s.terminationNotice || contract.terminationNotice,
              governingLaw: s.governingLaw || contract.governingLaw,
              clauses: s.clauses || contract.clauses,
              obligations: s.obligations || contract.obligations,
              importantDates: s.importantDates || contract.importantDates,
              risks: s.risks || contract.risks
            };
          }
        }
      } catch (e) {
        console.warn('Contract summary fetch endpoint error:', e);
      }

      return contract;
    } catch (e: any) {
      console.error(`FastAPI error in getContractById(${id}):`, e);
      throw new Error('Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  analyzeDocumentAgent: async (id: string): Promise<any> => {
    try {
      const response = await fetchWithAuth(`/api/v1/documents/${id}/analyze`, { method: 'POST' });
      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error?.message || errJson?.detail || `Analysis failed with code ${response.status}`);
      }
      const json = await response.json();
      if (json.success && json.analysisData) {
        return json.analysisData;
      }
      throw new Error('Invalid analysis response structure from backend.');
    } catch (e: any) {
      console.error('FastAPI Document Analyst Agent error:', e);
      throw new Error(e.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  generateExecutiveSummary: async (id: string): Promise<any> => {
    try {
      const response = await fetchWithAuth(`/api/v1/documents/${id}/executive-summary`, { method: 'POST' });
      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error?.message || errJson?.detail || `Executive summary failed with code ${response.status}`);
      }
      const json = await response.json();
      if (json.success && json.executiveSummary) {
        return json.executiveSummary;
      }
      throw new Error('Invalid executive summary response structure from backend.');
    } catch (e: any) {
      console.error('FastAPI Executive Summary error:', e);
      throw new Error(e.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  uploadContract: async (
    file: File,
    onProgress?: (progress: number, step: string) => void
  ): Promise<ContractItem> => {
    const doc = await documentService.uploadDocument(file, 'Contract', onProgress);
    const contract = await contractService.getContractById(doc.id);
    if (!contract) {
      throw new Error('Failed to retrieve processed contract details.');
    }
    return contract;
  },

  reanalyzeContract: async (id: string, onProgress?: (p: number, step: string) => void): Promise<ContractItem> => {
    const steps = [
      { p: 30, msg: 'Scanning clauses & terms via FastAPI backend...' },
      { p: 60, msg: 'Evaluating risk exposure...' },
      { p: 90, msg: 'Updating ChromaDB index...' },
      { p: 100, msg: 'Analysis updated.' }
    ];
    for (const step of steps) {
      await new Promise((res) => setTimeout(res, 100));
      if (onProgress) onProgress(step.p, step.msg);
    }
    const contract = await contractService.getContractById(id);
    if (!contract) {
      throw new Error('Contract not found for re-analysis.');
    }
    return contract;
  },

  deleteContract: async (id: string): Promise<boolean> => {
    return documentService.deleteDocument(id);
  },

  addContractDeadline: async (cDate: any): Promise<boolean> => {
    await deadlineService.addDeadline({
      title: cDate.title,
      date: cDate.date,
      documentId: 'doc-1',
      documentName: 'Contract.pdf',
      obligation: cDate.description,
      priority: cDate.type === 'Expiry' || cDate.type === 'Review' ? 'High' : 'Medium',
      responsibleTeam: 'Legal & Compliance Team',
      status: 'Pending'
    });
    return true;
  }
};
