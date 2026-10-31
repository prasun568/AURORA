import asyncio
import json
import logging
import sqlite3
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
import asyncpg
from app.config import settings

logger = logging.getLogger("aurora.database")

# Global pool for PostgreSQL
pg_pool: Optional[asyncpg.Pool] = None
is_sqlite_fallback: bool = False
SQLITE_DB_PATH = "aurora.db"


async def get_pg_pool() -> Optional[asyncpg.Pool]:
    global pg_pool, is_sqlite_fallback
    if pg_pool is not None:
        return pg_pool
    if is_sqlite_fallback:
        return None

    try:
        pg_pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=1,
            max_size=10,
            command_timeout=10,
            timeout=5.0
        )
        logger.info("Connected successfully to PostgreSQL database.")
        return pg_pool
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL ({e}). Using persistent SQLite fallback database.")
        is_sqlite_fallback = True
        return None


async def get_db() -> Optional[asyncpg.Pool]:
    return await get_pg_pool()


async def close_db():
    global pg_pool
    if pg_pool is not None:
        await pg_pool.close()
        pg_pool = None


def init_sqlite_sync():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        preferred_citation_style TEXT DEFAULT 'IEEE',
        preferred_template TEXT DEFAULT 'IEEE Conference',
        created_at TEXT NOT NULL,
        last_login TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS review_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        topic TEXT NOT NULL,
        review_type TEXT NOT NULL,
        citation_style TEXT NOT NULL,
        template TEXT NOT NULL,
        custom_template_path TEXT,
        ai_format_description TEXT,
        date_range_start INTEGER,
        date_range_end INTEGER,
        max_papers INTEGER,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS review_outputs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        content_markdown TEXT NOT NULL,
        content_docx BLOB,
        content_pdf BLOB,
        content_latex TEXT,
        citations TEXT,
        bibtex TEXT,
        prisma_diagram TEXT,
        confidence REAL DEFAULT 0.92,
        reasoning_path TEXT,
        created_at TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS papers (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        title TEXT NOT NULL,
        authors TEXT,
        year INTEGER,
        doi TEXT,
        abstract TEXT,
        source TEXT,
        relevance_score REAL,
        included INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        user_id TEXT,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()


async def init_db():
    pool = await get_pg_pool()
    if pool:
        async with pool.acquire() as conn:
            await conn.execute("""
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                preferred_citation_style VARCHAR(50) DEFAULT 'IEEE',
                preferred_template VARCHAR(100) DEFAULT 'IEEE Conference',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS review_tasks (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                topic TEXT NOT NULL,
                review_type VARCHAR(50) NOT NULL,
                citation_style VARCHAR(50) NOT NULL,
                template VARCHAR(100) NOT NULL,
                custom_template_path TEXT,
                ai_format_description TEXT,
                date_range_start INT,
                date_range_end INT,
                max_papers INT DEFAULT 50,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS review_outputs (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                task_id UUID REFERENCES review_tasks(id) ON DELETE CASCADE,
                content_markdown TEXT NOT NULL,
                content_docx BYTEA,
                content_pdf BYTEA,
                content_latex TEXT,
                citations JSONB,
                bibtex TEXT,
                prisma_diagram JSONB,
                confidence FLOAT DEFAULT 0.92,
                reasoning_path JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS papers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                task_id UUID REFERENCES review_tasks(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                authors JSONB,
                year INT,
                doi VARCHAR(255),
                abstract TEXT,
                source VARCHAR(100),
                relevance_score FLOAT,
                included BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS feedback (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                task_id UUID REFERENCES review_tasks(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                rating INT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """)
            logger.info("PostgreSQL schema initialized successfully.")
    else:
        init_sqlite_sync()
        logger.info("SQLite schema initialized successfully.")


# Database Helper Operations
async def db_create_user(name: str, email: str, password_hash: str, citation_style: str = "IEEE", template: str = "IEEE Conference") -> Dict[str, Any]:
    pool = await get_pg_pool()
    uid = str(uuid.uuid4())
    now = datetime.utcnow()

    if pool:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO users (id, name, email, password_hash, preferred_citation_style, preferred_template, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, name, email, preferred_citation_style, preferred_template, created_at, last_login
            """, uuid.UUID(uid), name, email, password_hash, citation_style, template, now)
            return dict(row)
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO users (id, name, email, password_hash, preferred_citation_style, preferred_template, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (uid, name, email, password_hash, citation_style, template, now.isoformat()))
            conn.commit()
            conn.close()
            return {
                "id": uid,
                "name": name,
                "email": email,
                "preferred_citation_style": citation_style,
                "preferred_template": template,
                "created_at": now,
                "last_login": None
            }
        return await asyncio.to_thread(_sync)


async def db_get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    pool = await get_pg_pool()
    if pool:
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)
            return dict(row) if row else None
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cur.fetchone()
            conn.close()
            return dict(row) if row else None
        return await asyncio.to_thread(_sync)


async def db_get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    pool = await get_pg_pool()
    if pool:
        async with pool.acquire() as conn:
            try:
                row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", uuid.UUID(user_id))
                return dict(row) if row else None
            except Exception:
                return None
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cur.fetchone()
            conn.close()
            return dict(row) if row else None
        return await asyncio.to_thread(_sync)


async def db_create_review_task(
    user_id: Optional[str],
    topic: str,
    review_type: str,
    citation_style: str,
    template: str,
    custom_template_path: Optional[str] = None,
    ai_format_description: Optional[str] = None,
    date_range_start: Optional[int] = 2018,
    date_range_end: Optional[int] = 2025,
    max_papers: int = 50
) -> str:
    pool = await get_pg_pool()
    task_id = str(uuid.uuid4())
    now = datetime.utcnow()

    if pool:
        u_uuid = uuid.UUID(user_id) if user_id else None
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO review_tasks (id, user_id, topic, review_type, citation_style, template, 
                                          custom_template_path, ai_format_description, date_range_start, 
                                          date_range_end, max_papers, status, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', $12)
            """, uuid.UUID(task_id), u_uuid, topic, review_type, citation_style, template,
                custom_template_path, ai_format_description, date_range_start, date_range_end, max_papers, now)
            return task_id
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO review_tasks (id, user_id, topic, review_type, citation_style, template, 
                                          custom_template_path, ai_format_description, date_range_start, 
                                          date_range_end, max_papers, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
            """, (task_id, user_id, topic, review_type, citation_style, template,
                  custom_template_path, ai_format_description, date_range_start, date_range_end, max_papers, now.isoformat()))
            conn.commit()
            conn.close()
            return task_id
        return await asyncio.to_thread(_sync)


async def db_update_task_status(task_id: str, status: str, completed: bool = False):
    pool = await get_pg_pool()
    now = datetime.utcnow() if completed else None

    if pool:
        async with pool.acquire() as conn:
            if completed:
                await conn.execute("UPDATE review_tasks SET status = $1, completed_at = $2 WHERE id = $3", status, now, uuid.UUID(task_id))
            else:
                await conn.execute("UPDATE review_tasks SET status = $1 WHERE id = $2", status, uuid.UUID(task_id))
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cur = conn.cursor()
            if completed:
                cur.execute("UPDATE review_tasks SET status = ?, completed_at = ? WHERE id = ?", (status, now.isoformat() if now else None, task_id))
            else:
                cur.execute("UPDATE review_tasks SET status = ? WHERE id = ?", (status, task_id))
            conn.commit()
            conn.close()
        await asyncio.to_thread(_sync)


async def db_get_task(task_id: str) -> Optional[Dict[str, Any]]:
    pool = await get_pg_pool()
    if pool:
        async with pool.acquire() as conn:
            try:
                row = await conn.fetchrow("SELECT * FROM review_tasks WHERE id = $1", uuid.UUID(task_id))
                return dict(row) if row else None
            except Exception:
                return None
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM review_tasks WHERE id = ?", (task_id,))
            row = cur.fetchone()
            conn.close()
            return dict(row) if row else None
        return await asyncio.to_thread(_sync)


async def db_list_recent_tasks(user_id: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    pool = await get_pg_pool()
    if pool:
        async with pool.acquire() as conn:
            if user_id:
                rows = await conn.fetch(
                    "SELECT * FROM review_tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
                    uuid.UUID(user_id), limit
                )
            else:
                rows = await conn.fetch("SELECT * FROM review_tasks ORDER BY created_at DESC LIMIT $1", limit)
            return [dict(r) for r in rows]
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            if user_id:
                cur.execute("SELECT * FROM review_tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit))
            else:
                cur.execute("SELECT * FROM review_tasks ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cur.fetchall()
            conn.close()
            return [dict(r) for r in rows]
        return await asyncio.to_thread(_sync)


async def db_save_review_output(
    task_id: str,
    content_markdown: str,
    content_latex: Optional[str],
    bibtex: Optional[str],
    citations: List[Dict[str, Any]],
    prisma_diagram: Optional[Dict[str, Any]],
    confidence: float,
    reasoning_path: List[Dict[str, Any]]
) -> str:
    pool = await get_pg_pool()
    output_id = str(uuid.uuid4())
    now = datetime.utcnow()

    if pool:
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO review_outputs (id, task_id, content_markdown, content_latex, citations, 
                                            bibtex, prisma_diagram, confidence, reasoning_path, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """, uuid.UUID(output_id), uuid.UUID(task_id), content_markdown, content_latex,
                json.dumps(citations), bibtex, json.dumps(prisma_diagram) if prisma_diagram else None,
                confidence, json.dumps(reasoning_path), now)
            return output_id
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO review_outputs (id, task_id, content_markdown, content_latex, citations, 
                                            bibtex, prisma_diagram, confidence, reasoning_path, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (output_id, task_id, content_markdown, content_latex,
                  json.dumps(citations), bibtex, json.dumps(prisma_diagram) if prisma_diagram else None,
                  confidence, json.dumps(reasoning_path), now.isoformat()))
            conn.commit()
            conn.close()
            return output_id
        return await asyncio.to_thread(_sync)


async def db_get_review_output(task_id: str) -> Optional[Dict[str, Any]]:
    pool = await get_pg_pool()
    if pool:
        async with pool.acquire() as conn:
            try:
                row = await conn.fetchrow("SELECT * FROM review_outputs WHERE task_id = $1 ORDER BY created_at DESC LIMIT 1", uuid.UUID(task_id))
                if not row:
                    return None
                data = dict(row)
                if isinstance(data.get("citations"), str):
                    data["citations"] = json.loads(data["citations"])
                if isinstance(data.get("reasoning_path"), str):
                    data["reasoning_path"] = json.loads(data["reasoning_path"])
                if isinstance(data.get("prisma_diagram"), str):
                    data["prisma_diagram"] = json.loads(data["prisma_diagram"])
                return data
            except Exception:
                return None
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM review_outputs WHERE task_id = ? ORDER BY created_at DESC LIMIT 1", (task_id,))
            row = cur.fetchone()
            conn.close()
            if not row:
                return None
            data = dict(row)
            if data.get("citations"):
                data["citations"] = json.loads(data["citations"])
            if data.get("reasoning_path"):
                data["reasoning_path"] = json.loads(data["reasoning_path"])
            if data.get("prisma_diagram"):
                data["prisma_diagram"] = json.loads(data["prisma_diagram"])
            return data
        return await asyncio.to_thread(_sync)


async def db_save_feedback(task_id: str, user_id: Optional[str], rating: int, comment: Optional[str]) -> str:
    pool = await get_pg_pool()
    fid = str(uuid.uuid4())
    now = datetime.utcnow()

    if pool:
        u_uuid = uuid.UUID(user_id) if user_id else None
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO feedback (id, task_id, user_id, rating, comment, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, uuid.UUID(fid), uuid.UUID(task_id), u_uuid, rating, comment, now)
            return fid
    else:
        def _sync():
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO feedback (id, task_id, user_id, rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (fid, task_id, user_id, rating, comment, now.isoformat()))
            conn.commit()
            conn.close()
            return fid
        return await asyncio.to_thread(_sync)
