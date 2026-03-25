import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, Code2, FileDown, Copy, Check, Mail, Phone,
  Linkedin, User, Star, Clock, AlertTriangle, ChevronDown, ChevronUp,
  Sparkles, Calendar, ExternalLink, Loader2, Info
} from 'lucide-react'
import { compilePdf } from '../api/client'

// ── Utility: parse subject line options from cold email text ──────────────────
function parseEmailParts(content) {
  if (!content) return { subjects: [], body: content, followUps: [], wordCount: null, sendTime: null, flags: [] }

  const subjectMatch = content.match(/─+\s*SUBJECT LINE OPTIONS\s*─+\n([\s\S]*?)(?=─+)/i)
  const bodyMatch = content.match(/─+\s*EMAIL BODY\s*─+\n([\s\S]*?)(?=─+)/i)
  const followUpMatch = content.match(/─+\s*FOLLOW-UP SEQUENCE\s*─+\n([\s\S]*?)(?=─+|$)/i)
  const sendTimeMatch = content.match(/─+\s*BEST SEND TIME\s*─+\n([\s\S]*?)(?=─+)/i)
  const flagsMatch = content.match(/─+\s*FLAGS\s*─+\n([\s\S]*?)(?=─+|$)/i)
  const wordCountMatch = content.match(/─+\s*WORD COUNT\s*─+\n(\d+ words)/i)

  // Parse subject lines A/B/C
  const subjects = []
  if (subjectMatch) {
    const raw = subjectMatch[1]
    const lines = raw.trim().split('\n')
    for (const line of lines) {
      const m = line.match(/^([ABC])\)\s*(.+)/)
      if (m) subjects.push({ label: m[1], text: m[2].trim() })
    }
    // Detect recommended
    const recMatch = raw.match(/Recommended:\s*([ABC])/i)
    if (recMatch) {
      subjects.forEach(s => { s.recommended = s.label === recMatch[1] })
    } else if (subjects.length > 0) {
      subjects[0].recommended = true
    }
  }

  // Parse follow-ups
  const followUps = []
  if (followUpMatch) {
    const raw = followUpMatch[1]
    const matches = [...raw.matchAll(/Day\s+(\d+)\s*[—–-]\s*([\s\S]*?)(?=Day\s+\d+|$)/gi)]
    matches.forEach(m => followUps.push({ day: m[1], text: m[2].trim() }))
  }

  return {
    subjects,
    body: bodyMatch ? bodyMatch[1].trim() : content,
    followUps,
    wordCount: wordCountMatch ? wordCountMatch[1] : null,
    sendTime: sendTimeMatch ? sendTimeMatch[1].trim() : null,
    flags: flagsMatch ? flagsMatch[1].trim().split('\n').filter(Boolean) : [],
  }
}

// ── LaTeX Viewer ──────────────────────────────────────────────────────────────
function LaTeXViewer({ code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlighted = code
    .replace(/(\\[a-zA-Z]+)/g, '<span style="color:#00d4ff">$1</span>')
    .replace(/(\{[^}]*\})/g, (m) => {
      if (m.includes('<span')) return m
      return `<span style="color:#e2b060">${m}</span>`
    })
    .replace(/(%.*$)/gm, '<span style="color:#6b7280;font-style:italic">$1</span>')

  return (
    <div className="code-viewer relative rounded-2xl overflow-hidden border border-white/08">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/06 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-white/30 font-mono">resume_optimized.tex</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all duration-200 border border-white/10 hover:border-brand-cyan/30 hover:text-brand-cyan text-white/40"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 h-80 overflow-y-auto text-xs leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <pre className="whitespace-pre-wrap text-white/60" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
    </div>
  )
}

// ── Cold Email Card ───────────────────────────────────────────────────────────
function ColdEmailCard({ emailObj, idx }) {
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [bodyCopied, setBodyCopied] = useState(false)
  const [showFollowUps, setShowFollowUps] = useState(false)
  const parts = parseEmailParts(emailObj.content)

  // Auto-select recommended
  const effectiveSubject = selectedSubject ?? parts.subjects.find(s => s.recommended)?.label ?? parts.subjects[0]?.label

  const copyBody = () => {
    const subj = parts.subjects.find(s => s.label === effectiveSubject)
    const text = subj ? `Subject: ${subj.text}\n\n${parts.body}` : parts.body
    navigator.clipboard.writeText(text)
    setBodyCopied(true)
    setTimeout(() => setBodyCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-[#0d0d12] rounded-2xl border border-white/08 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/06 bg-brand-yellow/[0.03]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Mail size={13} className="text-brand-yellow" />
            <p className="text-xs font-mono text-brand-yellow">{emailObj.recipient}</p>
          </div>
          <p className="text-[10px] text-white/35 uppercase tracking-widest">{emailObj.company}</p>
        </div>
        <div className="flex items-center gap-2">
          {parts.wordCount && (
            <span className="text-[10px] font-mono text-white/30 border border-white/08 rounded px-2 py-0.5">
              {parts.wordCount}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyBody}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              bodyCopied
                ? 'bg-brand-green/20 border-brand-green/40 text-brand-green'
                : 'border-white/10 text-white/50 hover:border-brand-yellow/40 hover:text-brand-yellow'
            }`}
          >
            {bodyCopied ? <Check size={12} /> : <Copy size={12} />}
            {bodyCopied ? 'Copied!' : 'Copy Email'}
          </motion.button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Subject line options */}
        {parts.subjects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} className="text-brand-yellow" />
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
                Subject Line Options — pick one to send
              </p>
            </div>
            <div className="space-y-2">
              {parts.subjects.map((s) => (
                <motion.button
                  key={s.label}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedSubject(s.label)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                    effectiveSubject === s.label
                      ? 'bg-brand-yellow/15 border-brand-yellow/40 text-white'
                      : 'bg-white/[0.02] border-white/06 text-white/55 hover:border-white/15 hover:text-white/80'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all ${
                      effectiveSubject === s.label ? 'bg-brand-yellow text-black' : 'bg-white/08 text-white/40'
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-sm font-mono flex-1 leading-snug">{s.text}</span>
                  {s.recommended && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 shrink-0">
                      <Star size={8} fill="currentColor" />
                      BEST
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Email body */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mail size={12} className="text-white/40" />
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">Email Body</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/06">
            <pre className="text-sm text-white/80 whitespace-pre-wrap font-body leading-relaxed">
              {parts.body}
            </pre>
          </div>
        </div>

        {/* Send time */}
        {parts.sendTime && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-brand-cyan/[0.05] border border-brand-cyan/15">
            <Calendar size={13} className="text-brand-cyan mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-brand-cyan/70 uppercase tracking-widest font-semibold mb-0.5">Best Send Time</p>
              <p className="text-xs text-white/60 leading-relaxed">{parts.sendTime}</p>
            </div>
          </div>
        )}

        {/* Flags */}
        {parts.flags.length > 0 && parts.flags[0].length > 3 && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-brand-yellow/[0.05] border border-brand-yellow/15">
            <AlertTriangle size={13} className="text-brand-yellow mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-brand-yellow/70 uppercase tracking-widest font-semibold mb-1">Flags</p>
              {parts.flags.map((f, i) => (
                <p key={i} className="text-xs text-white/55 leading-relaxed">{f}</p>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up sequence toggle */}
        {parts.followUps.length > 0 && (
          <div>
            <button
              onClick={() => setShowFollowUps(!showFollowUps)}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <Clock size={12} />
              Follow-up Sequence ({parts.followUps.length} emails)
              {showFollowUps ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence>
              {showFollowUps && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {parts.followUps.map((fu, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 bg-white/[0.02] rounded-xl border border-white/06">
                      <div className="shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold font-mono text-brand-purple">Day {fu.day}</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{fu.text}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Async PDF Download Button ─────────────────────────────────────────────────
function PdfDownloadBtn({ latexContent }) {
  const [state, setState] = useState('idle') // idle | loading | error

  const handleClick = async () => {
    if (!latexContent) return
    setState('loading')
    try {
      const blob = await compilePdf(latexContent)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume_optimized.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setState('idle')
    } catch (err) {
      console.error('PDF compile error:', err)
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const label =
    state === 'loading' ? 'Compiling…' :
    state === 'error'   ? 'Failed — retry?' :
    '📄 Download PDF'

  return (
    <motion.button
      onClick={handleClick}
      disabled={state === 'loading' || !latexContent}
      whileHover={state === 'idle' ? { scale: 1.02, y: -2 } : {}}
      whileTap={state === 'idle' ? { scale: 0.98 } : {}}
      className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 w-full justify-center ${
        state === 'error'
          ? 'bg-red-500/20 border border-red-500/40 text-red-300'
          : state === 'loading'
          ? 'opacity-70 cursor-not-allowed text-white/60'
          : 'text-black cursor-pointer'
      }`}
      style={state !== 'error' ? { background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' } : {}}
    >
      {state === 'loading'
        ? <Loader2 size={16} className="animate-spin" />
        : <FileDown size={16} />}
      {label}
    </motion.button>
  )
}

// ── Overleaf Button ───────────────────────────────────────────────────────────
function OverleafBtn({ latexContent }) {
  const handleClick = () => {
    if (!latexContent) return
    // POST to Overleaf's "new project from clipboard" endpoint
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = 'https://www.overleaf.com/docs'
    form.target = '_blank'
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'snip'
    input.value = latexContent
    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()
    form.remove()
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={!latexContent}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 w-full justify-center glass border border-white/12 text-white/70 hover:border-green-400/40 hover:text-green-300 cursor-pointer"
    >
      <ExternalLink size={16} />
      Open in Overleaf
    </motion.button>
  )
}

// ── Simple Download Button ────────────────────────────────────────────────────
function DownloadBtn({ href, label, icon: Icon, primary = false }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download={true}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer no-underline w-full justify-center ${
        primary
          ? 'text-black font-semibold'
          : 'glass border border-white/12 text-white/70 hover:border-brand-cyan/30 hover:text-white'
      }`}
      style={primary ? { background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)' } : {}}
    >
      <Icon size={16} />
      {label}
    </motion.a>
  )
}

// ── Main Output Section ───────────────────────────────────────────────────────
export default function OutputSection({ data }) {
  if (!data) return null

  const {
    modified_latex,
    pdf_download_url,
    latex_download_url,
    resume_name,
    resume_email,
    resume_phone,
    resume_linkedin,
    cold_emails = [],
    blocked_recipients = [],
  } = data

  return (
    <section id="output" className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {/* Header */}
        <div className="section-line mb-10">
          <h2 className="font-display text-2xl font-semibold text-white/90">Download & Export</h2>
        </div>

        {/* Contact Info Card */}
        {(resume_name || resume_email || resume_phone) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <User size={14} className="text-brand-cyan" />
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                Extracted Contact Information
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {resume_name && (
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/06">
                  <p className="text-[10px] text-white/35 mb-1 uppercase tracking-wider">Name</p>
                  <p className="text-sm text-white/90 font-semibold truncate">{resume_name}</p>
                </div>
              )}
              {resume_email && (
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/06">
                  <div className="flex items-center gap-1 mb-1">
                    <Mail size={10} className="text-brand-cyan" />
                    <p className="text-[10px] text-white/35 uppercase tracking-wider">Email</p>
                  </div>
                  <p className="text-xs text-white/70 truncate">{resume_email}</p>
                </div>
              )}
              {resume_phone && (
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/06">
                  <div className="flex items-center gap-1 mb-1">
                    <Phone size={10} className="text-brand-cyan" />
                    <p className="text-[10px] text-white/35 uppercase tracking-wider">Phone</p>
                  </div>
                  <p className="text-sm text-white/70">{resume_phone}</p>
                </div>
              )}
              {resume_linkedin && (
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/06">
                  <div className="flex items-center gap-1 mb-1">
                    <Linkedin size={10} className="text-brand-cyan" />
                    <p className="text-[10px] text-white/35 uppercase tracking-wider">LinkedIn</p>
                  </div>
                  <p className="text-xs text-white/70 truncate">{resume_linkedin}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Cold Emails — notice banner */}
        {cold_emails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/08 border border-blue-400/20"
          >
            <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-white/55 leading-relaxed">
              <span className="text-blue-400 font-semibold">These emails are drafted for you — they are NOT sent automatically.</span>{' '}
              Copy the subject + body and send them manually from your own email client.
            </p>
          </motion.div>
        )}

        {/* Cold Emails */}
        {cold_emails.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b33, #f59e0b11)' }}
              >
                <Mail size={15} className="text-brand-yellow" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white/90">Generated Cold Emails</h3>
                <p className="text-xs text-white/35">
                  {cold_emails.length} email{cold_emails.length > 1 ? 's' : ''} crafted · click a subject line to select it
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {cold_emails.map((emailObj, idx) => (
                <ColdEmailCard key={idx} emailObj={emailObj} idx={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Blocked Recipients */}
        {blocked_recipients.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-red-500/08 rounded-2xl p-5 border border-red-500/20"
          >
            <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={14} />
              Emails blocked — fix to enable
            </h3>
            <ul className="space-y-2">
              {blocked_recipients.map((b, idx) => (
                <li key={idx} className="text-xs text-red-300/80 leading-relaxed">
                  <span className="font-mono text-red-200 mr-2">{b.recipient}:</span>
                  {b.reason}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* LaTeX + Downloads grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LaTeX Viewer */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={14} className="text-brand-cyan" />
              <span className="text-xs font-semibold font-display uppercase tracking-wider text-brand-cyan">
                Modified LaTeX — One-Page Enforced
              </span>
            </div>
            {modified_latex ? (
              <LaTeXViewer code={modified_latex} />
            ) : (
              <div className="code-viewer flex items-center justify-center h-48 text-white/30 text-sm rounded-2xl border border-white/08">
                No LaTeX output available.
              </div>
            )}
          </div>

          {/* Downloads panel */}
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-5 space-y-3 border border-white/08">
              <div className="flex items-center gap-2 mb-1">
                <Download size={14} className="text-white/40" />
                <span className="text-xs font-semibold font-display uppercase tracking-wider text-white/40">
                  Download Resume
                </span>
              </div>

              {/* PDF: always show — compiles on-demand */}
              <PdfDownloadBtn latexContent={modified_latex} />

              {/* Open in Overleaf */}
              <OverleafBtn latexContent={modified_latex} />

              {/* .tex source download */}
              {latex_download_url ? (
                <DownloadBtn href={latex_download_url} label="⚙️ Download .tex" icon={Code2} />
              ) : (
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/08 text-white/25 text-sm cursor-not-allowed">
                  <Code2 size={16} />
                  <span>LaTeX unavailable</span>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-5 space-y-3 border border-white/08">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Next Steps</p>
              {[
                'Download the PDF — it fits exactly one page',
                'Pick your favorite subject line before sending',
                'Send the cold email on Tuesday 9–10 AM',
                'Use the follow-up sequence to stay top-of-mind',
                'Submit optimized resume to ATS portals',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-brand-cyan text-xs font-mono mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs text-white/40 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
