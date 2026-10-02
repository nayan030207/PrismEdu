import os
import sys

# Ensure api directory and project root are in sys.path
api_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(api_dir)
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)
if parent_dir not in sys.path:
    sys.path.insert(1, parent_dir)

from dotenv import load_dotenv

# Load env variables from root directory
load_dotenv(os.path.join(parent_dir, ".env.local"))
load_dotenv(os.path.join(parent_dir, ".env"))
load_dotenv()

# Normalize Supabase env vars if needed
if not os.environ.get("SUPABASE_URL") and os.environ.get("NEXT_PUBLIC_SUPABASE_URL"):
    os.environ["SUPABASE_URL"] = os.environ["NEXT_PUBLIC_SUPABASE_URL"]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from prediction.model import predictor
from routers.predict import router as predict_router
from routers.ai_chat import router as chat_router

app = FastAPI(
    title="PRISM-EDU Machine Learning & Intelligence Service",
    description="Microservice providing dropout risk predictions, feature aggregation, RAG academic doubt solving, and supportive AI companion.",
    version="1.0.0"
)

# Enable CORS for Next.js web application
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize ML model and warm up predictors"""
    predictor.load("heuristic_v1.0")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "prism-ml-service",
        "model_version": predictor.version,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Include API Routers
app.include_router(predict_router)
app.include_router(chat_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("index:app", host="0.0.0.0", port=port, reload=True)
