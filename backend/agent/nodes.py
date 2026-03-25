"""
LangGraph Pipeline Nodes for ATS Resume Optimization Agent
"""

import json
import re
import os
import subprocess
import tempfile
import shutil
import uuid
import httpx
from typing import TypedDict, Optional, Any
from enum import Enum
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from bs4 import BeautifulSoup

from .prompts import (
    JD_PARSE_PROMPT,
    RESUME_PARSE_PROMPT,
    ATS_SCORE_PROMPT,
    GAP_ANALYSIS_PROMPT,
    OPTIMIZE_RESUME_PROMPT,
    LATEX_MODIFY_PROMPT,
    LATEX_FORMAT_PROMPT,
    COLD_EMAIL_PROMPT,
)


# ─── State Schema ────────────────────────────────────────────────────────────

class EmailIntent(str, Enum):
    APPLY   = "APPLY"
    PROSPECT = "PROSPECT"

class RecipientInput(TypedDict):
    email:               str
    recruiter_name:      str
    company_name:        str
    tone:                str
    email_intent:        Optional[EmailIntent]
    job_description:     Optional[str]
    open_to_roles:       Optional[list[str]]
    target_domain:       Optional[str]
    reason_for_company:  Optional[str]

class AgentState(TypedDict):
    resume_text: str
    jd_input: str           # raw text or URL
    latex_content: Optional[str]
    recipients: list[RecipientInput]

    jd_text: str            # resolved JD text
    jd_data: dict
    resume_data: dict
    ats_data: dict
    gap_data: dict
    improved_data: dict
    modified_latex: Optional[str]
    pdf_path: Optional[str]
    
    blocked_recipients: list[dict]
    cold_emails: list[dict]

    current_step: str
    error: Optional[str]


# ─── LLM Helper ──────────────────────────────────────────────────────────────

def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        api_key=os.environ.get("OPENAI_API_KEY"),
    )


def call_llm_json(prompt: str) -> dict:
    """Call LLM and parse JSON response robustly."""
    llm = get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])
    text = response.content.strip()

    # Strip markdown fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON from the text
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse LLM response as JSON: {text[:500]}")


# ─── Node: Resolve JD ────────────────────────────────────────────────────────

def resolve_jd_node(state: AgentState) -> AgentState:
    """If JD input is a URL, fetch the page text. Otherwise use as-is."""
    jd_input = state["jd_input"].strip()
    state["current_step"] = "Fetching Job Description"

    if jd_input.startswith("http://") or jd_input.startswith("https://"):
        try:
            with httpx.Client(timeout=15, follow_redirects=True) as client:
                resp = client.get(jd_input, headers={
                    "User-Agent": "Mozilla/5.0 (compatible; ATS-Agent/1.0)"
                })
                soup = BeautifulSoup(resp.text, "html.parser")
                # Remove scripts/styles
                for tag in soup(["script", "style", "nav", "footer", "header"]):
                    tag.decompose()
                text = soup.get_text(separator="\n")
                # Clean up whitespace
                lines = [l.strip() for l in text.splitlines() if l.strip()]
                state["jd_text"] = "\n".join(lines[:300])  # cap at 300 lines
        except Exception as e:
            state["error"] = f"Failed to fetch JD URL: {e}"
            state["jd_text"] = jd_input
    else:
        state["jd_text"] = jd_input

    return state


# ─── Node: Parse JD ──────────────────────────────────────────────────────────

def parse_jd_node(state: AgentState) -> AgentState:
    state["current_step"] = "Parsing Job Description"
    prompt = JD_PARSE_PROMPT.format(jd_text=state["jd_text"][:4000])
    try:
        state["jd_data"] = call_llm_json(prompt)
    except Exception as e:
        state["error"] = f"JD parsing failed: {e}"
        state["jd_data"] = {"keywords": [], "required_skills": [], "tech_stack": []}
    return state


# ─── Node: Parse Resume ──────────────────────────────────────────────────────

def parse_resume_node(state: AgentState) -> AgentState:
    state["current_step"] = "Parsing Resume"
    prompt = RESUME_PARSE_PROMPT.format(resume_text=state["resume_text"][:5000])
    try:
        state["resume_data"] = call_llm_json(prompt)
    except Exception as e:
        state["error"] = f"Resume parsing failed: {e}"
        state["resume_data"] = {"skills": [], "experience": [], "projects": []}
    return state


# ─── Node: ATS Scoring ───────────────────────────────────────────────────────

def ats_score_node(state: AgentState) -> AgentState:
    state["current_step"] = "Computing ATS Score"
    prompt = ATS_SCORE_PROMPT.format(
        jd_data=json.dumps(state["jd_data"], indent=2),
        resume_data=json.dumps(state["resume_data"], indent=2),
    )
    try:
        state["ats_data"] = call_llm_json(prompt)
    except Exception as e:
        state["error"] = f"ATS scoring failed: {e}"
        state["ats_data"] = {
            "overall_score": 0,
            "keyword_match_percent": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "section_scores": {"skills": 0, "experience": 0, "education": 0, "projects": 0},
            "strengths": [],
            "critical_gaps": [],
        }
    return state


# ─── Node: Gap Analysis ──────────────────────────────────────────────────────

def gap_analysis_node(state: AgentState) -> AgentState:
    state["current_step"] = "Analyzing Gaps"
    prompt = GAP_ANALYSIS_PROMPT.format(
        jd_data=json.dumps(state["jd_data"], indent=2),
        resume_data=json.dumps(state["resume_data"], indent=2),
        ats_data=json.dumps(state["ats_data"], indent=2),
    )
    try:
        state["gap_data"] = call_llm_json(prompt)
    except Exception as e:
        state["error"] = f"Gap analysis failed: {e}"
        state["gap_data"] = {
            "missing_skills": [],
            "weak_bullets": [],
            "missing_sections": [],
            "improvement_priorities": [],
            "overall_recommendation": "Could not generate analysis.",
        }
    return state


# ─── Node: Optimize Resume ───────────────────────────────────────────────────

def optimize_resume_node(state: AgentState) -> AgentState:
    state["current_step"] = "Optimizing Resume Content"
    prompt = OPTIMIZE_RESUME_PROMPT.format(
        jd_data=json.dumps(state["jd_data"], indent=2),
        resume_data=json.dumps(state["resume_data"], indent=2),
        gap_data=json.dumps(state["gap_data"], indent=2),
    )
    try:
        state["improved_data"] = call_llm_json(prompt)
    except Exception as e:
        state["error"] = f"Resume optimization failed: {e}"
        state["improved_data"] = state["resume_data"]
    return state


# ─── Node: Modify LaTeX ──────────────────────────────────────────────────────

def modify_latex_node(state: AgentState) -> AgentState:
    state["current_step"] = "Modifying LaTeX Template"

    if not state.get("latex_content"):
        # Generate a professional LaTeX resume from scratch
        state["modified_latex"] = _generate_latex_from_data(state["improved_data"])
        return state

    llm = get_llm()
    keywords = (
        state["ats_data"].get("missing_keywords", [])[:15]
        + state["jd_data"].get("tech_stack", [])[:10]
    )

    prompt = LATEX_MODIFY_PROMPT.format(
        latex_content=state["latex_content"][:8000],
        improved_content=json.dumps({
            "original_personal_details": {
                "name": state["resume_data"].get("name", ""),
                "contact": state["resume_data"].get("contact", {}),
                "education": state["resume_data"].get("education", []),
                "certifications": state["resume_data"].get("certifications", []),
            },
            "optimized_sections": state["improved_data"]
        }, indent=2),
        keywords=", ".join(keywords),
    )

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        latex_text = response.content.strip()
        # Strip markdown fences
        latex_text = re.sub(r"^```(?:latex|tex)?\s*", "", latex_text)
        latex_text = re.sub(r"\s*```$", "", latex_text)
        state["modified_latex"] = latex_text
    except Exception as e:
        state["error"] = f"LaTeX modification failed: {e}"
        state["modified_latex"] = state["latex_content"]

    return state


# ─── Node: Format LaTeX (One-Page Enforcer) ──────────────────────────────────

def format_latex_node(state: AgentState) -> AgentState:
    """Post-process modified LaTeX to enforce one-page, well-filled resume."""
    state["current_step"] = "Formatting LaTeX (One-Page Enforcer)"

    latex_content = state.get("modified_latex", "")
    if not latex_content:
        return state

    # Quick brace-balance check helper
    def _braces_balanced(tex: str) -> bool:
        depth = 0
        for ch in tex:
            if ch == '{': depth += 1
            elif ch == '}': depth -= 1
            if depth < 0:
                return False
        return depth == 0

    llm = get_llm()
    resume_data = state.get("improved_data", state.get("resume_data", {}))

    prompt = LATEX_FORMAT_PROMPT.format(
        latex_content=latex_content[:9000],
        resume_data=json.dumps(resume_data, indent=2)[:2000],
    )

    try:
        response_json = call_llm_json(prompt)
        formatted = response_json.get("latex", "").strip()

        # Validate it looks like LaTeX
        if r'\documentclass' in formatted and _braces_balanced(formatted):
            state["modified_latex"] = formatted
        else:
            # Keep original if validation fails
            err_str = state.get("error") or ""
            state["error"] = err_str + " [LaTeX formatter produced invalid output — using original]"
    except Exception as e:
        err_str = state.get("error") or ""
        state["error"] = err_str + f" [LaTeX formatting step failed: {e}]"

    return state



def intent_guard_node(state: AgentState) -> AgentState:
    state["current_step"] = "Validating Email Intents"
    validated, blocked = [], []

    recipients = state.get("recipients", [])
    for r in recipients:
        # Auto-detect if intent missing
        if not r.get("email_intent"):
            r["email_intent"] = (
                EmailIntent.APPLY
                if r.get("job_description", "").strip()
                else EmailIntent.PROSPECT
            )

        if r["email_intent"] == EmailIntent.APPLY:
            if not r.get("job_description", "").strip():
                blocked.append({
                    "recipient": r.get("email", "unknown"),
                    "reason": "APPLY intent requires a job description."
                })
                continue

        elif r["email_intent"] == EmailIntent.PROSPECT:
            reason = r.get("reason_for_company", "").strip()
            generic_phrases = [
                "great company", "innovative", "i like their culture",
                "amazing products", "industry leader", "fast growing"
            ]
            too_short = len(reason.split()) < 15
            too_generic = any(p in reason.lower() for p in generic_phrases)

            if not reason or too_short or too_generic:
                blocked.append({
                    "recipient": r.get("email", "unknown"),
                    "reason": (
                        "PROSPECT intent blocked — reason_for_company is "
                        "missing, too short, or too generic. Ask the user: "
                        f"'What specifically about {r.get('company_name', 'company')} caught "
                        "your attention? Mention a product, engineering blog, "
                        "tech decision, or growth signal you genuinely noticed.'"
                    )
                })
                continue

        validated.append(r)

    state["recipients"] = validated
    state["blocked_recipients"] = blocked
    return state


# ─── Node: Generate Cold Email ───────────────────────────────────────────────

def generate_cold_email_node(state: AgentState) -> AgentState:
    state["current_step"] = "Generating Cold Emails"
    llm = get_llm()
    
    resume_data = state.get("improved_data", state.get("resume_data", {}))
    # Build candidate summary
    skills = ", ".join(resume_data.get("skills", [])[:3] if "skills" in resume_data else [])
    achievements = ""
    for exp in resume_data.get("experience", [])[:1]:
        if exp.get("bullets"):
            achievements += exp["bullets"][0]
    
    candidate_summary = f"{skills} | {achievements}"
    candidate_name = resume_data.get("name", "Candidate")
    contact = resume_data.get("contact", {})
    linkedin = contact.get("linkedin", "not provided")
    
    project_urls = []
    projects = resume_data.get("projects", [])
    if isinstance(projects, list):
        for p in projects:
            if p.get("url"): project_urls.append(p["url"])
    portfolio = ", ".join(project_urls) if project_urls else "not provided"

    cold_emails = []
    
    for r in state.get("recipients", []):
        prompt_vars = {
            "EMAIL_INTENT": r.get("email_intent"),
            "CANDIDATE_NAME": candidate_name,
            "CANDIDATE_SUMMARY": candidate_summary,
            "CANDIDATE_LINKEDIN": linkedin,
            "CANDIDATE_PORTFOLIO": portfolio,
            "COMPANY_NAME": r.get("company_name", "Target Company"),
            "RECRUITER_NAME": r.get("recruiter_name", "Hiring Team"),
            "RECRUITER_EMAIL": r.get("email", ""),
            "TONE_PREFERENCE": r.get("tone", "Semi-formal"),
            "JOB_DESCRIPTION": r.get("job_description", "") if r.get("email_intent") == EmailIntent.APPLY else "",
            "OPEN_TO_ROLES": json.dumps(r.get("open_to_roles", [])) if r.get("email_intent") == EmailIntent.PROSPECT else "",
            "TARGET_DOMAIN": r.get("target_domain", "") if r.get("email_intent") == EmailIntent.PROSPECT else "",
            "REASON_FOR_COMPANY": r.get("reason_for_company", "") if r.get("email_intent") == EmailIntent.PROSPECT else "",
        }
        
        # Build raw prompt
        prompt = COLD_EMAIL_PROMPT + "\n\n"
        for k, v in prompt_vars.items():
            prompt += f"{k}: {v}\n"
            
        try:
            response = llm.invoke([HumanMessage(content=prompt)])
            cold_emails.append({
                "recipient": r.get("email", ""),
                "company": r.get("company_name", ""),
                "content": response.content.strip()
            })
        except Exception as e:
            state["error"] = f"Cold email generation failed for {r.get('email')}: {e}"
            
    state["cold_emails"] = cold_emails
    return state


# ─── Node: Compile PDF ───────────────────────────────────────────────────────

def compile_pdf_node(state: AgentState) -> AgentState:
    state["current_step"] = "Generating PDF"

    latex_content = state.get("modified_latex", "")
    if not latex_content:
        return _generate_pdf_from_data(state)

    # Normalize line endings: CRLF → LF (cloud compilers run on Linux)
    latex_content = latex_content.replace("\r\n", "\n").replace("\r", "\n")

    # 1. Try local pdflatex
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tex_path = os.path.join(tmpdir, "resume.tex")
            pdf_path = os.path.join(tmpdir, "resume.pdf")

            with open(tex_path, "w", encoding="utf-8") as f:
                f.write(latex_content)

            try:
                subprocess.run(
                    ["pdflatex", "-interaction=nonstopmode", "-output-directory", tmpdir, tex_path],
                    capture_output=True,
                    text=True,
                    timeout=30,
                )

                if os.path.exists(pdf_path):
                    out_dir = os.path.join(tempfile.gettempdir(), "ats_outputs")
                    os.makedirs(out_dir, exist_ok=True)
                    out_path = os.path.join(out_dir, f"resume_{uuid.uuid4().hex[:8]}.pdf")
                    shutil.copy2(pdf_path, out_path)
                    state["pdf_path"] = out_path
                    return state
            except FileNotFoundError:
                pass 
    except Exception:
        pass

    # 2. Try Cloud Compilation via latex.ytotech.com
    try:
        api_url = "https://latex.ytotech.com/builds/sync"
        payload = {
            "compiler": "pdflatex",
            "resources": [
                {
                    "content": latex_content,
                    "main": True
                }
            ]
        }

        with httpx.Client(timeout=90.0) as client:
            resp = client.post(
                api_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            if resp.status_code == 200:
                out_dir = os.path.join(tempfile.gettempdir(), "ats_outputs")
                os.makedirs(out_dir, exist_ok=True)
                out_path = os.path.join(out_dir, f"resume_{uuid.uuid4().hex[:8]}.pdf")
                with open(out_path, "wb") as f:
                    f.write(resp.content)
                state["pdf_path"] = out_path
                return state
            else:
                print(f"[YtoTech] Non-200 response {resp.status_code}: {resp.text[:300]}")
    except Exception as cloud_err:
        print(f"[YtoTech] Cloud LaTeX compilation failed: {cloud_err}")

    # 3. Fallback to basic reportlab generation
    return _generate_pdf_from_data(state)


def _generate_pdf_from_data(state: AgentState) -> AgentState:
    """Generate PDF from resume data using reportlab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
        from reportlab.lib import colors
        
        # Get resume data
        resume_data = state.get("improved_data", state.get("resume_data", {}))
        
        name = resume_data.get("name", "Resume")
        email = resume_data.get("contact", {}).get("email", "")
        phone = resume_data.get("contact", {}).get("phone", "")
        linkedin = resume_data.get("contact", {}).get("linkedin", "")
        
        # Output location - use system temp directory
        out_dir = os.path.join(tempfile.gettempdir(), "ats_outputs")
        os.makedirs(out_dir, exist_ok=True)
        pdf_path = os.path.join(out_dir, f"resume_{uuid.uuid4().hex[:8]}.pdf")
        
        # Create PDF
        doc = SimpleDocTemplate(pdf_path, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Normal'],
            fontSize=16,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=3,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        contact_style = ParagraphStyle(
            'Contact',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#555555'),
            spaceAfter=6,
            alignment=TA_CENTER
        )
        
        section_style = ParagraphStyle(
            'Section',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=6,
            spaceBefore=6,
            fontName='Helvetica-Bold'
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#333333'),
            spaceAfter=4,
            leading=11
        )
        
        # Add header
        story.append(Paragraph(name, title_style))
        
        contact_info = []
        if email:
            contact_info.append(email)
        if phone:
            contact_info.append(phone)
        if linkedin:
            contact_info.append(linkedin)
        
        if contact_info:
            story.append(Paragraph(" • ".join(contact_info), contact_style))
        
        story.append(Spacer(1, 0.1*inch))
        
        # Add sections
        if resume_data.get("improved_summary"):
            story.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
            story.append(Paragraph(resume_data["improved_summary"], body_style))
            story.append(Spacer(1, 0.08*inch))
        
        if resume_data.get("improved_skills"):
            story.append(Paragraph("SKILLS", section_style))
            skills_text = ", ".join(resume_data["improved_skills"][:20])
            story.append(Paragraph(skills_text, body_style))
            story.append(Spacer(1, 0.08*inch))
        
        if resume_data.get("improved_experience"):
            story.append(Paragraph("EXPERIENCE", section_style))
            for exp in resume_data["improved_experience"][:5]:
                title = exp.get("title", "")
                company = exp.get("company", "")
                duration = exp.get("duration", "")
                exp_header = f"<b>{title}</b> • {company} ({duration})"
                story.append(Paragraph(exp_header, body_style))
                
                for bullet in exp.get("bullets", [])[:3]:
                    story.append(Paragraph(f"• {bullet}", body_style))
                
                story.append(Spacer(1, 0.04*inch))
        
        if resume_data.get("improved_projects"):
            story.append(Paragraph("PROJECTS", section_style))
            for proj in resume_data["improved_projects"][:3]:
                proj_tech = ", ".join(proj.get("tech", []))
                proj_header = f"<b>{proj.get('name', '')}</b> ({proj_tech})"
                story.append(Paragraph(proj_header, body_style))
                story.append(Paragraph(proj.get("description", ""), body_style))
                story.append(Spacer(1, 0.04*inch))
        
        # Build PDF
        doc.build(story)
        state["pdf_path"] = pdf_path
        return state
        
    except Exception as e:
        state["error"] = f"PDF generation failed: {e}"
        state["pdf_path"] = None
        return state


# ─── Helper: Generate LaTeX from Scratch ─────────────────────────────────────

def _generate_latex_from_data(data: dict) -> str:
    name = data.get("name", "Your Name")
    email = data.get("contact", {}).get("email", "email@example.com")
    phone = data.get("contact", {}).get("phone", "")
    linkedin = data.get("contact", {}).get("linkedin", "")
    summary = data.get("improved_summary", data.get("summary", ""))
    skills = data.get("improved_skills", data.get("skills", []))

    experience_blocks = ""
    for exp in data.get("improved_experience", data.get("experience", [])):
        bullets = "\n".join(f"    \\item {b}" for b in exp.get("bullets", []))
        experience_blocks += f"""
  \\resumeSubheading
    {{{exp.get('title', '')}}}{{\\textit{{{exp.get('duration', '')}}}}}
    {{{exp.get('company', '')}}}{{}}
  \\resumeItemListStart
{bullets}
  \\resumeItemListEnd
"""

    project_blocks = ""
    for proj in data.get("improved_projects", data.get("projects", [])):
        tech_str = ", ".join(proj.get("tech", []))
        project_blocks += f"""
  \\resumeProjectHeading
    {{\\textbf{{{proj.get('name', '')}}} $|$ \\emph{{{tech_str}}}}}{{}}
  \\resumeItemListStart
    \\item {proj.get('description', '')}
  \\resumeItemListEnd
"""

    skills_str = " $\\cdot$ ".join(skills[:20])

    return rf"""
\documentclass[letterpaper,11pt]{{article}}

\usepackage{{latexsym}}
\usepackage[empty]{{fullpage}}
\usepackage{{titlesec}}
\usepackage{{marvosym}}
\usepackage[usenames,dvipsnames]{{color}}
\usepackage{{verbatim}}
\usepackage{{enumitem}}
\usepackage[hidelinks]{{hyperref}}
\usepackage{{fancyhdr}}
\usepackage[english]{{babel}}
\usepackage{{tabularx}}

\pagestyle{{fancy}}
\fancyhf{{}}
\fancyfoot{{}}
\renewcommand{{\headrulewidth}}{{0pt}}
\renewcommand{{\footrulewidth}}{{0pt}}

\addtolength{{\oddsidemargin}}{{-0.5in}}
\addtolength{{\evensidemargin}}{{-0.5in}}
\addtolength{{\textwidth}}{{1in}}
\addtolength{{\topmargin}}{{-.5in}}
\addtolength{{\textheight}}{{1.0in}}

\urlstyle{{same}}
\raggedbottom
\raggedright
\setlength{{\tabcolsep}}{{0in}}

\titleformat{{\section}}{{\vspace{{-4pt}}\scshape\raggedright\large}}{{}}{{0em}}{{}}[\color{{black}}\titlerule\vspace{{-5pt}}]

\newcommand{{\resumeItem}}[1]{{\item\small{{#1\vspace{{-2pt}}}}}}
\newcommand{{\resumeSubheading}}[4]{{
  \vspace{{-2pt}}\item
    \begin{{tabular*}}{{0.97\textwidth}}[t]{{l@{{\extracolsep{{\fill}}}}r}}
      \textbf{{#1}} & #2 \\
      \textit{{\small#3}} & \textit{{\small #4}} \\
    \end{{tabular*}}\vspace{{-7pt}}
}}
\newcommand{{\resumeProjectHeading}}[2]{{
    \item
    \begin{{tabular*}}{{0.97\textwidth}}{{l@{{\extracolsep{{\fill}}}}r}}
      \small#1 & #2 \\
    \end{{tabular*}}\vspace{{-7pt}}
}}
\newcommand{{\resumeItemListStart}}{{\begin{{itemize}}}}
\newcommand{{\resumeItemListEnd}}{{\end{{itemize}}\vspace{{-5pt}}}}
\newcommand{{\resumeSubHeadingListStart}}{{\begin{{itemize}}[leftmargin=0.15in, label={{}}]}}
\newcommand{{\resumeSubHeadingListEnd}}{{\end{{itemize}}}}

\begin{{document}}

\begin{{center}}
    \textbf{{\Huge \scshape {name}}} \\ \vspace{{1pt}}
    \small {phone} $|$ \href{{mailto:{email}}}{{{email}}} $|$
    \href{{{linkedin}}}{{{linkedin}}}
\end{{center}}

\section{{Summary}}
{summary}

\section{{Experience}}
\resumeSubHeadingListStart
{experience_blocks}
\resumeSubHeadingListEnd

\section{{Projects}}
\resumeSubHeadingListStart
{project_blocks}
\resumeSubHeadingListEnd

\section{{Technical Skills}}
\begin{{itemize}}[leftmargin=0.15in, label={{}}]
    \small{{\item{{
     \textbf{{Skills}}{{: {skills_str}}}
    }}}}
\end{{itemize}}

\end{{document}}
"""
