export type DocumentType = 'Contract' | 'Policy' | 'Financial Report' | 'HR Document' | 'Compliance' | 'Technical' | 'Security';

export type RiskLevel = 'High' | 'Medium' | 'Low';

export type DocumentStatus = 'Analyzed' | 'Processing' | 'Needs Review' | 'Draft' | 'Ready' | 'Uploading' | 'Failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarUrl?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  pages: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: DocumentStatus;
  updatedAt: string;
  fileSize: string;
  summary?: string;
  content?: string;
}

export interface KeyFinding {
  id: string;
  documentId: string;
  title: string;
  type: 'Risk' | 'Obligation' | 'Clause' | 'Date';
  severity?: RiskLevel;
  page: number;
  section: string;
  snippet: string;
  explanation: string;
  recommendation?: string;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: RiskLevel;
  documentId: string;
  documentName: string;
  explanation: string;
  evidence: string;
  page: number;
  section: string;
  potentialImpact: string;
  recommendation: string;
  status: 'Detected' | 'Under Review' | 'Mitigated' | 'Resolved';
  detectedAt: string;
}

export interface ComplianceItem {
  id: string;
  requirementName: string;
  category: string;
  status: 'Passed' | 'Failed' | 'Needs Review';
  affectedDocumentsCount: number;
  documents: string[];
  lastAudited: string;
  notes: string;
}

export interface DocumentChange {
  id: string;
  originalDocumentId: string;
  originalDocumentName: string;
  newDocumentId: string;
  newDocumentName: string;
  changeType: 'Addition' | 'Deletion' | 'Modification' | 'Cap Removal';
  section: string;
  oldText: string;
  newText: string;
  impactLevel: RiskLevel;
  aiAnalysis: string;
  recommendation: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  documentId: string;
  documentName: string;
  obligation: string;
  priority: 'High' | 'Medium' | 'Low';
  responsibleTeam: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Document' | 'Organization' | 'Contract' | 'Clause' | 'Risk' | 'Deadline' | 'Person';
  details: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'Executive Summary' | 'Risk Assessment' | 'Compliance Audit' | 'Document Delta';
  createdAt: string;
  status: 'Generated' | 'Scheduled' | 'Archived';
  fileSize: string;
  downloadUrl?: string;
  contentSummary?: {
    executiveSummary: string;
    keyFindings: string[];
    majorRisks: string[];
    complianceStatus: string;
    deadlinesCount: number;
    recommendedActions: string[];
  };
}

export interface AgentActivity {
  id: string;
  agentName: 'Supervisor Agent' | 'Document Analyst' | 'Retrieval Agent' | 'Risk Agent' | 'Compliance Agent' | 'Summary Agent' | 'Comparison Agent';
  role: string;
  status: 'Completed' | 'Running' | 'Waiting' | 'Failed';
  purpose: string;
  lastExecution: string;
  executionTimeMs: number;
  recentTask: string;
  inputSnippet: string;
  outputSnippet: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'risk' | 'deadline' | 'compliance' | 'system';
  targetUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: {
    documentId: string;
    documentName: string;
    page: number;
    section: string;
    snippet: string;
  }[];
}

export interface ContractClause {
  id?: string;
  name?: string;
  title?: string;
  status?: string;
  explanation?: string;
  description?: string;
  text?: string;
  sourcePage?: number;
  page?: number;
  relevantSection?: string;
  section?: string;
  snippet?: string;
  type?: string;
}

export interface ContractObligation {
  id?: string;
  party?: string;
  obligation?: string;
  description?: string;
  frequency?: string;
  deadline?: string;
  status?: string;
}

export interface ContractDate {
  id?: string;
  title?: string;
  date?: string;
  type?: string;
  description?: string;
}

export interface ContractRisk {
  id?: string;
  severity?: RiskLevel | string;
  title?: string;
  name?: string;
  explanation?: string;
  description?: string;
  sourcePage?: number;
  page?: number;
  section?: string;
  recommendation?: string;
}

export interface ContractItem {
  id: string;
  name: string;
  type: string;
  pages: number;
  analyzedAt: string;
  contractValue: string;
  duration: string;
  startDate: string;
  expiryDate: string;
  renewalType: string;
  riskScore: number;
  parties: {
    organization: string;
    vendor: string;
  };
  paymentTerms: string;
  terminationNotice: string;
  governingLaw: string;
  summary: string;
  clauses: ContractClause[];
  obligations: ContractObligation[];
  importantDates: ContractDate[];
  risks: ContractRisk[];
}

