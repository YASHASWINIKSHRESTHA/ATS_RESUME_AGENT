import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Github } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        transition: 'background 300ms ease-in-out, border-color 300ms ease-in-out',
        background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #1F2937' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={14} style={{ color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#F9FAFB', letterSpacing: '-0.01em' }}>
            ATSMaxAI
          </span>
          <span
            style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 20,
              background: 'rgba(16,185,129,0.15)', color: '#10B981',
              border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            BETA
          </span>
        </motion.div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { href: '#how',    label: 'How It Works' },
            { href: '#input',  label: 'Try It' },
            { href: '#output', label: 'Results' },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: '#9CA3AF',
                textDecoration: 'none',
                transition: 'color 200ms ease-in-out, background 200ms ease-in-out',
              }}
              onMouseEnter={e => { e.target.style.color = '#F9FAFB'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.target.style.color = '#9CA3AF'; e.target.style.background = 'transparent' }}
            >
              {label}
            </a>
          ))}

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              color: '#9CA3AF', textDecoration: 'none',
              border: '1px solid #1F2937',
              background: '#111111',
              transition: 'all 200ms ease-in-out',
              marginLeft: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F9FAFB'; e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.boxShadow = '0 0 14px rgba(59,130,246,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = '#111111'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <Github size={13} />
            GitHub
          </a>

          <motion.a
            href="#input"
            whileHover={{ scale: 1.04, boxShadow: '0 0 22px rgba(59,130,246,0.4)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 12,
              fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: '#fff', textDecoration: 'none',
              marginLeft: 8,
              transition: 'all 250ms ease-in-out',
            }}
          >
            Start Free
          </motion.a>
        </div>
      </div>
    </motion.nav>
  )
}
