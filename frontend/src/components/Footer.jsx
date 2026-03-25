import { motion } from 'framer-motion'
import { Zap, Heart } from 'lucide-react'

const TECH = ['LangGraph', 'GPT-4o', 'FastAPI', 'React', 'LaTeX', 'ReportLab']

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #1F2937',
        marginTop: 96,
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={13} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#F9FAFB' }}>ATSMaxAI</span>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: 0, maxWidth: 220 }}>
              9-stage LangGraph AI pipeline that rewrites your resume, enforces one-page LaTeX, and crafts catchy cold emails.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, margin: '0 0 14px' }}>
              Navigation
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '#how',    label: 'How It Works' },
                { href: '#input',  label: 'Try It Now' },
                { href: '#output', label: 'View Results' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'none', transition: 'color 200ms ease-in-out' }}
                    onMouseEnter={e => e.target.style.color = '#3B82F6'}
                    onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>
              Built With
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {TECH.map((tech) => (
                <span
                  key={tech}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px', borderRadius: 6,
                    background: '#111111',
                    border: '1px solid #1F2937',
                    color: '#9CA3AF',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#1F2937', marginBottom: 24 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>
            © 2026 ATSMaxAI · Built for job seekers who deserve better.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4B5563', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>Made with</span>
            <Heart size={11} style={{ color: '#EF4444', fill: '#EF4444' }} />
            <span>and AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
