# DocuMind AI — FastAPI Backend Service

Production-ready FastAPI backend for **DocuMind AI Enterprise Document Intelligence Platform**.

## 1. Virtual Environment Setup

Create and activate a Python virtual environment:

```bash
# From workspace root
python3 -m venv .venv

# Activate virtual environment (macOS/Linux)
source .venv/bin/activate
```

---

## 2. Install Requirements

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Required packages:
- `fastapi`: High-performance Web API framework
- `uvicorn`: ASGI server
- `pydantic` & `pydantic-settings`: Type-safe settings & schema validation
- `supabase`: Supabase Python client (Database & Storage)
- `python-multipart`: Multi-part form parser for file uploads
- `python-dotenv`: Environment configuration loader

---

## 3. Configure Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

FRONTEND_URL=http://localhost:5173
```

> **Security Note**: `SUPABASE_SERVICE_ROLE_KEY` is restricted to the backend service. Never expose it to the React/Vite frontend.

---

## 4. How to Start FastAPI Server

Run Uvicorn server:

```bash
# Method 1: Using virtual environment python directly
./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

# Method 2: From backend directory
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

FastAPI server runs on **`http://localhost:8000`**.
Interactive OpenAPI Documentation is available at **`http://localhost:8000/docs`**.

---

## 5. Authentication Architecture & Security

### How Supabase Authentication Works
1. **Frontend Authentication**: User registers or logs in via `@supabase/supabase-js` (`signInWithPassword` / `signUp`) in [`src/services/authService.ts`](file:///Users/apple/Pictures/Desktop/DocuMind/src/services/authService.ts).
2. **Access Token Header Injection**: Every protected API request executed via [`src/services/apiClient.ts`](file:///Users/apple/Pictures/Desktop/DocuMind/src/services/apiClient.ts) retrieves the active session access token via `supabase.auth.getSession()` and attaches the header:
   ```http
   Authorization: Bearer <access_token>
   ```
3. **FastAPI Validation Dependency**: [`backend/app/dependencies.py`](file:///Users/apple/Pictures/Desktop/DocuMind/backend/app/dependencies.py) (`get_current_user`):
   - Reads the `Authorization` header.
   - Extracts the Bearer token.
   - Validates the token using `supabase.auth.get_user(token)`.
   - Extracts the authenticated user's UUID (`user.id`).
   - Rejects missing, invalid, or expired tokens with **HTTP 401 Unauthorized**.
   - No mock user fallbacks (`usr-1` or `mock-jwt-token`) are allowed in production.

### How Document Ownership is Enforced
- **Multi-Tenant Security**: `user_id` is derived strictly from the verified Supabase Auth JWT token inside `get_current_user`. `user_id` values supplied in request bodies from the frontend are strictly ignored.
- **Query Scoping**:
  - `GET /api/v1/documents` queries rows matching `documents.user_id = authenticated_user.id`.
  - `GET /api/v1/documents/{document_id}` verifies `documents.id = document_id AND documents.user_id = authenticated_user.id`.
  - `DELETE /api/v1/documents/{document_id}` verifies ownership before deleting the database row and storage object.
  - `POST /api/v1/documents/upload` uploads files to `{user_id}/{doc_id}_{filename}` in private Storage and sets `user_id = authenticated_user.id`.

---

## 6. How to Test Authentication & Document Endpoints

### A. Test Health Check (Public Endpoint)
```bash
curl -i -X GET http://localhost:8000/health
```

### B. Test Missing Authorization Header (Expected: 401 Unauthorized)
```bash
curl -i -X GET http://localhost:8000/api/v1/documents
```

### C. Test Invalid Bearer Token (Expected: 401 Unauthorized)
```bash
curl -i -X GET http://localhost:8000/api/v1/documents \
  -H "Authorization: Bearer invalid_or_fake_token_123"
```

### D. Test Real Supabase Access Token (Expected: 200 OK)
```bash
curl -i -X GET http://localhost:8000/api/v1/documents \
  -H "Authorization: Bearer <REAL_SUPABASE_ACCESS_TOKEN>"
```

### E. Test Real Document Upload with Auth Header
```bash
curl -i -X POST http://localhost:8000/api/v1/documents/upload \
  -H "Authorization: Bearer <REAL_SUPABASE_ACCESS_TOKEN>" \
  -F "file=@sample_contract.pdf" \
  -F "document_type=Contract"
```
