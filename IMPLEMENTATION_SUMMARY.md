# ATS Resume Agent — Comprehensive Implementation Summary

## Overview

This document describes the full architecture and feature set of the **ATSMaxAI** Resume Optimization Agent — an 8-stage LangGraph pipeline that takes a raw resume and job description, analyzes ATS compatibility, rewrites the resume, compiles a one-page PDF, and generates highly-personalized cold emails.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INPUT                                    │
│   Resume (PDF/TXT) + Job Description (text or URL)             │
│   + Optional: Cold Email Config                                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  FastAPI Backend (/analyze) │
                    └─────────────┬──────────────┘
                                  │
        ┌─────────────────────────▼──────────────────────────┐
        │              LangGraph Pipeline                     │
        │                                                    │
        │  1. resolve_jd_node      → fetch URL or use text   │
        │  2. parse_jd_node        → extract JD structure    │
        │  3. parse_resume_node    → extract resume data     │
        │  4. ats_score_node       → compute ATS score 0-100 │
        │  5. gap_analysis_node    → identify gaps           │
        │  6. optimize_resume_node → rewrite with LLM        │
        │  7. intent_guard_node    → validate email config   │
        │  8. generate_cold_email_node → craft cold emails   │
        │  9. modify_latex_node    → fill LaTeX template     │
        │  10. format_latex_node   → enforce ONE PAGE ← NEW  │
        │  11. compile_pdf_node    → pdflatex or YtoTech     │
        └─────────────────────────┬──────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   JSON Response to Frontend  │
                    │   PDF served via /outputs/   │
                    └────────────────────────────┘
```

---

## Stage-by-Stage Breakdown

### Stage 1: `resolve_jd_node`
- If JD input is a URL → fetches the page, strips nav/scripts, extracts ~300 lines of clean text
- If plain text → uses as-is

### Stage 2: `parse_jd_node`
- LLM call with `JD_PARSE_PROMPT`
- Extracts: `job_title`, `company`, `required_skills`, `preferred_skills`, `keywords`, `tech_stack`, `experience_level`

### Stage 3: `parse_resume_node`
- LLM call with `RESUME_PARSE_PROMPT`
- Extracts: `name`, `contact` (email, phone, LinkedIn), `skills`, `experience`, `education`, `projects`, `certifications`

### Stage 4: `ats_score_node`
- LLM call with `ATS_SCORE_PROMPT`
- Computes: `overall_score`, `keyword_match_percent`, `matched_keywords`, `missing_keywords`, `section_scores`, `strengths`, `critical_gaps`
- Follows ResumWorded methodology

### Stage 5: `gap_analysis_node`
- LLM call with `GAP_ANALYSIS_PROMPT`
- Identifies: `missing_skills`, `weak_bullets` (with original + suggestion), `missing_sections`, `improvement_priorities`

### Stage 6: `optimize_resume_node`
- LLM call with `OPTIMIZE_RESUME_PROMPT`
- Rewrites resume with stronger verbs, JD keywords, condensed bullets
- **Strict non-hallucination rules**: no invented metrics, no fake jobs
- Outputs: `improved_summary`, `improved_skills`, `improved_experience`, `improved_projects`

### Stage 7: `intent_guard_node`
- Guards cold email generation
- **APPLY intent**: requires a concrete `job_description`
- **PROSPECT intent**: requires a specific `reason_for_company` (≥15 words, not generic)
- Blocks emails that fail these checks and returns reasons

### Stage 8: `generate_cold_email_node`
- LLM call with `COLD_EMAIL_PROMPT` (updated in this release)
- Generates catchy subject lines in 3 variants:
  - **Type A**: `"Ex-intern at Stripe | 2 mins of your time?"` ← credential hook
  - **Type B**: `"Google's infra team — quick question from a 3-yr engineer"` ← curiosity gap
  - **Type C**: `"Kubernetes background — 15 mins, [Name]?"` ← specificity + brevity
- Full email body (80-110 words for APPLY, 70-100 for PROSPECT)
- FOLLOW-UP SEQUENCE included (Day 3, Day 8, Day 14 for APPLY)
- Personalization score, best send time, flags

### Stage 9: `modify_latex_node` ← existing
- Takes the default ATS LaTeX template, fills in the optimized content via LLM
- Preserves all LaTeX commands, structure, and formatting

### Stage 10: `format_latex_node` ← **NEW in this release**
- Post-processes the LaTeX to guarantee one page:
  - Tightens margins (`\addtolength` adjustments)
  - Removes excessive `\vspace` and `\medskip`
  - Compresses itemize spacing
  - Fills sparse sections with authentic content
  - Validates brace balance with a character-level check
  - Falls back to previous LaTeX if LLM output is invalid

### Stage 11: `compile_pdf_node`
- **Try 1**: Local `pdflatex` (fast, requires TeX Live installed)
- **Try 2**: Cloud via `https://latex.ytotech.com/builds/sync` (no local install needed)
- **Try 3**: ReportLab fallback (pure Python PDF from resume data)
- Output saved to `$TEMP/ats_outputs/resume_<id>.pdf` and served at `/download/pdf/<filename>`

---

## Cold Email System Design

### Two Intent Modes

| Mode | When | Required Fields | Goal |
|------|------|----------------|------|
| **APPLY** | Job posting exists | `job_description` | Show you understand the exact role |
| **PROSPECT** | No open role | `reason_for_company` (specific, ≥15 words) | Get on their radar |

### Quality Guards
- Generic `reason_for_company` → **BLOCKED** (system explains why and what to improve)
- APPLY without JD → **BLOCKED**
- Forbidden words list enforced (e.g., "passionate", "perfect fit", "leverage")

### Subject Line Philosophy
The system generates 3 subject line variants per email:
- Under 60 characters
- Hook within first 3 words
- **Never** use "Application for" or "Interested in" patterns
- Ex-credential hook preferred when available

---

## Frontend Architecture

### Components Map

```
App.jsx
├── Navbar.jsx          — Scroll-aware glass bar, GitHub link, BETA badge
├── HeroSection.jsx     — Animated orbs, stats bar, 5 feature badges, fixed font
├── HowItWorks.jsx      — Pipeline step cards
├── InputSection.jsx    — Drag/drop resume, JD input, cold email wizard
├── LoadingPipeline.jsx — Step-by-step loading animation
├── ResultsSection.jsx  — ATS score ring, section bars, keyword chips, gaps
├── OutputSection.jsx   — Subject line card selector (A/B/C), follow-up timeline
└── Footer.jsx          — Tech stack pills, brand section
```

### Key UI Improvements This Release

| Component | What Changed |
|-----------|-------------|
| HeroSection | Fixed broken font size (was 160px-320px → now 3-5.5rem responsive), added stats bar, animated orbs, 5 badges |
| Navbar | Scroll-aware glass blur, GitHub link, BETA badge, cleaner logo |
| OutputSection | Subject line A/B/C cards with BEST badge, follow-up sequence expandable, send time hint, copy button per section |
| Footer | 3-column layout, tech stack pills, brand description |

---

## API Reference

### `POST /analyze`
Accepts `multipart/form-data`:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume_file` | File | Either/Or | PDF or TXT resume |
| `resume_text` | string | Either/Or | Raw resume text |
| `jd_input` | string | ✅ | Job description text or URL |
| `cold_email_config` | JSON string | Optional | Email configuration |

**`cold_email_config` shape:**
```json
{
  "email_intent": "APPLY",
  "email": "recruiter@company.com",
  "recruiter_name": "Sarah",
  "company_name": "Stripe",
  "tone": "Semi-formal",
  "job_description": "...",
  "reason_for_company": "...",
  "open_to_roles": ["Backend Engineer"],
  "target_domain": "Payments infrastructure"
}
```

**Response fields:**
- `ats_score`, `keyword_match_percent`, `matched_keywords`, `missing_keywords`
- `section_scores`, `strengths`, `critical_gaps`
- `gaps` → `missing_skills`, `weak_bullets`, `improvement_priorities`
- `improved_resume_text`, `improvement_notes`
- `modified_latex` — final one-page LaTeX code
- `pdf_download_url` → `/download/pdf/<filename>`
- `latex_download_url` → `/download/latex/<filename>`
- `cold_emails` → `[{ recipient, company, content }]`
- `blocked_recipients` → `[{ recipient, reason }]`

### `GET /download/pdf/{filename}` — Serves PDF
### `GET /download/latex/{filename}` — Serves .tex file
### `GET /health` — Health check

---

## Local Development Guide

### Backend
```bash
cd backend
# Optional: create venv
python -m venv venv && venv\Scripts\activate  # Windows

pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Run
python -m uvicorn main:app --reload --port 8000
```

> **Tip**: PDF compilation works best with TeX Live installed locally. If not installed, the YtoTech cloud API is used automatically as a fallback.

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Docker (Full Stack)
```bash
docker-compose up --build
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ | — | OpenAI key for GPT-4o-mini |
| `PORT` | No | 8000 | Backend port |
| `ALLOWED_ORIGINS` | No | `*` | CORS allowed origins |

---

## LaTeX Template Design

The default template (`agent/default_template.py`) uses:
- `\documentclass[letterpaper,11pt]{article}` 
- `fullpage` package with tight margins
- `titlesec` for section formatting
- Custom `\resumeSubheading`, `\resumeItem`, `\resumeProjectHeading` macros
- ATS-friendly: no tables in experience, standard section names, no columns

The `format_latex_node` then post-processes this to:
1. Verify it fits one page (tighten spacing if needed)
2. Fill any sparse sections
3. Validate brace balance before handing to PDF compiler

---

## Known Limitations & Mitigations

| Limitation | Mitigation |
|-----------|-----------|
| No local pdflatex | Falls back to YtoTech cloud API automatically |
| YtoTech rate limits | Falls back to ReportLab Python PDF |
| LLM may add markdown fences | Regex stripping applied before LaTeX parsing |
| One-page guarantee | `format_latex_node` + LaTeX validation |
| OpenAI API timeouts | 30-second subprocess timeout, 60-second httpx timeout |
