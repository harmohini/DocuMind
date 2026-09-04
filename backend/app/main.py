import sys
import logging
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure backend root is on Python sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.routers import health, documents, chat, summaries, analysis

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("documind.main")

app = FastAPI(
    title="DocuMind AI API",
    description="Project 5 Enterprise Document Intelligence Platform FastAPI Backend with RAG & ChromaDB",
    version="1.0.0"
)

# Startup Lifespan / Startup Hook
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing DocuMind AI Backend Services...")
    if settings.is_llm_configured():
        logger.info(f"LLM API Client ACTIVE. Model: '{settings.LLM_MODEL}' | Base URL: '{settings.LLM_BASE_URL}'. API Key: [CONFIGURED - SECURE]")
    else:
        logger.warning(
            f"LLM_API_KEY is unconfigured in backend/.env. "
            f"The system will use grounded local vector heuristics for RAG Q&A, summarization, and analysis until a valid API key is set."
        )

# Configure CORS
origins = [
    settings.FRONTEND_URL,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def handle_options_preflight(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content="OK", status_code=200)
        origin = request.headers.get("origin", "*")
        response.headers["Access-Control-Allow-Origin"] = origin if origin != "*" else "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "X-User-ID, Content-Type, Accept, Authorization, *"
        return response
    return await call_next(request)


# Custom Exception Handlers
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "success" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail)
            }
        }
    )

@app.exception_handler(Exception)
async def custom_general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": f"Server error: {str(exc)}"
            }
        }
    )

# Root Endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "status": "ok",
        "message": "DocuMind AI backend is running",
        "docs": "/docs",
        "health": "/health"
    }

# Register Routers
app.include_router(health.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(summaries.router)
app.include_router(analysis.router)

if __name__ == "__main__":
    import os, uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
