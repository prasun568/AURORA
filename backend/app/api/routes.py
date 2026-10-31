import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
import bcrypt
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Header, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from app.agents.supervisor import SupervisorAgent
from app.config import settings
from app.database import (
    db_create_review_task,
    db_create_user,
    db_get_review_output,
    db_get_task,
    db_get_user_by_email,
    db_get_user_by_id,
    db_save_feedback,
    db_save_review_output,
    db_update_task_status,
)

logger = logging.getLogger("aurora.api.routes")
router = APIRouter()
security = HTTPBearer(auto_error=False)

# In-memory fast registry for active tasks
task_registry: Dict[str, Dict[str, Any]] = {}


# --- Password & Token Helpers ---

def hash_password(pw: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw.encode("utf-8"), salt).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    """Verify plain password against hashed password."""
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """Extract authenticated user from JWT Bearer token."""
    raw_token = None
    if credentials and credentials.credentials:
        raw_token = credentials.credentials
    elif authorization and authorization.startswith("Bearer "):
        raw_token = authorization.split(" ")[1]

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        payload = jwt.decode(raw_token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub") or payload.get("id") or payload.get("email")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = await db_get_user_by_id(str(user_id))
        if not user:
            user = await db_get_user_by_email(str(user_id))
        if not user:
            return {"id": str(user_id), "email": str(user_id), "name": "Authenticated User"}
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )


# --- Request & Response Models ---

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)


class LoginRequest(BaseModel):
    email: str
    password: str


class ReviewStartRequest(BaseModel):
    topic: str
    review_type: Optional[str] = "systematic"
    citation_style: Optional[str] = "IEEE"
    template: Optional[str] = "IEEE Conference"
    writing_style: Optional[str] = "academic"
    date_start: Optional[Union[int, str]] = None
    date_end: Optional[Union[int, str]] = None
    max_papers: Optional[int] = 20


class FeedbackRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


# --- Background Worker ---

async def _run_supervisor_task(task_id: str, request_data: dict, user_id: Optional[str] = None):
    supervisor = SupervisorAgent()
    try:
        final_state = await supervisor.run(task_id, request_data)
        task_registry[task_id] = {
            "status": "completed",
            "progress": 100,
            "final_state": final_state
        }
        await db_update_task_status(task_id, "completed", completed=True)

        content_md = final_state.get("draft", "")
        polished_md = final_state.get("polished_draft") or content_md
        citations = final_state.get("citations", [])
        bibtex = final_state.get("bibtex", "")
        conf = final_state.get("confidence", 0.9)
        prisma = final_state.get("search_strategy", {}).get("prisma")
        reasoning = final_state.get("reflection_notes", [])

        await db_save_review_output(
            task_id=task_id,
            content_markdown=polished_md,
            content_latex=None,
            bibtex=bibtex,
            citations=citations,
            prisma_diagram=prisma,
            confidence=conf,
            reasoning_path=[{"note": n} for n in reasoning]
        )
    except Exception as e:
        logger.error(f"Supervisor run failed for task {task_id}: {e}", exc_info=True)
        task_registry[task_id] = {
            "status": "failed",
            "progress": 0,
            "error": str(e)
        }
        await db_update_task_status(task_id, "failed")


# --- Auth Endpoints ---

@router.post("/auth/register")
async def register(req: RegisterRequest):
    existing = await db_get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists")

    hashed_pw = hash_password(req.password)
    user_data = await db_create_user(
        name=req.name,
        email=req.email,
        password_hash=hashed_pw
    )
    token = create_access_token({"sub": user_data["id"], "email": user_data["email"]})
    return {
        "user": {
            "id": user_data["id"],
            "name": user_data["name"],
            "email": user_data["email"],
            "preferred_citation_style": user_data.get("preferred_citation_style", "IEEE"),
            "preferred_template": user_data.get("preferred_template", "IEEE Conference")
        },
        "token": token
    }


@router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db_get_user_by_email(req.email)
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"], "email": user["email"]})
    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "preferred_citation_style": user.get("preferred_citation_style", "IEEE"),
            "preferred_template": user.get("preferred_template", "IEEE Conference")
        },
        "token": token
    }


@router.post("/auth/logout")
async def logout():
    return {"success": True}


@router.get("/auth/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "preferred_citation_style": user.get("preferred_citation_style", "IEEE"),
            "preferred_template": user.get("preferred_template", "IEEE Conference")
        }
    }


# --- Review Endpoints ---

@router.post("/review/start")
async def start_review(
    req: ReviewStartRequest,
    background_tasks: BackgroundTasks
):
    task_id = str(uuid.uuid4())
    req_dict = req.model_dump()

    # Insert into review_tasks table
    try:
        await db_create_review_task(
            user_id=None,
            topic=req.topic,
            review_type=req.review_type or "systematic",
            citation_style=req.citation_style or "IEEE",
            template=req.template or "IEEE Conference",
            date_range_start=int(str(req.date_start)[:4]) if req.date_start else None,
            date_range_end=int(str(req.date_end)[:4]) if req.date_end else None,
            max_papers=req.max_papers or 20
        )
    except Exception as e:
        logger.warning(f"Could not insert review task into db: {e}")

    task_registry[task_id] = {
        "status": "started",
        "progress": 0,
        "final_state": None
    }

    # Launch SupervisorAgent in BackgroundTasks
    background_tasks.add_task(_run_supervisor_task, task_id, req_dict)

    return {
        "task_id": task_id,
        "status": "started"
    }


@router.get("/review/status/{task_id}")
async def get_review_status(task_id: str):
    if task_id in task_registry:
        cached = task_registry[task_id]
        return {
            "status": cached.get("status", "pending"),
            "progress": cached.get("progress", 0)
        }

    task = await db_get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Review task not found")

    return {
        "status": task.get("status", "pending")
    }


@router.get("/review/result/{task_id}")
async def get_review_result(task_id: str):
    # Check memory registry first
    if task_id in task_registry and task_registry[task_id].get("final_state"):
        state = task_registry[task_id]["final_state"]
        return {
            "content": state.get("draft", ""),
            "polished_content": state.get("polished_draft") or state.get("draft", ""),
            "citations": state.get("citations", []),
            "confidence": state.get("confidence", 0.9),
            "burstiness": state.get("burstiness", 0.0),
            "banned_words": state.get("banned_words_found", []),
            "bibtex": state.get("bibtex", "")
        }

    # Check database
    output = await db_get_review_output(task_id)
    if not output:
        raise HTTPException(status_code=404, detail="Review output not found for this task")

    return {
        "content": output.get("content_markdown", ""),
        "polished_content": output.get("content_markdown", ""),
        "citations": output.get("citations", []),
        "confidence": output.get("confidence", 0.9),
        "burstiness": 0.5,
        "banned_words": [],
        "bibtex": output.get("bibtex", "")
    }


@router.post("/review/feedback/{task_id}")
async def submit_feedback(task_id: str, req: FeedbackRequest):
    try:
        await db_save_feedback(
            task_id=task_id,
            user_id=None,
            rating=req.rating,
            comment=req.comment
        )
    except Exception as e:
        logger.warning(f"Failed to record feedback in DB ({e})")

    return {"success": True}


# --- Metadata Endpoints ---

@router.get("/templates/list")
async def list_templates():
    return [
        "IEEE Conference",
        "IEEE Journal",
        "APA Journal",
        "ACM Conference",
        "Springer Nature",
        "Elsevier",
        "Harvard Style"
    ]


@router.get("/citation-styles/list")
async def list_citation_styles():
    return [
        "IEEE",
        "APA",
        "MLA",
        "Chicago",
        "Harvard",
        "Vancouver",
        "BibTeX"
    ]
