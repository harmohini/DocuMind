import type {
  ChatMessage,
  AgentActivity,
  DocumentChange,
  GraphNode,
  GraphEdge
} from '../types';
import { fetchWithAuth } from './apiClient';
import { documentService } from './documentService';

export const aiService = {
  // POST /api/v1/chat or /api/v1/documents/:id/chat
  sendChatMessage: async (prompt: string, selectedDocId?: string): Promise<ChatMessage> => {
    try {
      const isSpecificDoc = selectedDocId && selectedDocId !== 'all';
      const endpoint = isSpecificDoc
        ? `/api/v1/documents/${selectedDocId}/chat`
        : `/api/v1/chat`;

      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          documentId: isSpecificDoc ? selectedDocId : undefined
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || errJson?.detail || `API error (${response.status})`;
        throw new Error(errMsg);
      }

      const json = await response.json();
      if (json.text) {
        return {
          id: json.id || `msg-${Date.now()}`,
          sender: 'ai',
          text: json.text,
          timestamp: json.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: json.citations || []
        };
      }
      throw new Error('Backend returned empty answer.');
    } catch (e: any) {
      console.error('FastAPI RAG chat error:', e);
      throw new Error(e.message || 'Unable to connect to DocuMind API. Make sure the FastAPI server is running on port 8000.');
    }
  },

  getAgentActivities: async (): Promise<AgentActivity[]> => {
    return [];
  },

  getDocumentChanges: async (): Promise<DocumentChange[]> => {
    return [];
  },

  getKnowledgeGraph: async (): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> => {
    try {
      const docs = await documentService.getDocuments();
      if (docs.length === 0) {
        return { nodes: [], edges: [] };
      }

      const nodes: GraphNode[] = docs.map((doc) => ({
        id: doc.id,
        label: doc.name,
        type: 'Document',
        details: `${doc.type} • ${doc.pages} Pages • Risk Level: ${doc.riskLevel}`
      }));

      const edges: GraphEdge[] = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
          id: `e-${nodes[i].id}-${nodes[i + 1].id}`,
          source: nodes[i].id,
          target: nodes[i + 1].id,
          label: 'Shared Entity'
        });
      }

      return { nodes, edges };
    } catch {
      return { nodes: [], edges: [] };
    }
  }
};
