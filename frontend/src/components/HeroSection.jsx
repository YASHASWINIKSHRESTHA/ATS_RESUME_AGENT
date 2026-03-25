import { motion } from 'framer-motion'
import { Sparkles, ChevronDown, Zap, Target, FileCode, Mail, Shield } from 'lucide-react'

const BADGES = [
  { icon: Target,   label: 'ATS Scoring',        style: { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.20)' } },
  { icon: Zap,      label: 'LangGraph Pipeline',  style: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.20)' } },
  { icon: FileCode, label: 'LaTeX One-Page Fix',  style: { color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)' } },
  { icon: Mail,     label: 'Cold Email Engine',   style: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' } },
  { icon: Shield,   label: 'Authentic Rewrites',  style: { color: '#D1D5DB', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)' } },
]

const STATS = [
  { value: '9 Stages',  label: 'AI Pipeline' },
  { value: 'GPT-4o',   label: 'Powered By' },
  { value: '1-Page',   label: 'LaTeX Enforced' },
  { value: '100%',     label: 'Authentic' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ paddingTop: '5rem' }}>

      {/* Content */}
      <div className="relative z-10 text-center px-6 w-full max-w-content mx-auto">

        {/* Top status pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', animation: 'pulseDot 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#9CA3AF', letterSpacing: '0.02em' }}>
            Powered by LangGraph + GPT-4o-mini · 9-Stage Pipeline
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.25 }}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#F9FAFB',
            marginBottom: '1.25rem',
          }}
        >
          Optimize Your&nbsp;
          <span style={{
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Resume
          </span>
          &nbsp;with
          <br />
          <span style={{ color: 'rgba(249,250,251,0.75)' }}>AI Precision</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4 }}
          style={{
            fontSize: 17,
            fontWeight: 400,
            color: '#9CA3AF',
            lineHeight: 1.7,
            maxWidth: 580,
            margin: '0 auto 2.5rem',
          }}
        >
          Upload your resume and job description. Our{' '}
          <span style={{ color: '#3B82F6', fontWeight: 500 }}>9-stage AI pipeline</span> scores ATS
          compatibility, rewrites LaTeX into a{' '}
          <span style={{ color: '#8B5CF6', fontWeight: 500 }}>perfect one-page PDF</span>, and
          crafts{' '}
          <span style={{ color: '#F59E0B', fontWeight: 500 }}>catchy cold emails</span> — all authentically.
        </motion.p>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: '2.5rem' }}
        >
          {BADGES.map(({ icon: Icon, label, style: s }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.87 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              whileHover={{ scale: 1.06, y: -3 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 10,
                background: s.bg,
                border: `1px solid ${s.border}`,
                fontSize: 13,
                color: 'rgba(209,213,219,1)',
                fontWeight: 500,
                cursor: 'default',
              }}
            >
              <Icon size={13} style={{ color: s.color, flexShrink: 0 }} />
              {label}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.72 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: '3.5rem' }}
        >
          <motion.a
            href="#input"
            whileHover={{ scale: 1.04, boxShadow: '0 0 48px rgba(59,130,246,0.45)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 28px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 250ms ease-in-out',
            }}
          >
            <Sparkles size={17} />
            Start Optimizing Free
          </motion.a>

          <motion.a
            href="#how"
            whileHover={{ scale: 1.02, background: '#1F2937' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 22px',
              borderRadius: 12,
              background: '#111111',
              border: '1px solid #1F2937',
              color: '#D1D5DB',
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 200ms ease-in-out',
            }}
          >
            See How It Works
            <ChevronDown size={14} />
          </motion.a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.88 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 520, margin: '0 auto' }}
        >
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 + i * 0.06 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '12px 8px',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 700, color: '#F9FAFB', margin: 0 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#6B7280', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'JetBrains Mono, monospace' }}>{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.2)' }}
      >
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={15} />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(0deg, #000000 0%, transparent 100%)', pointerEvents: 'none' }} />
    </section>
  )
}
