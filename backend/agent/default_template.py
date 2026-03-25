"""
Default ATS-Optimized LaTeX Resume Template
Designed to pass ATS scanning and maintain professional formatting
"""

DEFAULT_LATEX_TEMPLATE = r"""\documentclass[letterpaper,10pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}
\usepackage{fontawesome5}
\usepackage{ragged2e}

\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\addtolength{\oddsidemargin}{-0.55in}
\addtolength{\evensidemargin}{-0.55in}
\addtolength{\textwidth}{1.1in}
\addtolength{\topmargin}{-.55in}
\addtolength{\textheight}{1.1in}
\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}
\titleformat{\section}{
  \vspace{-5pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-4pt}]
\pdfgentounicode=1

\newcommand{\resumeItem}[1]{
  \item\small{{#1 \vspace{-2pt}}}
}
\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-6pt}
}
\newcommand{\resumeProjectHeading}[3]{
  \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small\textbf{#1} & #3 \\
      \small\textit{#2} & \\
    \end{tabular*}\vspace{-6pt}
}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=0.2in,label=\textbullet]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-4pt}}

\begin{document}

%----------HEADING----------
\begin{center}
  {\Huge \scshape Your Full Name}\\[2pt]
  {\small Degree, Year \,\textbar\\[1pt]
  {\small
    \faPhone\ +XX-XXXXXXXXXX \,$|$\,
    \faEnvelope\ \href{mailto:youremail@example.com}{youremail@example.com} \,$|$\,
    \faLinkedin\ \href{https://www.linkedin.com/in/yourprofile/}{LinkedIn} \,$|$\,
    \faGithub\ \href{https://github.com/yourusername}{GitHub}
  }
\end{center}

%-----------PROFILE SUMMARY-----------
\vspace{-10pt}
\section{Profile Summary}
\small{Summary text highlighting education, experience, technical skills, and achievements}

%-----------EDUCATION-----------
\vspace{-5pt}
\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {University Name, City}{Mon YYYY -- Mon YYYY}
      {Degree in Your Field}{CGPA: \textbf{X.XX/10.0}}
  \resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\vspace{-8pt}
\section{Technical Skills}
\resumeItemListStart
  \resumeItem{\textbf{Languages}: Language1, Language2, Language3}
  \resumeItem{\textbf{Frameworks}: Framework1, Framework2, Framework3}
  \resumeItem{\textbf{Databases}: DB1, DB2, DB3}
  \resumeItem{\textbf{Cloud Platforms}: CloudService1, CloudService2}
  \resumeItem{\textbf{Tools}: Tool1, Tool2, Tool3}
\resumeItemListEnd

%-----------EXPERIENCE-----------
\vspace{-8pt}
\section{Professional Experience}
  \resumeSubHeadingListStart

    \resumeSubheading
      {Job Title}{Mon YYYY -- Mon YYYY}
      {Company Name, City}{}
      \resumeItemListStart
        \resumeItem{Achievement and responsibility}
        \resumeItem{Achievement and responsibility}
        \resumeItem{Achievement and responsibility}
      \resumeItemListEnd

  \resumeSubHeadingListEnd

%-----------PROJECTS-----------
\vspace{-8pt}
\section{Projects}
\resumeSubHeadingListStart

  \resumeProjectHeading
    {{Project Name} \,\,$|$\,\, \href{https://github.com/}{GitHub}}
    {Tech Stack: Framework, Language, Database}
    {Month Year}
    \resumeItemListStart
      \resumeItem{Project description and technologies}
      \resumeItem{Key accomplishment and impact}
    \resumeItemListEnd

\resumeSubHeadingListEnd

%-----------ACHIEVEMENTS-----------
\vspace{-8pt}
\section{Achievements}
  \resumeItemListStart
    \resumeItem{\textbf{Achievement Name} -- Description and impact}
    \resumeItem{\textbf{Certification} -- Issuing organization and year}
  \resumeItemListEnd

\end{document}
"""

def get_default_template():
    """Return the default ATS-optimized LaTeX template."""
    return DEFAULT_LATEX_TEMPLATE
