import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader, Circle } from 'lucide-react'

const STEPS = [
  { id: 'resolve',   label: 'Fetching Job Description',    emoji: '🔍' },
  { id: 'parse_jd',  label: 'Parsing Job Description',     emoji: '📋' },
  { id: 'resume',    label: 'Parsing Resume',              emoji: '📄' },
  { id: 'ats',       label: 'Computing ATS Score',         emoji: '🎯' },
  { id: 'gaps',      label: 'Analyzing Skill Gaps',        emoji: '🔬' },
  { id: 'optimize',  label: 'Optimizing Content',          emoji: '✨' },
  { id: 'latex',     label: 'Modifying LaTeX Template',    emoji: '⚡' },
  { id: 'pdf',       label: 'Compiling PDF',               emoji: '📦' },
]

function matchStep(currentStep) {
  if (!currentStep) return -1
  const lower = currentStep.toLowerCase()
  if (lower.includes('fetch') || lower.includes('resolv'))  return 0
  if (lower.includes('jd') || lower.includes('job'))        return 1
  if (lower.includes('resum') && lower.includes('pars'))    return 2
  if (lower.includes('ats') || lower.includes('scor'))      return 3
  if (lower.includes('gap') || lower.includes('analyz'))    return 4
  if (lower.includes('optim'))                              return 5
  if (lower.includes('latex') || lower.includes('modif'))   return 6
  if (lower.includes('pdf') || lower.includes('compil'))    return 7
  return -1
}

export default function LoadingPipeline({ currentStep }) {
  const activeIndex = matchStep(currentStep)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050508]/90 backdrop-blur-xl"
    >
      {/* Pulsing background orb */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #00d4ff, #7c3aed)',
          filter: 'blur(80px)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-brand-cyan/20 mb-4"
            animate={{ borderColor: ['#00d4ff33', '#7c3aed33', '#00d4ff33'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-brand-cyan pulse-dot" />
            <span className="text-sm font-mono text-brand-cyan">Agent Running</span>
          </motion.div>

          <h2 className="font-display text-3xl font-bold grad-cyan mb-2">
            Optimizing Your Resume
          </h2>
          <p className="text-sm text-white/40 font-body">
            LangGraph pipeline in progress…
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const done    = i < activeIndex
            const active  = i === activeIndex
            const pending = i > activeIndex

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-500
                  ${active  ? 'glass-strong border border-brand-cyan/30 glow-cyan' : ''}
                  ${done    ? 'glass border border-brand-green/20' : ''}
                  ${pending ? 'opacity-30' : ''}
                `}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {done && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle size={18} className="text-brand-green" />
                    </motion.div>
                  )}
                  {active && (
                    <Loader
                      size={18}
                      className="text-brand-cyan animate-spin"
                    />
                  )}
                  {pending && (
                    <Circle size={18} className="text-white/20" />
                  )}
                </div>

                {/* Emoji */}
                <span className={`text-base ${pending ? 'grayscale' : ''}`}>
                  {step.emoji}
                </span>

                {/* Label */}
                <span className={`
                  text-sm font-medium transition-all duration-300
                  ${active  ? 'text-white font-semibold' : ''}
                  ${done    ? 'text-brand-green/80' : ''}
                  ${pending ? 'text-white/30' : ''}
                `}>
                  {step.label}
                </span>

                {/* Active shimmer */}
                {active && (
                  <motion.div
                    className="ml-auto"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((j) => (
                        <motion.div
                          key={j}
                          className="w-1 h-1 rounded-full bg-brand-cyan"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1, delay: j * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
              boxShadow: '0 0 10px #00d4ff66',
            }}
            animate={{
              width: `${Math.max(5, ((activeIndex + 1) / STEPS.length) * 100)}%`,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <p className="text-center text-xs text-white/30 mt-3 font-mono">
          {currentStep || 'Initializing…'}
        </p>
      </div>
    </motion.div>
  )
}
