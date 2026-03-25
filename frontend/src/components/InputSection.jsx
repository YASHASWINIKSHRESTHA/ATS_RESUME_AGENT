import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Link, Sparkles, X, CheckCircle,
  AlertCircle, ChevronRight, Mail, Send
} from 'lucide-react'

import FluidBlobs from './FluidBlobs'

// ── File Drop Zone ────────────────────────────────────────────────────────

function DropZone({ label, hint, accept, icon: Icon, file, onFile, color = 'cyan' }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const colors = {
    cyan:   { border: '#3B82F6', glow: 'rgba(59,130,246,0.15)', text: 'text-brand-blue' },
    purple: { border: '#8B5CF6', glow: 'rgba(139,92,246,0.15)', text: 'text-brand-violet' },
  }
  const c = colors[color]

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }, [onFile])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  return (
    <motion.div
      className="upload-zone relative p-5 rounded-xl cursor-pointer"
      style={{
        borderColor: dragging ? c.border : file ? c.border + '88' : undefined,
        background: dragging ? c.glow : file ? c.glow : undefined,
        boxShadow: file ? `0 0 20px ${c.glow}` : 'none',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => !file && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-3"
          >
            <CheckCircle size={20} className={c.text} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${c.text}`}>{file.name}</p>
              <p className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              onClick={(e) => { e.stopPropagation(); onFile(null) }}
            >
              <X size={14} className="text-white/50" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 py-2"
          >
            <div className={`p-2 rounded-lg ${c.text} bg-white/5`}>
              <Icon size={20} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/80">{label}</p>
              <p className="text-xs text-white/40 mt-0.5">{hint}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── JD Input ─────────────────────────────────────────────────────────────

function JDInput({ value, onChange }) {
  const [mode, setMode] = useState('text') // 'text' | 'url'

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {[
          { id: 'text', icon: FileText, label: 'Paste Text' },
          { id: 'url',  icon: Link,     label: 'Job URL' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { setMode(id); onChange('') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === id
                ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/40'
                : 'text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={8}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/25 resize-none focus:outline-none focus:border-brand-blue/40 focus:bg-white/[0.05] transition-all duration-200 font-body"
        />
      ) : (
        <div className="relative">
          <Link size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://jobs.company.com/position-id"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-brand-blue/40 transition-all duration-200 font-mono"
          />
        </div>
      )}
    </div>
  )
}

// ── Main Input Section ────────────────────────────────────────────────────

export default function InputSection({ onSubmit, loading }) {
  const [resumeFile, setResumeFile]   = useState(null)
  const [jdInput,    setJdInput]      = useState('')
  
  const [coldEmailEnabled, setColdEmailEnabled] = useState(false)
  const [coldConfig, setColdConfig] = useState({
    email_intent: 'APPLY',
    email: '',
    recruiter_name: '',
    company_name: '',
    tone: 'Semi-formal',
    open_to_roles: '',
    target_domain: '',
    reason_for_company: ''
  })

  const handleSubmit = () => {
    if (!resumeFile && !jdInput.trim()) return
    let finalConfig = null
    if (coldEmailEnabled) {
      finalConfig = { ...coldConfig }
      if (finalConfig.email_intent === 'PROSPECT') {
        finalConfig.open_to_roles = finalConfig.open_to_roles.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
    onSubmit({ resumeFile, jdInput, coldEmailConfig: finalConfig })
  }

  const isReady = !!resumeFile && jdInput.trim().length > 20

  return (
    <section id="input" className="relative z-10 px-6 py-20 max-w-5xl mx-auto rounded-3xl" style={{ position: 'relative' }}>
      
      {/* ── 3D Liquid Blobs Background ── */}
      <FluidBlobs />

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {/* Section header */}
        <div className="section-line">
          <h2 className="font-display text-2xl font-semibold text-white/90">
            Upload & Configure
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Files */}
          <div className="glass rounded-2xl p-6 space-y-4 glow-blue">
            <div className="flex items-center gap-2 mb-2">
              <Upload size={16} className="text-brand-blue" />
              <span className="text-sm font-medium font-display text-white/70 uppercase tracking-wider">
                Resume Files
              </span>
            </div>

            <DropZone
              label="Upload Resume"
              hint="PDF or TXT · drag & drop or click"
              accept=".pdf,.txt"
              icon={FileText}
              file={resumeFile}
              onFile={setResumeFile}
              color="cyan"
            />

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 p-3 rounded-lg bg-brand-violet/10 border border-brand-violet/20"
            >
              <AlertCircle size={14} className="text-brand-violet mt-0.5 shrink-0" />
              <p className="text-xs text-white/50 leading-relaxed">
                Your resume will be optimized using an ATS-friendly professional template.
                Output will be downloadable as both PDF and LaTeX code.
              </p>
            </motion.div>
          </div>

          {/* Right: JD */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-brand-violet" />
              <span className="text-sm font-medium font-display text-white/70 uppercase tracking-wider">
                Job Description
              </span>
            </div>

            <JDInput value={jdInput} onChange={setJdInput} />

            {jdInput.trim().length > 0 && jdInput.trim().length < 20 && (
              <p className="text-xs text-brand-yellow">
                Please provide a more detailed job description.
              </p>
            )}
          </div>
        </div>

        {/* Cold Email Options */}
        <div className="mt-6 glass rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-brand-yellow" />
              <span className="text-sm font-medium font-display text-white/70 uppercase tracking-wider">
                Cold Email Generation (Optional)
              </span>
            </div>
            <button
              onClick={() => setColdEmailEnabled(!coldEmailEnabled)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                coldEmailEnabled 
                  ? 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/40' 
                  : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
              }`}
            >
              {coldEmailEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <AnimatePresence>
            {coldEmailEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="h-px bg-white/10 mb-4" />
                
                <div className="flex gap-2 mb-4">
                  {['APPLY', 'PROSPECT'].map(intent => (
                    <button
                      key={intent}
                      onClick={() => setColdConfig({ ...coldConfig, email_intent: intent })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        coldConfig.email_intent === intent
                          ? 'bg-brand-blue/20 text-brand-blue border-brand-blue/40'
                          : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {intent === 'APPLY' ? 'Apply (Open Role)' : 'Prospect (Hidden Role)'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <label className="text-white/60 text-xs">Target Company</label>
                    <input
                      type="text"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/80 focus:border-brand-blue/40 outline-none"
                      value={coldConfig.company_name}
                      onChange={e => setColdConfig({ ...coldConfig, company_name: e.target.value })}
                      placeholder="E.g. Acme Corp"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 text-xs">Recruiter Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/80 focus:border-brand-blue/40 outline-none"
                      value={coldConfig.recruiter_name}
                      onChange={e => setColdConfig({ ...coldConfig, recruiter_name: e.target.value })}
                      placeholder="If unknown, we use 'Hiring Team'"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 text-xs">Recruiter Email</label>
                    <input
                      type="email"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/80 focus:border-brand-blue/40 outline-none"
                      value={coldConfig.email}
                      onChange={e => setColdConfig({ ...coldConfig, email: e.target.value })}
                      placeholder="recruiter@company.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/60 text-xs">Tone</label>
                    <select
                      className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-white/80 focus:border-brand-blue/40 outline-none"
                      value={coldConfig.tone}
                      onChange={e => setColdConfig({ ...coldConfig, tone: e.target.value })}
                    >
                      <option>Semi-formal</option>
                      <option>Formal</option>
                      <option>Conversational</option>
                    </select>
                  </div>
                </div>

                {coldConfig.email_intent === 'PROSPECT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 border-t border-brand-yellow/10 pt-4">
                    <div className="space-y-1">
                      <label className="text-white/60 text-xs">Open To Roles (comma separated)</label>
                      <input
                        type="text"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/80 focus:border-brand-yellow/40 outline-none"
                        value={coldConfig.open_to_roles}
                        onChange={e => setColdConfig({ ...coldConfig, open_to_roles: e.target.value })}
                        placeholder="Backend Engineer, Platform Engineer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/60 text-xs">Target Domain / Team</label>
                      <input
                        type="text"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/80 focus:border-brand-yellow/40 outline-none"
                        value={coldConfig.target_domain}
                        onChange={e => setColdConfig({ ...coldConfig, target_domain: e.target.value })}
                        placeholder="Data Infrastructure, MLOps"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-white/60 text-xs flex justify-between">
                        <span>Why this company specifically? (Min 15 words)</span>
                        <span className="text-brand-yellow/60">Required</span>
                      </label>
                      <textarea
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white/80 focus:border-brand-yellow/40 outline-none resize-none"
                        value={coldConfig.reason_for_company}
                        onChange={e => setColdConfig({ ...coldConfig, reason_for_company: e.target.value })}
                        placeholder="E.g. Their eng blog post on moving from Kafka to Redpanda was the most honest trade-off write-up I've read..."
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <div className="mt-8 flex justify-center">
          {!resumeFile && (
            <p className="text-xs text-brand-yellow/70 mb-3 text-center">
              Please upload your resume (PDF or TXT) to continue.
            </p>
          )}
          <motion.button
            onClick={handleSubmit}
            disabled={loading || !isReady}
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(59,130,246,0.45)' }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex items-center gap-3 px-10 py-4 rounded-2xl font-display font-semibold text-base
              transition-all duration-300 overflow-hidden
              ${loading
                ? 'opacity-60 cursor-not-allowed bg-white/10 border border-white/20 text-white/40'
                : 'bg-gradient-to-r from-brand-blue via-brand-violet to-brand-blue bg-[length:200%_100%] text-white cursor-pointer hover:bg-right-bottom'
              }
            `}
            style={{
              backgroundPosition: loading ? undefined : '0% 0%',
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Optimize My Resume</span>
                <ChevronRight size={18} />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
