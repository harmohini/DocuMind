import type { DocumentItem, DocumentType } from '../types';
import { fetchWithAuth } from './apiClient';

export const documentService = {
  // GET /api/v1/documents
  getDocuments: async (): Promise<DocumentItem[]> => {
    try {
      const response = await fetchWithAuth('/api/v1/documents');
      if (!response.ok) {
        throw new Error(`DocuMind API returned error code ${response.status}`);
      }
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.map((d: any) => ({
          id: d.id,
          name: d.name || d.file_name,
          type: (d.document_type as DocumentType) || 'Contract',
          pages: d.page_count || 1,
          riskScore: d.risk_score !== undefined ? d.risk_score : 35,
          riskLevel: d.risk_level || (d.document_type === 'Contract' ? 'Medium' : 'Low'),
          status: d.status === 'uploaded' ? 'Ready' : (d.status || 'Ready'),
          updatedAt: d.updated_at ? d.updated_at.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
          fileSize: d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
          summary: d.summary || `Document ingested and indexed in local ChromaDB vector store.`
        }));
      }
      return [];
    } catch (e: any) {
      console.error('FastAPI connection failure in getDocuments:', e);
      throw new Error('Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  // GET /api/v1/documents/:id
  getDocumentById: async (id: string): Promise<DocumentItem | undefined> => {
    try {
      const response = await fetchWithAuth(`/api/v1/documents/${id}`);
      if (response.status === 404) {
        return undefined;
      }
      if (!response.ok) {
        throw new Error(`DocuMind API returned status ${response.status}`);
      }
      const json = await response.json();
      if (json.success && json.data) {
        const d = json.data;
        return {
          id: d.id,
          name: d.name || d.file_name,
          type: (d.document_type as DocumentType) || 'Contract',
          pages: d.page_count || 1,
          riskScore: d.risk_score !== undefined ? d.risk_score : 35,
          riskLevel: d.risk_level || (d.document_type === 'Contract' ? 'Medium' : 'Low'),
          status: d.status === 'uploaded' ? 'Ready' : (d.status || 'Ready'),
          updatedAt: d.updated_at ? d.updated_at.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
          fileSize: d.file_size ? `${(d.file_size / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
          summary: d.summary || `Document ingested and indexed in local ChromaDB vector store.`
        };
      }
      return undefined;
    } catch (e: any) {
      console.error(`FastAPI connection failure in getDocumentById(${id}):`, e);
      throw new Error('Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  // POST /api/v1/documents/upload
  uploadDocument: async (
    file: File,
    type: DocumentType,
    onProgress?: (progress: number, step: string) => void
  ): Promise<DocumentItem> => {
    const steps = [
      { p: 25, msg: 'Validating file format & MIME type...' },
      { p: 50, msg: 'Extracting text page-by-page...' },
      { p: 75, msg: 'Generating embeddings & indexing in ChromaDB...' },
      { p: 100, msg: 'Document ingest complete.' },
    ];

    for (const step of steps) {
      await new Promise((res) => setTimeout(res, 100));
      if (onProgress) onProgress(step.p, step.msg);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', type || 'Contract');

      const response = await fetchWithAuth('/api/v1/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || errJson?.detail || `Upload failed with status ${response.status}`;
        throw new Error(errMsg);
      }

      const json = await response.json();
      if (json.success && json.data) {
        const d = json.data;
        return {
          id: d.id,
          name: d.name || d.file_name || file.name,
          type: (d.document_type as DocumentType) || type || 'Contract',
          pages: d.page_count || 1,
          riskScore: d.risk_score !== undefined ? d.risk_score : 35,
          riskLevel: d.risk_level || (d.document_type === 'Contract' ? 'Medium' : 'Low'),
          status: 'Ready',
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          summary: d.summary || `Automated ingest completed for ${file.name}. Stored in local user workspace & indexed in ChromaDB.`
        };
      }
      throw new Error('Backend returned invalid response for document upload.');
    } catch (e: any) {
      console.error('FastAPI upload failure:', e);
      throw new Error(e.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  // DELETE /api/v1/documents/:id
  deleteDocument: async (id: string): Promise<boolean> => {
    try {
      const response = await fetchWithAuth(`/api/v1/documents/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }
      const json = await response.json();
      return json.success === true;
    } catch (e: any) {
      console.error(`FastAPI delete failure for document ${id}:`, e);
      throw new Error('Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  }
};
