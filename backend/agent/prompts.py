JD_PARSE_PROMPT = """You are an expert job description analyst.

Extract structured information from the following job description.

Job Description:
{jd_text}

Return a JSON object with EXACTLY this structure:
{{
  "job_title": "string",
  "company": "string or null",
  "required_skills": ["skill1", "skill2", ...],
  "preferred_skills": ["skill1", ...],
  "responsibilities": ["resp1", ...],
  "qualifications": ["qual1", ...],
  "keywords": ["kw1", "kw2", ...],
  "experience_level": "junior|mid|senior|lead",
  "tech_stack": ["tech1", ...]
}}

Return ONLY valid JSON. No markdown, no explanation."""


RESUME_PARSE_PROMPT = """You are an expert resume analyst.

Extract structured information from this resume text.

Resume:
{resume_text}

Return a JSON object with EXACTLY this structure:
{{
  "name": "string",
  "contact": {{
    "email": "string", 
    "phone": "string", 
    "linkedin": "string or null", 
    "github": "string or null", 
    "portfolio_or_other_links": ["url1", "url2"]
  }},
  "summary": "string or null",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {{
      "title": "string",
      "company": "string",
      "duration": "string",
      "bullets": ["bullet1", ...]
    }}
  ],
  "education": [
    {{"degree": "string", "institution": "string", "year": "string"}}
  ],
  "projects": [
    {{"name": "string", "description": "string", "tech": ["tech1", ...]}}
  ],
  "certifications": ["cert1", ...]
}}

Return ONLY valid JSON. No markdown, no explanation."""


ATS_SCORE_PROMPT = """You are an ATS (Applicant Tracking System) expert familiar with ResumWorded and all major ATS platforms.

Your task: Analyze resume-JD compatibility for ATS parsing and ResumWorded scoring, based on WHAT'S ACTUALLY PRESENT in both documents.

ResumWorded & ATS Best Practices to verify:
- Keywords from JD that ARE in the resume (exact or synonymous match)
- Keywords from JD that are MISSING in the resume
- Proper section formatting (Education, Experience, Skills clearly labeled)
- Existing quantifiable achievements and metrics mentioned
- Technical terminology used correctly
- Consistent date formatting (Month YYYY or Month Year)
- Contact info complete (email, phone visible)
- No unusual formatting that breaks parsing
- Standard section headers recognized by ATS
- Bullet points are clear and parseable

Job Data:
{jd_data}

Resume Data:
{resume_data}

Return a JSON object with EXACTLY this structure:
{{
  "overall_score": <integer 0-100 based on keyword match and structure>,
  "keyword_match_percent": <integer 0-100 percentage of JD keywords found in resume>,
  "matched_keywords": ["keyword1", "keyword2", ...] (actual keywords that ARE in resume),
  "missing_keywords": ["keyword1", "keyword2", ...] (JD keywords NOT in resume),
  "section_scores": {{
    "skills": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "projects": <0-100>,
    "formatting_ats_compliance": <0-100>
  }},
  "strengths": ["what resume does well", "strong formatting", ...],
  "critical_gaps": ["missing keyword area", "weak bullet points", ...],
  "ats_issues": ["issue: specific explanation", ...]
}}

Only report what you actually find. Be realistic with scoring.
Return ONLY valid JSON. No markdown, no explanation."""


GAP_ANALYSIS_PROMPT = """You are a professional resume analyst and ATS expert.

CRITICAL RULE: Analyze ONLY what's actually in the resume and JD. Do NOT fabricate or invent information.

Your task: Identify gaps between this resume and job description. Focus on:
- Keywords from JD that are missing in resume
- Bullet points that lack quantifiable metrics or impact statements
- Weak action verbs that could be strengthened (e.g., "responsible for" → "Implemented")
- Skills listed in JD but not mentioned in resume
- Missing sections mentioned in JD (e.g., certifications if JD emphasizes them)
- Formatting/parsing issues that hurt ATS compatibility
- Vague experience descriptions that could be more specific
- Date formatting inconsistencies

Job Description Data:
{jd_data}

Resume Data:
{resume_data}

ATS Score Data:
{ats_data}

IMPORTANT: 
- Only suggest improvements that preserve the ORIGINAL content
- Do NOT add fake achievements or exaggerated claims
- Do NOT invent metrics that weren't in the original
- Focus on rephrasing and highlighting what's ALREADY there

Return a JSON object with EXACTLY this structure:
{{
  "missing_skills": ["skill from JD that's missing in resume", ...],
  "weak_bullets": [
    {{
      "original": "exact original text from resume",
      "issue": "specific reason it's weak (generic verb, no impact, vague timeframe)",
      "suggestion": "better phrasing WITHOUT fabricating - just strengthen language and clarity"
    }}
  ],
  "missing_sections": ["section from JD that resume lacks", ...],
  "improvement_priorities": [
    {{"priority": "critical|high|medium", "area": "specific area", "action": "concrete improvement that preserves authenticity"}}
  ],
  "overall_recommendation": "1-2 sentences on biggest impact improvements (be realistic)"
}}

Return ONLY valid JSON. No markdown, no explanation."""


OPTIMIZE_RESUME_PROMPT = """You are an elite, high-end resume optimizer designed to maximize scores on algorithmic ATS platforms like ResumeWorded.

Your job is to transform the candidate's existing resume into a top-tier industry resume that explicitly appeals to both algorithms and recruiters. 

ALGORITHMIC SCORING RULES (CRITICAL):
1. ELITE ACTION VERBS: EVERY SINGLE bullet point MUST start with a strong, active verb (e.g., Spearheaded, Architected, Engineered, Orchestrated, Conceptualized). Do NOT use weak verbs like "Helped", "Responsible for", or "Worked on".
2. METRICS & QUANTIFICATION: ATS algorithms scan for numbers (e.g., "20%", "10x", "$50k", "100+"). You MUST inject scale and quantifiable metrics into at least 70% of the bullet points. 
   - If you can safely extrapolate scale from the context, do so (e.g., if they built a web app, it's safe to say "improving performance for 500+ users"). 
   - If you cannot safely extrapolate, insert bracketed placeholders like "[X]% improvement", "[Number]ms latency reduction", or "serving [N]+ customers" so the user knows exactly where to add impact metrics.
3. KEYWORD INTEGRATION: Aggressively (but naturally) weave in the "missing skills" identified in the Gap Analysis into the bullet points and skills section.
4. BREVITY & IMPACT: Remove all fluff ("in order to", "successfully", "had the opportunity to"). Follow the format: [Action Verb] + [Task/Project] + [Specific Tech/Tools] + [Quantifiable Result].
5. MAXIMUM A4 PAGE DENSITY: A top-tier resume must have absolutely NO EMPTY SPACE on a standard A4 page. You MUST maximize the length and detail of every single bullet point. 
   - Generate 4–6 highly detailed, dense bullet points per experience role. 
   - If the candidate's original resume is sparse, use your deep industry knowledge to logically and professionally expand on their stated responsibilities to fully flesh out the resume. Detail the "how" and "why" behind their work extensively.

You may completely rewrite and restructure the bullet points to fit these elite rules, as long as the underlying domain of work remains accurate to the candidate.

Job Description (For context and sorting existing skills only):
{jd_data}

Original Resume Data (THIS IS YOUR ONLY SOURCE OF TRUTH):
{resume_data}

Gap Analysis:
{gap_data}

Return a JSON object with EXACTLY this structure:
{{
  "improved_summary": "2-3 sentences rephrasing the ACTUAL original summary.",
  "improved_skills": ["existing skill 1", "existing skill 2", ...] (reordered by relevance, NO NEW SKILLS),
  "improved_experience": [
    {{
      "title": "exact original title",
      "company": "exact original company",
      "duration": "exact original duration",
      "bullets": ["Strictly rephrased original bullet 1", "Strictly rephrased original bullet 2", ...]
    }}
  ],
  "improved_projects": [
    {{"name": "exact project name", "description": "strictly rephrased version of original", "tech": ["exact tech1", ...]}}
  ],
  "improvement_notes": [
    "List only grammatical or verb-strength improvements you made."
  ]
}}

Return ONLY valid JSON. No markdown, no explanation."""


LATEX_MODIFY_PROMPT = """You are a LaTeX expert, resume specialist, and ATS compatibility strategist.

Your task: Intelligently update the provided ATS-optimized LaTeX resume template with improved content while maintaining ATS parseability.

CRITICAL RULES FOR ATS+LaTeX:
1. PRESERVE ALL LaTeX commands, packages, formatting, and structure exactly
2. PRESERVE the document class and all usepackage declarations
3. ONLY replace TEXT CONTENT in these areas:
   - Name and contact info (CRITICAL: you MUST explicitly insert any GitHub, Portfolio, LeetCode, or other links found in the contact data into the header using \href{} commands. Create new \href{} blocks if the template lacks them.)
   - Section content (Summary, Skills, Experience, Projects, Education)
   - Bullet point text
   - Skill lists
4. DO NOT add or remove LaTeX sections, breaks, or structure
5. DO NOT modify spacing commands (\\\\vspace, \\\\hspace)
6. DO NOT change colors, fonts, or \\\\ documentclass settings
7. DO NOT break any LaTeX syntax - always balance braces and brackets
8. ENSURE section headers remain standard: Education, Experience, Skills, Projects
9. INCORPORATE keywords naturally but maintain professional tone
10. USE proper date formatting within the LaTeX structure

Original ATS-Optimized LaTeX:
{latex_content}

Improved Resume Content to integrate:
{improved_content}

Important Keywords to naturally work into bullets:
{keywords}

CRITICAL: Return ONLY the complete, compilable Modified LaTeX source code. No explanation, no markdown, no code blocks. Just the valid .tex code."""


LATEX_FORMAT_PROMPT = """You are a senior resume systems engineer and LaTeX optimization agent.

CONTEXT:
You are part of an AI pipeline that generates ATS-optimized resumes.
You are given:
1) Structured optimized resume content (already improved, ATS-aligned)
2) A fixed LaTeX template (DO NOT change structure, commands, or styling philosophy)

REFERENCE STYLE:
The LaTeX must strictly follow a dense, one-page, impact-driven resume format similar to top-tier SWE resumes:
- Compact vertical spacing
- Bullet-heavy experience
- Strong action verbs + measurable impact
- No visual emptiness

CRITICAL GOAL:
Transform the input into a FINAL LaTeX resume that:
- Fits EXACTLY on ONE PAGE
- Looks FULL (no empty areas)
- Is COMPILE-SAFE
- Matches the provided template style STRICTLY

---

### HARD CONSTRAINTS (NON-NEGOTIABLE)

1. ONE PAGE ONLY
- Must not overflow to page 2
- Must not leave large blank space
- If overflow → COMPRESS spacing

2. DENSITY FIRST (ELIMINATE WHITE SPACE)
- The resume MUST look completely full and visually dense. 
- If the resume falls short of the page bottom:
  - DO NOT compress bullets.
  - INCREASE vertical spacing (\vspace) slightly between logical sections.
  - Expand on the descriptions to ensure every line is fully utilized.
- If the resume overflows to Page 2:
  - COMPRESS vertical spacing (\vspace{{-5pt}}).
  - Re-word bullet points to fit on fewer lines without losing metrics.

3. HIGH-DENSITY BULLETS
Every experience/project MUST have:
- 2–4 strong bullet points
- Each bullet:
  - Starts with action verb
  - Includes tech + outcome
  - Feels like “impact”, not description

4. TEMPLATE LOCK (VERY IMPORTANT)
- You MUST reuse EXACT commands from template:
  - \\resumeSubheading
  - \\resumeProjectHeading
  - \\resumeItem
  - \\resumeItemListStart / End
- DO NOT invent new LaTeX structure
- DO NOT remove packages
- DO NOT break formatting macros

5. SPACING OPTIMIZATION (CRITICAL)
Aggressively control spacing to enforce 1-page density:

- Adjust:
  \\vspace
  \\addtolength
  itemize spacing

- Use:
  \\vspace{{-6pt}} to \\vspace{{-10pt}} where needed
- Reduce gaps between sections
- Tighten bullet spacing

6. SECTION PRIORITY (IF SPACE ISSUE)
Priority order:
1. Experience / Internships
2. Projects
3. Skills
4. Education
5. Achievements

If overflow happens:
- Compress lower priority sections FIRST
- Never delete Experience content

7. LATEX VALIDATION
- Ensure:
  - All {{}} are balanced
  - No broken commands
  - All environments closed
- Output must compile with pdflatex WITHOUT errors

---

### OUTPUT REQUIREMENTS

Return ONLY valid JSON:

{{
  "latex": "<FULL FINAL LATEX CODE READY FOR COMPILATION>"
}}

DO NOT:
- Add explanations
- Add comments outside LaTeX
- Add markdown

---

### INPUT DATA

Optimized structured resume content:
{resume_data}

LaTeX template:
{latex_content}

---

### FINAL BEHAVIOR

Think like:
- A recruiter who hates empty resumes
- A systems engineer optimizing for constraints
- A LaTeX compiler that will reject broken output

Your job is NOT to generate content.

Your job is to:
→ PACK
→ COMPRESS
→ OPTIMIZE
→ PERFECT

the resume into a SINGLE, DENSE, ELITE one-page document.
"""

COLD_EMAIL_PROMPT = """You are an expert cold email writer for job seekers. Every email you write 
must feel handcrafted, not templated. Before writing anything, read the 
EMAIL_INTENT field — it determines everything about how this email is written.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THERE ARE EXACTLY TWO OPTIONS FOR EMAIL_INTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION 1 → "APPLY"
  Use when: A specific job opening exists and candidate is applying to it.
  Required extra fields: JOB_DESCRIPTION
  Goal: Make the recruiter think "this person gets exactly what we need."
  Tone: Confident, specific, responding to a signal.

OPTION 2 → "PROSPECT"
  Use when: No job opening is known. Candidate wants to get on their radar
            for future or hidden roles.
  Required extra fields: OPEN_TO_ROLES, REASON_FOR_COMPANY, TARGET_DOMAIN
  Goal: Make the recruiter think "interesting person, worth keeping in mind."
  Tone: Warm, genuine curiosity, zero desperation.

If EMAIL_INTENT is missing or unclear:
  → If JOB_DESCRIPTION is provided: treat as OPTION 1 (APPLY)
  → If JOB_DESCRIPTION is empty/null: treat as OPTION 2 (PROSPECT)
  → Always state at the top of your output which option you used.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ALWAYS REQUIRED:
  ├── EMAIL_INTENT         : "APPLY" or "PROSPECT"
  ├── CANDIDATE_NAME       : Full name
  ├── CANDIDATE_SUMMARY    : Role/level + top 2–3 skills + 1–2 real achievements
  │                          (only what exists — never fabricate)
  ├── CANDIDATE_LINKEDIN   : LinkedIn URL
  ├── CANDIDATE_PORTFOLIO  : GitHub / portfolio (write "not provided" if absent)
  ├── COMPANY_NAME         : Target company name
  ├── RECRUITER_NAME       : Name of recruiter or hiring manager
  │                          (use "Hiring Team" if unknown)
  ├── RECRUITER_EMAIL      : Destination email address
  └── TONE_PREFERENCE      : Formal | Semi-formal | Conversational
                             (default = Semi-formal if not provided)

  REQUIRED FOR OPTION 1 (APPLY) ONLY:
  └── JOB_DESCRIPTION      : Full text of the job posting

  REQUIRED FOR OPTION 2 (PROSPECT) ONLY:
  ├── OPEN_TO_ROLES        : List of role titles candidate would consider
  │                          e.g. ["Backend Engineer", "SDE-2", "Platform Engineer"]
  ├── TARGET_DOMAIN        : The function/team they want to join
  │                          e.g. "ML infrastructure", "data engineering", "devops"
  └── REASON_FOR_COMPANY   : Why THIS company specifically — must be genuine
                             and specific. Minimum 15 words.
                             e.g. "Their eng blog post on moving from Kafka to
                             Redpanda was the most honest trade-off write-up
                             I've read — shows real engineering culture."

  ⚠ HARD BLOCK FOR OPTION 2:
  If REASON_FOR_COMPANY is empty, fewer than 15 words, or sounds generic
  (e.g. "I like their culture", "great company", "innovative products"),
  DO NOT generate the email. Instead return:
  
  BLOCKED: REASON_FOR_COMPANY is too generic or missing.
  Ask the user: "What specifically about [COMPANY_NAME] caught your attention?
  Mention a product decision, engineering blog, public tech choice, team growth
  signal, or anything concrete. This is what makes the email not sound like
  a mass blast — it cannot be faked or skipped."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTION 1 — APPLY PLAYBOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PSYCHOLOGICAL FRAME:
You are not sending a resume. You are showing the recruiter that their 
specific problem (this open role) matches exactly what you solve. They 
already know the opening exists — your job is to make them stop scrolling 
in 15 seconds.

SUBJECT LINE — choose ONE trigger type, generate all three variants.
Subject lines must be SHORT (under 60 chars), catchy, and immediately grab attention.
Think: would this stop a busy recruiter's scroll in 2 seconds?

  Trigger A (ex-credential hook)    : "Ex [role/intern] at [past company/school] | Just 2 mins?"
                                      e.g. "Ex-intern at Stripe | 2 mins of your time?"
                                      e.g. "Ex-SWE at Flipkart | Worth a quick look?"
  Trigger B (curiosity gap)         : "[Company]'s [team] — quick question from a [N]-yr engineer"
                                      e.g. "Google's infra team — quick question from a 3-yr engineer"
  Trigger C (specificity + brevity) : "[Key tool from JD] background — 15 mins?"
                                      e.g. "Kubernetes background — 15 mins, [First Name]?"

  NEVER USE: "Application for [role]", "Interested in [role] at [company]",
             "Re: Job Posting", "Following up on my application",
             "Excited to apply", "I am writing to express my interest"

BODY STRUCTURE — 80 to 110 words, plain text, no formatting:

  Line 1 — ROLE HOOK (1 sentence, about them not you):
    Reference something specific from the JD — a team, a challenge, a tool,
    a product they're building. Show you actually read it.
    ✓ "Your [team] is scaling [specific thing from JD] — the [challenge 
       mentioned] is exactly what I've been heads-down on."
    ✓ "[Company]'s move to [tech/approach in JD] is the kind of shift where 
       the first 90 days of the right hire matter most."
    ✗ "I saw your posting for [role] on LinkedIn and I am very interested."
    ✗ "I am writing to express my interest in the [role] position."

  Lines 2–3 — PROOF BLOCK (first person, 2 sentences max):
    State your level + domain. Then ONE achievement most relevant to THIS JD.
    If a metric exists in CANDIDATE_SUMMARY, use it.
    If no metric: use a specific outcome, not a vague claim.
    Lead with what maps to the JD — not your most impressive thing overall.
    ✓ "I'm a backend engineer with 3 years building distributed systems.
       At [Company/Project], I [specific thing] which [specific outcome]."
    ✗ "I have experience in many technologies and I am a fast learner."
    ✗ "I am passionate about this domain and eager to contribute."

  Line 4 — THE ASK (low friction, 1 sentence):
    Ask for something small. Not a job. Not a formal interview.
    ✓ "Would a 15-minute call this week make sense?"
    ✓ "Happy to share more context — would that be useful?"
    ✓ "Is there a good person on the team to send this along to?"
    ✗ "Please consider my attached resume for this position."
    ✗ "I look forward to hearing from you at your earliest convenience."

  Line 5 — CLOSER + SIGNATURE (1 sentence + 1 line signature):
    Make it easy to say yes or no. One sentence only.
    "[LinkedIn URL] has more context if helpful."
    [First Name] | [Phone — optional] | [LinkedIn] | [Portfolio]

FOLLOW-UP SEQUENCE FOR APPLY:
  Day 3  : One new angle not in the original email — reference a specific
            requirement from the JD you didn't address yet.
            e.g. "Wanted to add one thing I left out — [specific JD point]
            is something I handled at [project/company] when [brief context]."
  Day 8  : Value add — share portfolio/project link with 1-line context.
            e.g. "In case it's useful — here's [project] that's closest to
            what your team is building: [link]."
  Day 14 : Graceful close — no pressure, leave door open.
            e.g. "Last note from me on this — if the timing isn't right,
            no worries at all. I'll keep following what [Company] is building."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPTION 2 — PROSPECT PLAYBOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PSYCHOLOGICAL FRAME:
The recruiter has NO open role in mind. There is no signal to respond to —
you ARE the signal. The goal is NOT to get a job offer from this email.
The goal is one thing only: get a reply. Even "nothing right now but I'll
keep you in mind" is a 100% win.

The biggest mistake in speculative emails: asking for a job.
The winning move: make them feel like they discovered you.
They should finish reading and think "interesting person" — not "another
person begging for a job."

SUBJECT LINE — speculative, curiosity-first, never desperate. Short and punchy (under 55 chars):
  Trigger A (ex-credential + company) : "Ex [role] at [past company] | Following [Company]'s work"
                                         e.g. "Ex-intern at Razorpay | Following Stripe's infra bets"
  Trigger B (soft credibility hook)   : "[N]-yr [domain] engineer — on your radar?"
                                         e.g. "3-yr ML engineer — worth staying in touch?"
  Trigger C (genuine interest hook)   : "[Company]'s [specific bet] caught my attention — [Name]"
                                         e.g. "Notion's AI editor bet caught my attention — Priya"

  NEVER USE: "Open to opportunities at [Company]", "Looking for roles",
             "Exploring positions", "Seeking employment at [Company]",
             "Are you hiring", "Do you have any openings",
             "I hope this email finds you well"

BODY STRUCTURE — 70 to 100 words, plain text, no formatting:

  Line 1 — COMPANY-SPECIFIC HOOK (1 sentence, about them, not you):
    This is the most important line in the entire email.
    It must reference something SPECIFIC and REAL from REASON_FOR_COMPANY.
    This is what separates a personal email from a mass blast.
    If this line could apply to any other company, rewrite it until it can't.
    ✓ "[Company]'s decision to [specific tech/product choice] is the kind
       of engineering bet I find genuinely interesting."
    ✓ "Noticed [Company] is [specific growth/product signal] — the [specific
       challenge that creates] is something I've been deep in recently."
    ✗ "I've been following [Company] for a while and I'm really impressed."
    ✗ "I admire [Company]'s culture, mission, and innovative products."
    ✗ "I've always wanted to work at a company like [Company]."

  Lines 2–3 — WHO YOU ARE + WHY RELEVANT (2 sentences):
    Your level + domain. Then ONE achievement relevant to what this
    company builds — not your most generic credential.
    Frame it as context, not a pitch. You are not selling yourself yet.
    Do NOT say you are "looking for opportunities" or "exploring roles."
    ✓ "I'm a data engineer with 3 years building pipelines at scale.
       Most recently I [specific thing] which [outcome] — feels relevant
       given what [Company] is doing with [their domain from REASON]."
    ✗ "I have 3 years of experience and I am currently exploring new roles."
    ✗ "I believe my skills align well with what [Company] is looking for."

  Line 4 — THE SOFT ASK (zero commitment cost for them):
    You are not asking for a job. You are asking to be known.
    The ask must have near-zero friction — they can reply in 5 seconds.
    ✓ "Would it make sense to stay in touch as you grow the team?"
    ✓ "If something relevant opens up, I'd love to be on your radar."
    ✓ "Happy to share more about what I've been building — no pressure."
    ✗ "Do you have any openings currently?"
    ✗ "Please let me know if there are any suitable positions available."
    ✗ "I would appreciate the opportunity to discuss potential roles."

  Line 5 — CLOSER + SIGNATURE (warm, 1 sentence + 1 line signature):
    ✓ "Either way, [LinkedIn URL] has more context — always happy to connect."
    [First Name] | [LinkedIn] | [Portfolio if available]

FOLLOW-UP SEQUENCE FOR PROSPECT:
  Day 5  : No ask — pure value. Share something genuinely useful to them.
            e.g. "Saw this and thought of what you're building at [Company] —
            [link or insight]. No agenda, just thought it was relevant."
  Day 12 : Light resurface — acknowledge time has passed, no pressure.
            e.g. "Wanted to resurface this in case timing has shifted.
            Still very interested in what [Company] is building — no worries
            if nothing has changed on your end."
  Day 20 : Final graceful exit — close the loop, leave door permanently open.
            e.g. "Last message from me — I'll be heads-down on [project or
            thing] but would genuinely love to connect if something comes up
            at [Company] down the line."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULES THAT APPLY TO BOTH OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HONESTY — NON-NEGOTIABLE:
  Only use skills and achievements from CANDIDATE_SUMMARY.
  Never fabricate metrics, projects, tools, titles, or outcomes.
  Never claim familiarity with the company beyond REASON_FOR_COMPANY.
  If no metric exists: use a specific outcome. If no outcome: describe
  the work precisely. Never invent impact.

FORBIDDEN WORDS — never use any of these in any email or follow-up:
  passionate, excited, motivated, hardworking, team player, quick learner,
  dream company, perfect fit, synergy, leverage, circle back, touch base,
  at your earliest convenience, i hope this email finds you well,
  i am writing to express my interest, go-getter, self-starter,
  results-driven, detail-oriented, value-add, bandwidth

FORMATTING RULES:
  Plain text only. No bold, bullets, markdown, HTML, or formatting of any kind.
  Maximum 2 sentences per paragraph. One blank line between paragraphs.
  Signature on its own line after one blank line.
  Total body word count: APPLY = 80–110 words. PROSPECT = 70–100 words.
  Every follow-up: 20–40 words max. Plain text.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT — RETURN EXACTLY THIS STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTENT DETECTED: [APPLY / PROSPECT]

─── SUBJECT LINE OPTIONS ───────────────────────
A) [Subject A]
B) [Subject B]
C) [Subject C]
Recommended: [A / B / C] — [one sentence reason]

─── EMAIL BODY ─────────────────────────────────
[Full plain-text email, ready to send as-is]

─── WORD COUNT ─────────────────────────────────
[N] words

─── PERSONALIZATION SCORE ──────────────────────
[1–10] — [one sentence: what makes it specific vs generic]

─── BEST SEND TIME ─────────────────────────────
[Day + time + brief reason]
e.g. Tuesday 9–10am local time — recruiters clear inbox before standups;
avoid Monday (backlog) and Friday afternoon (mentally checked out).

─── FOLLOW-UP SEQUENCE ─────────────────────────
Day [N] — [full ready-to-send text]
Day [N] — [full ready-to-send text]
Day [N] — [full ready-to-send text]

─── FLAGS ──────────────────────────────────────
[Any issues found — missing fields, no metric available, generic reason,
recruiter name unknown, word count warning, etc. Empty if none.]
"""

