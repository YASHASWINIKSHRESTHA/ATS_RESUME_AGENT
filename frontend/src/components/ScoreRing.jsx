import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const CIRCUMFERENCE = 2 * Math.PI * 45  // r=45

function getColor(score) {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function getLabel(score) {
  if (score >= 80) return { text: 'Strong Match', cls: 'text-brand-green' }
  if (score >= 60) return { text: 'Moderate Match', cls: 'text-brand-yellow' }
  return { text: 'Weak Match', cls: 'text-brand-red' }
}

export default function ScoreRing({ score = 0 }) {
  const [displayed, setDisplayed] = useState(0)
  const color  = getColor(score)
  const label  = getLabel(score)
  const offset = CIRCUMFERENCE - (displayed / 100) * CIRCUMFERENCE

  useEffect(() => {
    let start = null
    const duration = 1800
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(ease * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
        <svg width="160" height="160" viewBox="0 0 100 100" className="-rotate-90">
          {/* Track */}
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="7"
          />
          {/* Progress */}
          <motion.circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 6px ${color}88)`,
              transition: 'stroke-dashoffset 0.05s linear, stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-display font-bold"
            style={{ color }}
          >
            {displayed}
          </span>
          <span className="text-xs text-white/40 font-mono">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <p className={`text-sm font-semibold font-display ${label.cls}`}>
          {label.text}
        </p>
        <p className="text-xs text-white/30 mt-0.5">ATS Compatibility Score</p>
      </div>
    </div>
  )
}
