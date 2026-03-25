import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target, TrendingUp, AlertTriangle, Zap,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  ArrowUpRight, Layers, FileText, Sparkles
} from 'lucide-react'
import ScoreRing from './ScoreRing'

// ── Fade-in card ──────────────────────────────────────────────────────────

function Card({ children, className = '', delay = 0, glowColor = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`glass rounded-2xl p-6 ${className}`}
      style={{
        boxShadow: glowColor ? `0 0 30px ${glowColor}15` : undefined,
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Section header ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, color = 'text-brand-cyan' }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon size={16} className={color} />
      <h3 className={`font-display text-sm font-semibold uppercase tracking-wider ${color}`}>
        {title}
      </h3>
    </div>
  )
}

// ── Section score bar ─────────────────────────────────────────────────────

function SectionBar({ label, score }) {
  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#f59e0b' :
    '#ef4444'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60 font-medium capitalize">{label}</span>
        <span className="font-mono" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 bg-white/05 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          viewport={{ once: true }}
          style={{
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 8px ${color}44`,
          }}
        />
      </div>
    </div>
  )
}

// ── Keyword chip ──────────────────────────────────────────────────────────

function Chip({ label, matched }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      viewport={{ once: true }}
      className={`chip ${
        matched
          ? 'bg-brand-green/10 text-brand-green border-brand-green/30'
          : 'bg-brand-red/10 text-brand-red border-brand-red/30'
      }`}
    >
      {matched ? '✓' : '✗'} {label}
    </motion.span>
  )
}

// ── Weak bullet accordion ─────────────────────────────────────────────────

function WeakBullet({ item, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="border border-white/08 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/03 transition-colors"
      >
        <AlertTriangle size={14} className="text-brand-yellow mt-0.5 shrink-0" />
        <p className="text-xs text-white/60 flex-1 leading-relaxed line-clamp-2">
          {item.original}
        </p>
        {open ? <ChevronUp size={14} className="text-white/30 shrink-0" /> : <ChevronDown size={14} className="text-white/30 shrink-0" />}
      </button>

      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="px-4 pb-4 space-y-3 border-t border-white/06"
        >
          <div className="pt-3">
            <p className="text-xs text-brand-yellow/70 font-medium mb-1">Issue</p>
            <p className="text-xs text-white/50">{item.issue}</p>
          </div>
          <div>
            <p className="text-xs text-brand-green/70 font-medium mb-1">Suggestion</p>
            <p className="text-xs text-brand-green/90 leading-relaxed">{item.suggestion}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Resume comparison panel ───────────────────────────────────────────────

function ComparisonPanel({ title, content, color, icon: Icon }) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-3 px-4 py-2 rounded-xl border ${
        color === 'cyan'
          ? 'bg-brand-cyan/05 border-brand-cyan/15'
          : 'bg-brand-green/05 border-brand-green/15'
      }`}>
        <Icon size={14} className={color === 'cyan' ? 'text-brand-cyan' : 'text-brand-green'} />
        <span className={`text-xs font-semibold font-display uppercase tracking-wider ${
          color === 'cyan' ? 'text-brand-cyan' : 'text-brand-green'
        }`}>{title}</span>
      </div>
      <div className="bg-white/[0.02] border border-white/06 rounded-xl p-4 h-64 overflow-y-auto">
        <pre className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed font-mono">
          {content || 'No content available.'}
        </pre>
      </div>
    </div>
  )
}

// ── Priority badge ────────────────────────────────────────────────────────

const priorityStyle = {
  high:   'bg-brand-red/10 text-brand-red border-brand-red/20',
  medium: 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
  low:    'bg-white/05 text-white/50 border-white/10',
}

// ── Main Results Component ────────────────────────────────────────────────

export default function ResultsSection({ data, originalResume }) {
  if (!data) return null

  const {
    ats_score = 0,
    keyword_match_percent = 0,
    matched_keywords = [],
    missing_keywords = [],
    section_scores = {},
    strengths = [],
    critical_gaps = [],
    gaps = {},
    improved_resume_text = '',
    job_title = '',
    company = '',
    improvement_notes = [],
  } = data

  return (
    <section id="results" className="relative z-10 px-6 py-16 max-w-6xl mx-auto space-y-8">

      {/* Section title */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="section-line"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold text-white/90">
            Analysis Results
          </h2>
          {job_title && (
            <p className="text-sm text-white/40 mt-1">
              {job_title}{company ? ` · ${company}` : ''}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Row 1: ATS Score + Section Scores ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ATS Score */}
        <Card delay={0.1} glowColor="#00d4ff" className="md:col-span-1 flex flex-col items-center justify-center">
          <SectionHeader icon={Target} title="ATS Score" />
          <ScoreRing score={ats_score} />

          <div className="mt-6 w-full pt-4 border-t border-white/06">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Keyword Match</span>
              <span className="font-mono text-brand-cyan">{keyword_match_percent}%</span>
            </div>
            <div className="h-1 bg-white/06 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${keyword_match_percent}%` }}
                transition={{ duration: 1.2, delay: 0.5 }}
              />
            </div>
          </div>
        </Card>

        {/* Section scores */}
        <Card delay={0.2} className="md:col-span-2">
          <SectionHeader icon={Layers} title="Section Scores" color="text-brand-purple" />
          <div className="space-y-4">
            {Object.entries(section_scores).map(([key, val]) => (
              <SectionBar key={key} label={key} score={val} />
            ))}
          </div>

          {strengths.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/06">
              <p className="text-xs text-white/40 font-medium mb-2">Strengths Detected</p>
              <div className="space-y-1.5">
                {strengths.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={12} className="text-brand-green mt-0.5 shrink-0" />
                    <p className="text-xs text-white/60">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 2: Keywords ── */}
      <Card delay={0.2}>
        <SectionHeader icon={Zap} title="Keyword Analysis" color="text-brand-cyan" />

        <div className="space-y-5">
          {matched_keywords.length > 0 && (
            <div>
              <p className="text-xs text-brand-green/70 font-medium mb-3 flex items-center gap-1.5">
                <CheckCircle size={12} />
                Present Keywords ({matched_keywords.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {matched_keywords.map((kw) => <Chip key={kw} label={kw} matched />)}
              </div>
            </div>
          )}

          {missing_keywords.length > 0 && (
            <div>
              <p className="text-xs text-brand-red/70 font-medium mb-3 flex items-center gap-1.5">
                <XCircle size={12} />
                Missing Keywords ({missing_keywords.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {missing_keywords.map((kw) => <Chip key={kw} label={kw} matched={false} />)}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Row 3: Gap Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Improvement priorities */}
        {gaps.improvement_priorities?.length > 0 && (
          <Card delay={0.3}>
            <SectionHeader icon={TrendingUp} title="Improvement Priorities" color="text-brand-yellow" />
            <div className="space-y-3">
              {gaps.improvement_priorities.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/06"
                >
                  <span className={`chip text-[10px] shrink-0 mt-0.5 ${priorityStyle[item.priority] || priorityStyle.low}`}>
                    {item.priority}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-white/80">{item.area}</p>
                    <p className="text-xs text-white/45 mt-0.5">{item.action}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Weak bullets */}
        {gaps.weak_bullets?.length > 0 && (
          <Card delay={0.35}>
            <SectionHeader icon={AlertTriangle} title="Weak Bullet Points" color="text-brand-yellow" />
            <div className="space-y-2">
              {gaps.weak_bullets.slice(0, 5).map((item, i) => (
                <WeakBullet key={i} item={item} index={i} />
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Row 4: Resume Comparison ── */}
      <Card delay={0.4}>
        <SectionHeader icon={ArrowUpRight} title="Resume Comparison" color="text-white/60" />
        <div className="flex gap-4 flex-col md:flex-row">
          <ComparisonPanel
            title="Original"
            content={originalResume}
            color="cyan"
            icon={FileText}
          />
          <ComparisonPanel
            title="Optimized"
            content={improved_resume_text}
            color="green"
            icon={Sparkles}
          />
        </div>

        {improvement_notes?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/06">
            <p className="text-xs text-white/40 font-medium mb-2">What Was Improved</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {improvement_notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-cyan mt-1.5 shrink-0" />
                  <p className="text-xs text-white/50">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </section>
  )
}

