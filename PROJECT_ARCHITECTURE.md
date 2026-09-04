# PROJECT_ARCHITECTURE.md
## DocuMind AI — Enterprise Document Intelligence System

This document provides a comprehensive architectural audit of the **DocuMind AI** frontend application, detailing the project structure, routing, UI components, data models, service layer abstractions, mock data usage, and the precise REST API contract expected by the frontend for upcoming FastAPI backend integration.

---

## 1. Technical Stack & Frontend Architecture

| Architecture Layer | Technology / Library | Version / Details |
| :--- | :--- | :--- |
| **Core Framework** | React + TypeScript | React v19, TypeScript v6.0 (Strict Types) |
| **Build Tooling** | Vite | Vite v8.2 |
| **Routing System** | React Router DOM | React Router v7 (Client-Side SPA Routing) |
| **Styling & Design System** | Tailwind CSS + PostCSS | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| **Icons & Charts** | Lucide React + Recharts | Lucide Icons v1.33, Recharts v3.10 |
| **Forms & Validation** | React Hook Form + Zod | React Hook Form v7, Zod v3.25 |
| **Notifications & Toasts** | Sonner | Sonner v2.0 (Custom Warm Palette Toasts) |
| **Code Linting** | Oxlint | Oxlint v1.75 |

### Visual Design System & Palette
- **Canvas Background**: Warm Off-White (`#F8F6F1`)
- **Sidebar & Auxiliary Panels**: Soft Beige (`#F1EDE5`)
- **Cards & Surfaces**: Pure White (`#FFFFFF`)
- **Primary Accent**: Warm Chestnut Gold (`#8B7355`)
- **Dark Accent**: Deep Warm Brown (`#5F4B35`)
- **Typography**: Charcoal (`#242321`) & Muted Grey (`#6F6A62`)
- **Borders & Dividers**: Warm Neutral (`#E4DED4`)
- **Severity Badges**: High Risk (`#9A4F45`), Medium Risk (`#A4773C`), Low Risk / Success (`#58745A`)

---

## 2. Route Directory & Access Control

All routes are defined in [`src/App.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/App.tsx). Authenticated routes are wrapped in [`ProtectedRoute`](file:///Users/apple/Pictures/Desktop/DocuMind/src/components/ProtectedRoute.tsx), which verifies user session via [`authService`](file:///Users/apple/Pictures/Desktop/DocuMind/src/services/authService.ts).

```
DocuMind Application Routing Tree
├── Public / Authentication Routes
│   ├── /login                 -> Login Page (Split screen with SSO & credential login)
│   ├── /signup                -> Registration Page (With password strength meter)
│   └── /forgot-password       -> Password Reset Request Page
├── Protected Enterprise OS Routes (AppShell Layout)
│   ├── / (Redirect)           -> Redirects to /dashboard
│   ├── /dashboard             -> Executive Overview & Intelligence Dashboard
│   ├── /documents             -> Enterprise Document Library (Search, Filter, Actions)
│   ├── /documents/:id         -> Split Document Workspace (PDF Viewer & AI Findings)
│   ├── /ai-workspace          -> Conversational RAG Query Engine with Source Citations
│   ├── /contract-summarizer   -> Contract Upload & Analysis Landing Page
│   ├── /contract-summarizer/:id -> Detailed Structured Contract Summary View
│   ├── /risks                 -> Risk Intelligence Dashboard & Risk Detail Drawer
│   ├── /compliance            -> Compliance Audit Center & Requirement Checklist
│   ├── /changes               -> Version Comparison & Semantic Text Diff Engine
│   ├── /deadlines             -> Obligation Deadlines (List, Calendar, Timeline Views)
│   ├── /knowledge-graph       -> Interactive Entity Knowledge Graph (SVG Canvas)
│   ├── /reports               -> Executive Reports Directory & Download Viewer
│   └── /settings              -> Account, Workspace, Security & Notification Settings
└── 404 Catch-All Route
    └── *                      -> Custom Warm Neutral 404 Not Found Page
```

---

## 3. Directory & File Structure Audit

```
src/
├── App.css
├── App.tsx                    # Main App entry, Router & Route definitions
├── main.tsx                   # Vite DOM mount point
├── index.css                  # Global Tailwind v4 CSS & custom scrollbar styles
├── assets/                    # Static image assets
├── components/                # Reusable global UI components & modals
│   ├── GlobalSearchModal.tsx       # Cmd+K global search popup across docs, risks, deadlines
│   ├── NotificationsDropdown.tsx   # Top header notification drawer
│   ├── ProtectedRoute.tsx          # Session guard wrapper
│   └── UploadDocumentModal.tsx     # Drag-and-drop document upload modal with progress
├── data/                      # Mock data repositories
│   ├── contracts.ts                # Deep mock contract datasets (Clauses, Obligations, Risks)
│   └── mockData.ts                 # Mock documents, findings, risks, compliance, deadlines, reports
├── layouts/                   # Layout wrappers
│   └── AppShell.tsx                # Enterprise layout (Sidebar, Header Search, User Menu)
├── pages/                     # Page view components
│   ├── AIWorkspace.tsx             # RAG Chat interface with context binding
│   ├── ComplianceCenter.tsx        # Compliance audit matrix & score banner
│   ├── ContractSummarizer.tsx      # Contract upload landing & structured summary result view
│   ├── Dashboard.tsx               # Analytics overview, KPI metrics, recent activity
│   ├── Deadlines.tsx               # Milestone tracker with List/Calendar/Timeline tabs
│   ├── DocumentChanges.tsx         # Side-by-side contract version comparison & diffs
│   ├── DocumentDetail.tsx          # PDF viewer pane & AI findings sidebar
│   ├── DocumentLibrary.tsx         # Document inventory with search & category filters
│   ├── ForgotPassword.tsx          # Password recovery view
│   ├── KnowledgeGraph.tsx          # SVG Graph visualization of doc relationships
│   ├── Login.tsx                   # Enterprise login UI
│   ├── NotFound.tsx                # 404 error page
│   ├── Reports.tsx                 # Executive report library & preview modal
│   ├── RiskIntelligence.tsx        # Risk score dashboard & Risk Detail drawer
│   ├── Settings.tsx                # Multi-tab settings (Profile, Security, Workspace, Themes)
│   └── Signup.tsx                  # New workspace creation view
├── services/                  # API Service Abstractions (Mock implementations ready for FastAPI)
│   ├── aiService.ts                # RAG query, diff analysis, agent activity simulation
│   ├── authService.ts              # Login, signup, logout, session persistence
│   ├── complianceService.ts        # Compliance item CRUD & report generation
│   ├── contractService.ts          # Contract ingest, summary, re-analysis, deadline creation
│   ├── deadlineService.ts          # Deadline tracking & status toggles
│   ├── documentService.ts          # Document upload, retrieval, deletion
│   ├── reportService.ts            # Report generation & file download
│   └── riskService.ts              # Risk list & status updates
└── types/                     # TypeScript interface definitions
    └── index.ts                    # Complete domain data models
```

---

## 4. Domain Data Models & Types

Defined in [`src/types/index.ts`](file:///Users/apple/Pictures/Desktop/DocuMind/src/types/index.ts) and [`src/data/contracts.ts`](file:///Users/apple/Pictures/Desktop/DocuMind/src/data/contracts.ts):

| Interface | Key Fields | Description |
| :--- | :--- | :--- |
| `User` | `id`, `name`, `email`, `role`, `organization`, `avatarUrl` | User authentication & profile identity |
| `DocumentItem` | `id`, `name`, `type`, `pages`, `riskScore`, `riskLevel`, `status`, `fileSize`, `summary` | General document metadata |
| `ContractItem` | `id`, `name`, `contractValue`, `duration`, `startDate`, `expiryDate`, `parties`, `summary`, `clauses`, `obligations`, `risks` | Comprehensive contract intelligence structure |
| `ContractClause` | `id`, `name`, `status`, `explanation`, `sourcePage`, `relevantSection`, `snippet` | Extracted legal clause detail |
| `ContractObligation`| `id`, `party`, `obligation`, `frequency`, `deadline`, `status` | Actionable contract obligation item |
| `ContractRisk` | `id`, `severity`, `title`, `explanation`, `sourcePage`, `section`, `recommendation` | Risk item specific to contracts |
| `RiskItem` | `id`, `title`, `severity`, `documentId`, `explanation`, `evidence`, `potentialImpact`, `recommendation`, `status` | Portfolio-wide risk item |
| `KeyFinding` | `id`, `documentId`, `title`, `type`, `severity`, `page`, `section`, `snippet`, `explanation` | Document audit insight |
| `ComplianceItem` | `id`, `requirementName`, `category`, `status`, `affectedDocumentsCount`, `documents`, `notes` | Regulatory compliance audit rule |
| `DocumentChange` | `id`, `originalDocumentId`, `newDocumentId`, `changeType`, `section`, `oldText`, `newText`, `impactLevel`, `aiAnalysis` | Version delta diff record |
| `DeadlineItem` | `id`, `title`, `date`, `documentId`, `obligation`, `priority`, `responsibleTeam`, `status` | Task deadline or opt-out milestone |
| `ReportItem` | `id`, `title`, `type`, `createdAt`, `status`, `fileSize`, `contentSummary` | Generated executive report |
| `ChatMessage` | `id`, `sender`, `text`, `timestamp`, `citations` | RAG Chat message with citations |
| `GraphNode` & `GraphEdge` | `id`, `label`, `type`, `details`, `source`, `target` | Knowledge graph visualization entities |

---

## 5. Existing Service Layer & API Call Assumptions

Currently, all page components consume service singletons located in `src/services/`. These services currently manipulate `localStorage` and `src/data/mockData.ts` / `src/data/contracts.ts` with simulated async network delays (`setTimeout`). 

Every service file includes explicit `// TODO: FastAPI Integration` hooks outlining target HTTP endpoints.

```typescript
// Example: src/services/documentService.ts
export const documentService = {
  // TODO: FastAPI Integration - GET /api/v1/documents
  getDocuments: async (): Promise<DocumentItem[]> => { ... },
  
  // TODO: FastAPI Integration - POST /api/v1/documents/upload
  uploadDocument: async (file: File, type: DocumentType, onProgress?: ...): Promise<DocumentItem> => { ... }
};
```

---

## 6. Audit of UI Modules & Features

### A. Authentication UI
- **Location**: [`src/pages/Login.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/Login.tsx), [`src/pages/Signup.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/Signup.tsx), [`src/pages/ForgotPassword.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/ForgotPassword.tsx)
- **Current State**: Uses [`authService`](file:///Users/apple/Pictures/Desktop/DocuMind/src/services/authService.ts) with `localStorage` token storage (`documind_auth_token`, `documind_user`). Includes email validation, password strength indicator, and SSO mock trigger.
- **Backend Needs**: Real JWT bearer token authentication (`POST /api/v1/auth/login`, `POST /api/v1/auth/signup`).

### B. Document Library & Upload UI
- **Location**: [`src/pages/DocumentLibrary.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/DocumentLibrary.tsx), [`src/components/UploadDocumentModal.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/components/UploadDocumentModal.tsx)
- **Current State**: Filter by document category & risk rating, real-time client-side search, progress-bar file upload simulation, quick summary popup, and document deletion.
- **Backend Needs**: Multipart form file upload handling (`POST /api/v1/documents/upload`), document list indexing (`GET /api/v1/documents`), deletion endpoint (`DELETE /api/v1/documents/{id}`).

### C. Document Detail Workspace
- **Location**: [`src/pages/DocumentDetail.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/DocumentDetail.tsx)
- **Current State**: Split-screen view with a simulated PDF viewer pane (page navigation, zoom, section highlighting) and an AI Insights sidebar with clickable key findings.
- **Backend Needs**: Document detail & text extraction (`GET /api/v1/documents/{id}`), PDF binary stream (`GET /api/v1/documents/{id}/file`).

### D. Contract Summarizer UI
- **Location**: [`src/pages/ContractSummarizer.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/ContractSummarizer.tsx), [`src/data/contracts.ts`](file:///Users/apple/Pictures/Desktop/DocuMind/src/data/contracts.ts)
- **Current State**:
  - Landing state with drag-and-drop contract upload card (PDF/DOCX) and processing step status.
  - Recent contracts grid with instant view and delete actions.
  - Contract Summary result view featuring Overview Cards (Value, Duration, Risk Score, Renewal), Executive Summary, Key Terms, Clause Inspection Modal, Obligations table, Important Dates timeline (with "+ Add to Deadlines" action), Potential Risks, Quick Actions sidebar, and simulated "Re-analyze" progress.
- **Backend Needs**: Contract ingestion & LLM extraction engine (`POST /api/v1/contracts/summarize`), contract list & detail endpoints (`GET /api/v1/contracts`, `GET /api/v1/contracts/{id}`), re-analysis pipeline (`POST /api/v1/contracts/{id}/reanalyze`).

### E. AI Workspace UI (Conversational RAG)
- **Location**: [`src/pages/AIWorkspace.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/AIWorkspace.tsx)
- **Current State**: Interactive chat interface with document context selector (including support for incoming query params `?contractId=...`), action shortcut chips, citation cards with "View in Document" jump links, and conversation history reset.
- **Backend Needs**: Vector search RAG endpoint (`POST /api/v1/chat/query`) returning text response with exact page/section citations.

### F. Risk Intelligence UI
- **Location**: [`src/pages/RiskIntelligence.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/RiskIntelligence.tsx)
- **Current State**: Overall risk gauge (71/100), severity distribution pie chart, exposure reduction trend line chart, filterable risk table, and interactive Risk Detail drawer.
- **Backend Needs**: Portfolio risk aggregation (`GET /api/v1/risks`), risk status mutation (`PATCH /api/v1/risks/{id}/status`).

### G. Compliance Center UI
- **Location**: [`src/pages/ComplianceCenter.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/ComplianceCenter.tsx)
- **Current State**: Overall score banner (82%), requirement checklist matrix with status badges, audit notes modal, and "Generate Compliance Report" trigger.
- **Backend Needs**: Compliance rules checklist API (`GET /api/v1/compliance`), requirement status update (`PATCH /api/v1/compliance/{id}/status`), automated report generation (`POST /api/v1/compliance/report`).

### H. Document Comparison UI
- **Location**: [`src/pages/DocumentChanges.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/DocumentChanges.tsx)
- **Current State**: Baseline vs revised document selector, "Analyze Changes" trigger, side-by-side text diff, impact severity ratings, and legal advice summaries.
- **Backend Needs**: Semantic document diff analysis (`POST /api/v1/documents/compare`).

### I. Deadlines & Obligations UI
- **Location**: [`src/pages/Deadlines.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/Deadlines.tsx)
- **Current State**: List View, Calendar View, and Timeline View; milestone editing drawer, status toggles (Pending/Completed/Overdue), and deadline deletion.
- **Backend Needs**: Deadlines CRUD API (`GET /api/v1/deadlines`, `POST /api/v1/deadlines`, `PATCH /api/v1/deadlines/{id}/status`, `DELETE /api/v1/deadlines/{id}`).

### J. Reports UI
- **Location**: [`src/pages/Reports.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/Reports.tsx)
- **Current State**: Report library cards, report preview modal (Executive summary, key findings, major risks, recommended actions), new report generation, and PDF download trigger.
- **Backend Needs**: Reports list & detail API (`GET /api/v1/reports`, `POST /api/v1/reports/generate`, `GET /api/v1/reports/{id}/pdf`).

### K. Knowledge Graph UI
- **Location**: [`src/pages/KnowledgeGraph.tsx`](file:///Users/apple/Pictures/Desktop/DocuMind/src/pages/KnowledgeGraph.tsx)
- **Current State**: Interactive SVG node-edge canvas connecting documents, vendors, clauses, and risks, complete with zoom controls, pan reset, entity type filtering, and node inspector panel.
- **Backend Needs**: Entity graph adjacency list (`GET /api/v1/graph`).

---

## 7. Environment Variables & Third-Party Code Audit

1. **Environment Variable Files**:
   - Currently, there are **no `.env` files** in the project directory.
   - When connecting the backend, create `.env` with Vite environment variables:
     ```env
     VITE_API_BASE_URL=http://localhost:8000/api/v1
     ```
2. **Supabase Code**:
   - Audited repository: **0 lines of Supabase code** exist in the project. The application is completely clean and decoupled for a custom Python/FastAPI backend.

---

## 8. Expected Backend REST API Specification

Below is the complete list of REST API endpoints expected by the frontend services:

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login` - Authenticate user credentials & return JWT bearer token.
- `POST /api/v1/auth/signup` - Register new user & workspace.
- `POST /api/v1/auth/forgot-password` - Trigger password reset email.
- `GET /api/v1/auth/me` - Fetch authenticated user profile.

### Documents (`/api/v1/documents`)
- `GET /api/v1/documents` - Fetch list of ingested enterprise documents.
- `GET /api/v1/documents/{id}` - Fetch single document details & key findings.
- `POST /api/v1/documents/upload` - Upload PDF/DOCX document (Multipart Form Data).
- `DELETE /api/v1/documents/{id}` - Remove document from repository.

### Contract Summarizer (`/api/v1/contracts`)
- `GET /api/v1/contracts` - Fetch list of analyzed contracts.
- `GET /api/v1/contracts/{id}` - Fetch structured contract summary (Value, Clauses, Obligations, Dates, Risks).
- `POST /api/v1/contracts/summarize` - Ingest contract file & execute structured extraction pipeline.
- `POST /api/v1/contracts/{id}/reanalyze` - Re-run extraction pipeline on an existing contract.
- `DELETE /api/v1/contracts/{id}` - Remove contract from recent contracts list.

### AI RAG & Chat (`/api/v1/chat`)
- `POST /api/v1/chat/query` - Send user question + optional document context ID; returns answer with citations.
- `POST /api/v1/documents/compare` - Compare two document versions and return semantic diffs.

### Risk Intelligence (`/api/v1/risks`)
- `GET /api/v1/risks` - Fetch portfolio risks & severity breakdown.
- `PATCH /api/v1/risks/{id}/status` - Update risk status (`Detected` \| `Under Review` \| `Mitigated` \| `Resolved`).

### Compliance (`/api/v1/compliance`)
- `GET /api/v1/compliance` - Fetch compliance requirements & audit scores.
- `PATCH /api/v1/compliance/{id}/status` - Update requirement status (`Passed` \| `Failed` \| `Needs Review`).
- `POST /api/v1/compliance/report` - Trigger compliance audit report generation.

### Deadlines (`/api/v1/deadlines`)
- `GET /api/v1/deadlines` - Fetch upcoming obligations & milestones.
- `POST /api/v1/deadlines` - Add new deadline item.
- `PATCH /api/v1/deadlines/{id}/status` - Update deadline status (`Pending` \| `Completed` \| `Overdue`).
- `DELETE /api/v1/deadlines/{id}` - Delete deadline.

### Reports (`/api/v1/reports`)
- `GET /api/v1/reports` - Fetch generated executive reports.
- `POST /api/v1/reports/generate` - Generate new executive summary/compliance report.
- `DELETE /api/v1/reports/{id}` - Delete report.

### Knowledge Graph (`/api/v1/graph`)
- `GET /api/v1/graph` - Fetch entity nodes & relationship edges for graph visualization.

---

## 9. Mock Data vs Backend Integration Summary

| Module | Current Data Source | Files Involved | Backend Integration Required |
| :--- | :--- | :--- | :--- |
| **Auth** | `localStorage` | `authService.ts` | JWT auth endpoints & header interceptors |
| **Document Library** | `initialDocuments` | `documentService.ts`, `mockData.ts` | Async PDF upload & database metadata retrieval |
| **Contract Summarizer** | `initialContracts` | `contractService.ts`, `contracts.ts` | LLM structured contract extraction engine |
| **AI Workspace** | Hardcoded Chat Array | `aiService.ts`, `mockData.ts` | RAG pipeline (Embeddings + Vector DB + LLM) |
| **Risk Intelligence** | `initialRisks` | `riskService.ts`, `mockData.ts` | Risk detection engine & database query |
| **Compliance Center** | `initialCompliance` | `complianceService.ts`, `mockData.ts` | Audit policy evaluator & status update API |
| **Document Changes** | `initialChanges` | `aiService.ts`, `mockData.ts` | Semantic text diff & version delta analyzer |
| **Deadlines** | `initialDeadlines` | `deadlineService.ts`, `mockData.ts` | Calendar milestone persistence & notifications |
| **Reports** | `initialReports` | `reportService.ts`, `mockData.ts` | PDF report builder & download stream |
| **Knowledge Graph** | `initialGraphNodes/Edges` | `mockData.ts` | Graph database / entity relationship query |

---

## 10. Next Steps for Backend Development

1. **Setup FastAPI Environment**: Initialize FastAPI project structure (Pydantic schemas, SQLAlchemy/Tortoise ORM models, CORS middleware, JWT authentication middleware).
2. **Create Axios/Fetch API Client**: Add an API client instance in `src/services/apiClient.ts` with `baseURL` configured from `import.meta.env.VITE_API_BASE_URL` and Authorization Bearer header injection.
3. **Implement Core Database Models**:
   - `users`, `documents`, `contracts`, `contract_clauses`, `contract_obligations`, `contract_dates`, `risks`, `compliance_items`, `deadlines`, `reports`.
4. **Build Authentication Endpoints**: `/api/v1/auth/login` and `/api/v1/auth/signup`.
5. **Build Document & Contract File Ingestion Pipeline**:
   - File storage handler (S3/MinIO/Local disk storage).
   - Document parsing (PyPDF2/pdfplumber/Docling) & LLM extraction for Contract Summarizer.
6. **Implement RAG & Vector Search Pipeline**:
   - Text chunking, embedding generation (OpenAI/SentenceTransformers), Vector Store (Qdrant/PGVector/Chroma), and prompt synthesis with citation metadata.
7. **Replace Mock Implementations in `src/services/`**: Swap `setTimeout` mock calls with HTTP requests to FastAPI endpoints.
