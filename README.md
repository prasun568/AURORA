# AURORA 🌟

**Autonomous Unified Research Orchestration & Review Architecture**

AURORA is a state-of-the-art, multi-agent academic review paper generator designed to autonomously synthesize exhaustive, verified systematic literature reviews following rigorous PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) standards.

---

## 🚀 Key Features

- **11-Agent Mesh Orchestration**: Uses LangGraph to manage a deterministic state machine coordinating specialized agents:
  1. **Planner Agent**: Breaks down research questions into high-entropy conceptual queries.
  2. **Searcher Agent**: Queries arXiv and Tavily in parallel for preprint and published literature.
  3. **Screener Agent**: Deduplicates DOIs, filters by publication year, and screens abstracts with SBERT cosine similarity (`>0.40`).
  4. **Reader Agent**: Extracts methodology, empirical findings, limitations, and future directions via Gemini 1.5 Flash.
  5. **Analyzer Agent**: Clusters cross-paper themes, highlights research gaps, and maps taxonomic agreements.
  6. **Writer Agent**: Drafts comprehensive 7-section manuscripts embedded with strict citation anchors.
  7. **Polish Agent**: Humanizes cadence, optimizes sentence length variance (burstiness), and strips banned synthetic clichés.
  8. **VeriCite™ Engine**: Cross-checks extracted claims and bibliographic citations against CrossRef metadata and semantic embeddings.
  9. **Quality Control Agent**: Conducts multi-dimensional academic audits across factual consistency, methodology, and tone.
  10. **Mediator Agent**: Reconciles contradicting empirical findings across disparate studies.
  11. **Formatter Agent**: Converts citation tags into standard IEEE/APA numbered brackets and compiles export packages.

- **VeriCite™ Zero-Hallucination Bibliometrics**: Eliminates fabricated citations by validating DOI existence and calculating semantic claim alignment.
- **Stylometric Humanizer**: Enforces burstiness score thresholds (`>0.45`) and purges overused AI clichés (`delve`, `tapestry`, `intricate`, etc.).
- **Multi-Format Publication Export**: Instant generation of Word DOCX, PDF manuscripts, LaTeX packages, and clean BibTeX libraries.
- **Live WebSocket Synchronization**: Real-time progress updates delivered directly to an interactive timeline.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI with asynchronous WebSocket streaming
- **AI & Graph**: LangGraph, LangChain, Groq (Llama 3.3 70B Versatile), Google Gemini 1.5 Flash
- **Embeddings**: SentenceTransformers (`all-MiniLM-L6-v2`)
- **Databases & Memory**: PostgreSQL (with persistent SQLite fallback), Qdrant Vector Store, Neo4j Graph Database, Redis Cache
- **Security**: JWT (python-jose), Bcrypt hashing

### Frontend
- **Core**: React 18, Vite 5, TypeScript
- **Styling**: Tailwind CSS with custom glassmorphic tokens, micro-animations, and responsive layout
- **Icons**: Lucide React
- **Networking**: Axios HTTP client and Native WebSocket streaming

---

## ⚡ Quick Start Instructions

### 1. Configure Environment Variables
Copy and populate API keys in `.env`:
```bash
cp .env.example .env
```
Ensure your `.env` contains valid keys:
- `GROQ_API_KEY`: Groq API access
- `GEMINI_API_KEY`: Google Generative AI access
- `TAVILY_API_KEY`: Tavily search engine API
- `SECRET_KEY`: Random 32+ character JWT secret

### 2. Launch with Docker Compose
Run the entire 6-container stack in detached mode:
```bash
docker-compose up -d
```
Verify all services are healthy:
```bash
docker-compose ps
```

### 3. Access the Application
Open your browser and navigate to:
```text
http://localhost:5173
```
- **Register Account**: Create a user profile (e.g., `test@aurora.com` / `Test1234!`)
- **Dashboard Workspace**: Enter your research topic, choose a review methodology (Systematic, Narrative, Scoping, etc.), select citation styles, and click **🚀 Start Generation**.

---

## 🛡️ Academic Ethics & Responsible AI Disclaimer

> **Important Notice**: AURORA is an academic acceleration tool intended to aid researchers, students, and practitioners in literature discovery, thematic mapping, and synthesis drafting. AI-generated drafts **must not** be submitted as final unedited scholarship. Authors are strictly required to verify all primary literature citations, critically assess findings, and contribute original human scholarly perspectives prior to journal submission.

---

© 2026 AURORA Research Technologies • Academic Excellence Engine
