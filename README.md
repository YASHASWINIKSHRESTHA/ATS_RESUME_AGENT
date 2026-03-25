# ATS-Aware Resume Optimization Agent

An AI-powered full-stack application that analyzes resumes against job descriptions, computes ATS compatibility, identifies gaps, and produces an optimized resume — while **preserving your LaTeX template structure**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React Frontend (Vite + Tailwind + R3F + Framer Motion) │
│   Hero3D · InputSection · ResultsSection · OutputSection │
└────────────────────┬────────────────────────────────────┘
                     │  POST /analyze (multipart/form-data)
┌────────────────────▼────────────────────────────────────┐
│              FastAPI Backend                            │
│                                                         │
│  LangGraph Pipeline:                                    │
│  resolve_jd → parse_jd → parse_resume → ats_score      │
│  → gap_analysis → optimize_resume → modify_latex        │
│  → compile_pdf (pdflatex)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.10+ | |
| Node.js | 18+ | |
| pdflatex | any | Optional; needed for PDF output |
| OpenAI API Key | — | GPT-4o-mini |

---

## Quick Start (Local Dev)

### 1. Clone & set up environment

```bash
git clone <repo-url>
cd ats-agent
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API key
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...

# Install TeX Live (for PDF compilation)
# Ubuntu/Debian:
sudo apt-get install texlive-latex-base texlive-latex-extra texlive-fonts-recommended
# macOS (via Homebrew):
brew install --cask mactex
# Windows: install MiKTeX from https://miktex.org/

# Run backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend available at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend available at: http://localhost:5173

---

## Docker Compose (Recommended for Production)

```bash
# Set your OpenAI key
export OPENAI_API_KEY=sk-...

# Build and run
docker-compose up --build

# Access the app
open http://localhost:5173
```

---

## API Reference

### `POST /analyze`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume_file` | File (PDF/TXT) | One of these | Resume file |
| `resume_text` | string | One of these | Raw resume text |
| `jd_input` | string | ✅ | Job description text or URL |
| `latex_file` | File (.tex) | ❌ | LaTeX template to preserve |

**Response:**

```json
{
  "success": true,
  "ats_score": 72,
  "keyword_match_percent": 65,
  "matched_keywords": ["Python", "FastAPI", "Docker"],
  "missing_keywords": ["Kubernetes", "Terraform", "CI/CD"],
  "section_scores": {
    "skills": 80,
    "experience": 70,
    "education": 90,
    "projects": 65
  },
  "strengths": ["Strong Python background", "Relevant project experience"],
  "critical_gaps": ["Missing cloud platform experience"],
  "gaps": {
    "missing_skills": ["Kubernetes", "Terraform"],
    "weak_bullets": [
      {
        "original": "Worked on backend systems",
        "issue": "Vague, no metrics or impact",
        "suggestion": "Designed and maintained 3 microservices handling 50K req/day using FastAPI and PostgreSQL"
      }
    ],
    "improvement_priorities": [
      {"priority": "high", "area": "Skills section", "action": "Add cloud/DevOps keywords"}
    ],
    "overall_recommendation": "Focus on quantifying impact in bullet points."
  },
  "improved_resume_text": "...",
  "improvement_notes": ["Quantified 3 bullet points", "Added 5 missing keywords"],
  "job_title": "Senior Backend Engineer",
  "company": "Acme Corp",
  "modified_latex": "\\documentclass...",
  "pdf_download_url": "/outputs/resume_abc123.pdf"
}
```

### `GET /health`

Returns `{"status": "ok"}`.

### `POST /save-latex`

| Field | Type | Description |
|-------|------|-------------|
| `latex_content` | string | LaTeX source to save |

Returns `{"download_url": "/download/latex/resume_xyz.tex"}`.

---

## LangGraph Pipeline Deep Dive

```python
# agent/pipeline.py
graph = StateGraph(AgentState)

# 8 nodes, sequential execution:
resolve_jd     → Fetches URL or uses raw text
parse_jd       → Extracts keywords, requirements, tech stack
parse_resume   → Extracts skills, experience, projects
ats_score      → Computes match %, section scores, gaps
gap_analysis   → Identifies weak bullets, missing skills
optimize_resume → Improves content (no hallucination)
modify_latex   → Surgically updates .tex preserving structure
compile_pdf    → Runs pdflatex, serves the PDF
```

Each node receives and returns the full `AgentState` TypedDict, enabling inspection and debugging at every stage.

---

## LaTeX Template Preservation

When you upload a `.tex` file, the agent:

1. **Reads** your existing template structure
2. **Identifies** `\item`, skills lists, summary blocks
3. **Updates only** the text content in those blocks
4. **Preserves** `\usepackage`, `\documentclass`, colors, fonts, geometry

**What is NOT changed:**
- Document class and packages
- Layout, margins, column structure
- Colors, fonts, section formatting
- Custom LaTeX macros

---

## Project Structure

```
ats-agent/
├── backend/
│   ├── main.py              # FastAPI app + routes
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── agent/
│       ├── __init__.py
│       ├── pipeline.py      # LangGraph graph definition
│       ├── nodes.py         # All 8 node functions + AgentState
│       └── prompts.py       # All LLM prompts
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/
│   │   │   └── client.js    # Axios API client
│   │   ├── components/
│   │   │   ├── Hero3D.jsx       # React Three Fiber 3D scene
│   │   │   ├── HeroSection.jsx  # Landing hero
│   │   │   ├── HowItWorks.jsx   # Feature explainer
│   │   │   ├── InputSection.jsx # File uploads + JD input
│   │   │   ├── LoadingPipeline.jsx # Animated pipeline steps
│   │   │   ├── ResultsSection.jsx  # ATS score + analysis
│   │   │   ├── ScoreRing.jsx    # Animated SVG score ring
│   │   │   ├── OutputSection.jsx   # LaTeX viewer + downloads
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ErrorBanner.jsx
│   │   └── styles/
│   │       └── global.css   # Tailwind + custom CSS
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pdflatex not found` | Install TeX Live: `sudo apt-get install texlive-latex-base texlive-latex-extra` |
| `OPENAI_API_KEY not set` | Add to `backend/.env` |
| PDF not generated | Check `pipeline_error` in response; LaTeX compilation logs in backend console |
| 3D scene slow | Reduce particle count in `Hero3D.jsx` (`count={800}`) |
| Upload fails | Check `client_max_body_size` in nginx config (default 20MB) |
| Rate limit errors | The pipeline makes ~6 LLM calls; use GPT-4o-mini to minimize cost |

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `backend/.env` | Required for all LLM calls |
| `VITE_API_URL` | `frontend/.env` | Override API base URL (default: same origin) |

---

## Cost Estimate

Per analysis (GPT-4o-mini):
- ~6 LLM calls × ~2K tokens average = ~12K tokens
- Cost: ~$0.002–0.005 per resume analysis

---

## Extending the Pipeline

To add a new node:

```python
# 1. Add a function in agent/nodes.py
def my_new_node(state: AgentState) -> AgentState:
    state["current_step"] = "My New Step"
    # ... do work
    return state

# 2. Register in agent/pipeline.py
graph.add_node("my_node", my_new_node)
graph.add_edge("optimize_resume", "my_node")
graph.add_edge("my_node", "modify_latex")
```

---

## License

MIT
