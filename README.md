# DocuMind AI — Enterprise Document Intelligence System

DocuMind AI is an AI-powered document intelligence platform designed to ingest, process, index, and analyze complex legal, financial, and technical documents (PDF and DOCX). Powered by a FastAPI backend, ChromaDB vector database, and grounded Retrieval-Augmented Generation (RAG), DocuMind AI enables enterprise users to query document repositories, extract key obligations and risks, generate contract summaries, and produce executive briefs.

---

## Overview

Organizations handle thousands of policies, contracts, and reports containing critical business information locked in unstructured formats. DocuMind AI solves this by providing:

- **Interactive RAG Q&A**: Question answering grounded in document context with page and section citations.
- **Contract Summarization**: Extraction of parties, payment terms, key clauses, obligations, and renewal dates.
- **Document Analyst**: Autonomous identification of risk scores, missing clauses, compliance traps, and recommended actions.
- **Executive Summaries**: One-click executive briefs combining document overviews, critical obligations, and major risk profiles.

---

## Features

- **Document Processing**: Ingestion and parsing of PDF and DOCX files.
- **Local Vector Search**: Chunking and embedding stored in ChromaDB vector store.
- **Source-Grounded RAG**: Q&A responses grounded strictly in document text to prevent hallucinations.
- **Page & Section Citations**: Every answer includes exact document and page reference citations.
- **Contract Analysis**: Auto-extraction of contract duration, renewal rules, liability caps, and party information.
- **Risk Intelligence**: Scoring of liability traps, un-capped indemnities, and notification windows.
- **Executive Summaries**: High-level report synthesis for decision-makers.
- **Privacy-First Design**: Server-side LLM key management and anonymous local user session tracking via `X-User-ID`.

---

## Architecture

### Data & RAG Pipeline

```
Document (PDF / DOCX)
  │
  ▼
Text Extraction (PyPDF / python-docx)
  │
  ▼
Recursive Chunking & Tokenization
  │
  ▼
Local Embedding Generation
  │
  ▼
ChromaDB Vector Indexing
  │
  ▼
Vector Similarity Search (k-NN)
  │
  ▼
Retrieved Context + Prompt Template
  │
  ▼
LLM Generation (OpenAI / Compatible API)
  │
  ▼
Grounded Answer + Page Citations
```

### Application Stack Architecture

```
┌─────────────────────────────────────────┐
│     React / TypeScript / Vite UI        │
│          (http://localhost:8080)        │
└────────────────────┬────────────────────┘
                     │ HTTP / REST (X-User-ID)
                     ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend Server          │
│          (http://localhost:8000)        │
└──────┬──────────────┬─────────────┬─────┘
       │              │             │
       ▼              ▼             ▼
  Text Extractor   ChromaDB     LLM API
  (PyPDF/Docx)   Vector Store   (OpenAI)
```

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Sonner
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic
- **AI & RAG**: OpenAI API (GPT Models), ChromaDB Vector Database, Sentence-Transformers / Local Embeddings
- **Document Processing**: `pypdf`, `python-docx`
- **Session Identification**: Anonymous Client UUID (`documind_user_id` / `X-User-ID` header)

---

## Project Structure

```
DocuMind/
├── src/
│   ├── components/         # Reusable UI components (Modals, Search, Dropdowns)
│   ├── config/             # Centralized API base URL configuration
│   ├── data/               # Type definitions & initial empty states
│   ├── layouts/            # Main AppShell layout & responsive sidebar
│   ├── pages/              # Dashboard, Documents, AI Workspace, Summarizers
│   ├── services/           # apiClient, documentService, aiService, contractService
│   ├── types/              # TypeScript interface definitions
│   └── utils/              # User ID generation & storage utilities
├── backend/
│   ├── app/
│   │   ├── routers/        # FastAPI endpoints (health, documents, chat, summaries, analysis)
│   │   ├── services/       # RAG, Document Analyst, Summarizer, ChromaDB Processor
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── config.py       # Pydantic Settings configuration manager
│   │   └── main.py         # FastAPI application entry point & CORS configuration
│   ├── data/               # Local document uploads & ChromaDB vector files (ignored)
│   ├── requirements.txt    # Python backend dependencies
│   └── .env.example        # Environment variable configuration template
├── package.json
├── vite.config.ts
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+) & `npm`
- **Python** (v3.11+)

---

### 1. Backend Setup

Navigate to the `backend/` directory:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Set up environment variables:

```bash
cp .env.example .env
```

Edit `backend/.env` to include your LLM API key:

```env
LLM_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-5.6-luna
LLM_BASE_URL=https://api.openai.com/v1
FRONTEND_URL=http://localhost:8080
CHROMA_PATH=./data/chroma
DOCUMENTS_DIR=./data/documents
```

Start the FastAPI backend server:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Verify backend health:

```bash
curl http://localhost:8000/health
# Output: {"status":"ok","service":"DocuMind API"}
```

---

### 2. Frontend Setup

In a new terminal window, navigate to the project root:

```bash
cd /path/to/DocuMind
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open your browser to `http://localhost:8080`.

---

## Usage Guide

1. **Upload Document**: Click **"Upload Document"** in the sidebar, select a PDF or DOCX file, and click **"Upload & Process"**.
2. **View Library**: Access **Documents** to review uploaded file metadata, size, and page counts.
3. **Ask Questions (RAG)**: Navigate to **AI Workspace** to ask questions grounded in your uploaded documents. Review citations for page and section provenance.
4. **Contract Summarizer**: Use **Contract Summarizer** to view extracted parties, contract term duration, payment terms, and critical clauses.
5. **Document Analyst**: Analyze document risk profiles, obligations, deadlines, and recommended mitigations.
6. **Executive Summary**: Generate high-level executive reports formatted for leadership review.

---

## Security & Privacy

- **Server-Side API Key Management**: LLM API keys are loaded strictly by the FastAPI backend and never exposed to client-side JavaScript.
- **Git Protection**: `.env` configuration files, uploaded document files, and local ChromaDB database files are excluded via `.gitignore`.
- **Anonymous Local Identifiers**: User sessions rely on locally generated UUIDs (`documind_user_id`) without requiring login or sensitive personal identification.

---

## Future Improvements

- Cloud object storage integration (Amazon S3 / Google Cloud Storage)
- Multi-user authentication & Role-Based Access Control (RBAC)
- Multi-document comparative analysis & automated contract diffing
- OCR support for scanned PDF documents via Tesseract
