import os
# Ensure HuggingFace and PyTorch use local cached models without hanging on network timeouts
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.api.websocket import websocket_endpoint
from app.database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    yield
    # Close database pool on shutdown
    await close_db()


app = FastAPI(
    title="AURORA API",
    description="AURORA — Multi-Agent Academic Systematic Review Paper Generator",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware allowing frontend development and cloud deployment origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router and WebSocket endpoint
app.include_router(routes.router, prefix="/api")
app.add_websocket_route("/ws/{task_id}", websocket_endpoint)


@app.get("/")
async def root():
    return {"message": "AURORA v1.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
