import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from './layouts/AppShell';
import { Dashboard } from './pages/Dashboard';
import { DocumentLibrary } from './pages/DocumentLibrary';
import { DocumentDetail } from './pages/DocumentDetail';
import { AIWorkspace } from './pages/AIWorkspace';
import { ContractSummarizer } from './pages/ContractSummarizer';
import { RiskIntelligence } from './pages/RiskIntelligence';
import { ComplianceCenter } from './pages/ComplianceCenter';
import { DocumentChanges } from './pages/DocumentChanges';
import { Deadlines } from './pages/Deadlines';
import { KnowledgeGraph } from './pages/KnowledgeGraph';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Main Application Routes */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="documents" element={<DocumentLibrary />} />
          <Route path="documents/:id" element={<DocumentDetail />} />
          <Route path="ai-workspace" element={<AIWorkspace />} />
          <Route path="contract-summarizer" element={<ContractSummarizer />} />
          <Route path="contract-summarizer/:id" element={<ContractSummarizer />} />
          <Route path="risks" element={<RiskIntelligence />} />
          <Route path="compliance" element={<ComplianceCenter />} />
          <Route path="changes" element={<DocumentChanges />} />
          <Route path="deadlines" element={<Deadlines />} />
          <Route path="knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
