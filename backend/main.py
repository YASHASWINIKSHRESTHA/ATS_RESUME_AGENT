"""
ATS-Aware Resume Optimization Agent — FastAPI Backend
"""

import os
import json
import uuid
import asyncio
import tempfile
import subprocess
import shutil
import io
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

import httpx
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import PyPDF2
from dotenv import load_dotenv

load_dotenv()

from agent.pipeline import get_pipeline
from agent.nodes import AgentState
from agent.default_template import get_default_template

# ─── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="ATS Resume Optimization Agent",
    description="AI-powered resume optimization with LangGraph pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated PDFs
import tempfile as _tempfile_module
_temp_dir = _tempfile_module.gettempdir()
OUTPUT_DIR = Path(_temp_dir) / "ats_outputs"
OUTPUT_DIR.mkdir(exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")


# ─── Utilities ───────────────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        reader = PyPDF2.PdfReader(tmp_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    finally:
        os.unlink(tmp_path)


def build_improved_text(improved_data: dict) -> str:
    """Convert improved_data dict to readable text format."""
    lines = []

    if improved_data.get("improved_summary"):
        lines.append("PROFESSIONAL SUMMARY")
        lines.append(improved_data["improved_summary"])
        lines.append("")

    if improved_data.get("improved_skills"):
        lines.append("SKILLS")
        lines.append(", ".join(improved_data["improved_skills"]))
        lines.append("")

    if improved_data.get("improved_experience"):
        lines.append("EXPERIENCE")
        for exp in improved_data["improved_experience"]:
            lines.append(f"{exp.get('title', '')} | {exp.get('company', '')} | {exp.get('duration', '')}")
            for bullet in exp.get("bullets", []):
                lines.append(f"  • {bullet}")
            lines.append("")

    if improved_data.get("improved_projects"):
        lines.append("PROJECTS")
        for proj in improved_data["improved_projects"]:
            tech = ", ".join(proj.get("tech", []))
            lines.append(f"{proj.get('name', '')} | {tech}")
            lines.append(f"  {proj.get('description', '')}")
            lines.append("")

    return "\n".join(lines)


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ATS Resume Optimization Agent"}


@app.post("/analyze")
async def analyze_resume(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    jd_input: str = Form(...),
    cold_email_config: Optional[str] = Form(None),
):
    """
    Main analysis endpoint.

    Inputs:
    - resume_file: PDF or TXT resume upload
    - resume_text: raw resume text (alternative to file)
    - jd_input: job description text or URL

    Returns: comprehensive ATS analysis + optimized resume with downloads
    """

    # ── Resolve resume text ──
    if resume_file:
        content = await resume_file.read()
        filename = resume_file.filename.lower()
        if filename.endswith(".pdf"):
            try:
                resume_text_resolved = extract_text_from_pdf(content)
            except Exception as e:
                raise HTTPException(400, f"Failed to extract text from PDF: {e}")
        elif filename.endswith(".txt") or filename.endswith(".tex"):
            resume_text_resolved = content.decode("utf-8", errors="replace")
        else:
            resume_text_resolved = content.decode("utf-8", errors="replace")
    elif resume_text:
        resume_text_resolved = resume_text
    else:
        raise HTTPException(400, "Either resume_file or resume_text is required.")

    if not resume_text_resolved.strip():
        raise HTTPException(400, "Resume text is empty after extraction.")

    # ── Use default ATS-optimized template ──
    latex_content = get_default_template()

    # ── Run LangGraph pipeline ──
    pipeline = get_pipeline()

    import json
    recipients = []
    if cold_email_config:
        try:
            config = json.loads(cold_email_config)
            recipients.append(config)
        except Exception as e:
            print(f"Error parsing cold_email_config: {e}")

    initial_state: AgentState = {
        "resume_text": resume_text_resolved,
        "jd_input": jd_input,
        "latex_content": latex_content,
        "recipients": recipients,
        "jd_text": "",
        "jd_data": {},
        "resume_data": {},
        "ats_data": {},
        "gap_data": {},
        "improved_data": {},
        "modified_latex": None,
        "pdf_path": None,
        "blocked_recipients": [],
        "cold_emails": [],
        "current_step": "Initializing",
        "error": None,
    }

    try:
        final_state = await asyncio.get_event_loop().run_in_executor(
            None, pipeline.invoke, initial_state
        )
    except Exception as e:
        raise HTTPException(500, f"Pipeline execution failed: {e}")

    # ── Build PDF download URL ──
    pdf_url = None
    if final_state.get("pdf_path") and os.path.exists(final_state["pdf_path"]):
        filename = Path(final_state["pdf_path"]).name
        pdf_url = f"/download/pdf/{filename}"

    # ── Construct response ──
    ats = final_state.get("ats_data", {})
    gaps = final_state.get("gap_data", {})
    improved = final_state.get("improved_data", {})
    resume_data = final_state.get("resume_data", {})
    
    # ── Extract contact info from resume ──
    contact_info = resume_data.get("contact", {})
    resume_name = resume_data.get("name", "")
    
    # ── Build improved text for comparison ──
    improved_text = build_improved_text(final_state.get("improved_data", {}))

    # ── Prepare LaTeX download ──
    latex_filename = f"resume_{uuid.uuid4().hex[:8]}.tex"
    latex_path = OUTPUT_DIR / latex_filename
    if final_state.get("modified_latex"):
        latex_path.write_text(final_state.get("modified_latex"), encoding="utf-8")

    return JSONResponse({
        "success": True,
        "pipeline_error": final_state.get("error"),

        # Extracted Resume Contact Info
        "resume_name": resume_name,
        "resume_email": contact_info.get("email", ""),
        "resume_phone": contact_info.get("phone", ""),
        "resume_linkedin": contact_info.get("linkedin", ""),
        
        "cold_emails": final_state.get("cold_emails", []),
        "blocked_recipients": final_state.get("blocked_recipients", []),

        # ATS Analysis
        "ats_score": ats.get("overall_score", 0),
        "keyword_match_percent": ats.get("keyword_match_percent", 0),
        "matched_keywords": ats.get("matched_keywords", []),
        "missing_keywords": ats.get("missing_keywords", []),
        "section_scores": ats.get("section_scores", {}),
        "strengths": ats.get("strengths", []),
        "critical_gaps": ats.get("critical_gaps", []),

        # Gap Analysis
        "gaps": {
            "missing_skills": gaps.get("missing_skills", []),
            "weak_bullets": gaps.get("weak_bullets", []),
            "missing_sections": gaps.get("missing_sections", []),
            "improvement_priorities": gaps.get("improvement_priorities", []),
            "overall_recommendation": gaps.get("overall_recommendation", ""),
        },

        # Improved Resume
        "improved_resume_text": improved_text,
        "improvement_notes": improved.get("improvement_notes", []),

        # JD Parsed
        "job_title": final_state.get("jd_data", {}).get("job_title", ""),
        "company": final_state.get("jd_data", {}).get("company", ""),

        # Outputs - BOTH PDF and LaTeX downloadable
        "modified_latex": final_state.get("modified_latex", ""),
        "pdf_download_url": pdf_url,
        "latex_download_url": f"/download/latex/{latex_filename}",
    })


@app.get("/download/latex/{filename}")
async def download_latex(filename: str):
    """Serve a LaTeX file for download."""
    path = OUTPUT_DIR / filename
    if not path.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(str(path), media_type="application/x-tex", filename=filename)


@app.get("/download/pdf/{filename}")
async def download_pdf(filename: str):
    """Serve a PDF file for download."""
    path = OUTPUT_DIR / filename
    if not path.exists():
        raise HTTPException(404, "PDF file not found")
    return FileResponse(str(path), media_type="application/pdf", filename=filename)


@app.get("/debug/output-files")
async def debug_output_files():
    """Debug endpoint to check output files."""
    if not OUTPUT_DIR.exists():
        return {"error": "OUTPUT_DIR does not exist", "path": str(OUTPUT_DIR)}
    
    files = []
    try:
        for f in OUTPUT_DIR.iterdir():
            files.append({
                "name": f.name,
                "size": f.stat().st_size if f.is_file() else 0,
                "is_file": f.is_file()
            })
    except Exception as e:
        return {"error": str(e), "path": str(OUTPUT_DIR)}
    
    return {"output_dir": str(OUTPUT_DIR), "files": files}


@app.post("/save-latex")
async def save_latex(latex_content: str = Form(...)):
    """Save a LaTeX string to a temp file and return its download URL."""
    filename = f"resume_{uuid.uuid4().hex[:8]}.tex"
    path = OUTPUT_DIR / filename
    path.write_text(latex_content, encoding="utf-8")
    return {"download_url": f"/download/latex/{filename}"}


@app.post("/compile-pdf")
async def compile_pdf_endpoint(latex_content: str = Form(...)):
    """
    Compile LaTeX → PDF on demand.
    Tries: 1) local pdflatex  2) YtoTech cloud  3) ReportLab fallback
    Returns the PDF bytes as a download stream.
    """
    # Normalize line endings: CRLF → LF (cloud compilers run on Linux)
    latex_content = latex_content.replace("\r\n", "\n").replace("\r", "\n")

    # ── 1. Try local pdflatex ──
    if shutil.which("pdflatex"):
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                tex_path = os.path.join(tmpdir, "resume.tex")
                pdf_path = os.path.join(tmpdir, "resume.pdf")
                with open(tex_path, "w", encoding="utf-8", newline="\n") as f:
                    f.write(latex_content)
                result = subprocess.run(
                    ["pdflatex", "-interaction=nonstopmode", "-output-directory", tmpdir, tex_path],
                    capture_output=True, text=True, timeout=60,
                )
                if os.path.exists(pdf_path):
                    with open(pdf_path, "rb") as f:
                        pdf_bytes = f.read()
                    return StreamingResponse(
                        iter([pdf_bytes]),
                        media_type="application/pdf",
                        headers={"Content-Disposition": 'attachment; filename="resume.pdf"'},
                    )
        except Exception as e:
            print(f"[compile-pdf] Local pdflatex failed: {e}")

    # ── 2. Try YtoTech cloud ──
    try:
        payload = {
            "compiler": "pdflatex",
            "resources": [{"content": latex_content, "main": True}],
        }
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(
                "https://latex.ytotech.com/builds/sync",
                json=payload,
                headers={"Content-Type": "application/json"},
            )
        if resp.status_code == 200:
            pdf_bytes = resp.content
            return StreamingResponse(
                iter([pdf_bytes]),
                media_type="application/pdf",
                headers={"Content-Disposition": 'attachment; filename="resume.pdf"'},
            )
        else:
            print(f"[compile-pdf] YtoTech returned {resp.status_code}: {resp.text[:300]}")
    except Exception as e:
        print(f"[compile-pdf] YtoTech cloud failed: {e}")

    # ── 3. ReportLab fallback (plain text PDF) ──
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Preformatted
        from reportlab.lib import colors
        import io

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        styles = getSampleStyleSheet()
        code_style = ParagraphStyle(
            'Code', parent=styles['Normal'], fontName='Courier', fontSize=7,
            leading=9, textColor=colors.HexColor('#222222')
        )
        # Render the raw LaTeX as a plain document with a note
        note_style = ParagraphStyle(
            'Note', parent=styles['Normal'], fontSize=9, textColor=colors.red,
            spaceAfter=12
        )
        story = [
            Paragraph(
                "⚠ Cloud compilation unavailable – showing raw LaTeX source."
                " Copy this into Overleaf to download the formatted PDF.",
                note_style
            ),
            Preformatted(latex_content, code_style),
        ]
        doc.build(story)
        pdf_bytes = buf.getvalue()
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="resume_latex_source.pdf"'},
        )
    except Exception as e:
        raise HTTPException(500, f"All PDF compilation methods failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
