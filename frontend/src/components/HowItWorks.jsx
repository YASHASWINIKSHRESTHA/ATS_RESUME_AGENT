import { motion } from 'framer-motion'

const STEPS = [
  {
    number: '01',
    title: 'Upload Your Resume',
    desc: 'Provide your existing resume (PDF/TXT) and optionally your LaTeX template. The agent preserves your formatting.',
    color: '#00d4ff',
  },
  {
    number: '02',
    title: 'Paste Job Description',
    desc: 'Paste the full JD text or provide a URL. The agent fetches and parses the requirements automatically.',
    color: '#7c3aed',
  },
  {
    number: '03',
    title: 'AI Pipeline Runs',
    desc: 'An 8-stage LangGraph pipeline: JD parsing → Resume parsing → ATS scoring → Gap analysis → Optimization → LaTeX modification.',
    color: '#10b981',
  },
  {
    number: '04',
    title: 'Download & Apply',
    desc: 'Get a detailed ATS report, side-by-side comparison, and download your optimized PDF and .tex files.',
    color: '#f59e0b',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="section-line mb-12"
      >
        <div>
          <h2 className="font-display text-2xl font-semibold text-white/90">How It Works</h2>
          <p className="text-sm text-white/35 mt-1">Four steps to a job-ready resume</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass rounded-2xl p-6 cursor-default border border-white/06 hover:border-white/12 transition-all duration-300"
            style={{ boxShadow: `0 0 30px ${step.color}08` }}
          >
            <div className="flex items-start gap-4">
              {/* Number */}
              <div
                className="text-4xl font-display font-bold shrink-0 leading-none"
                style={{
                  color: step.color,
                  opacity: 0.25,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {step.number}
              </div>

              <div>
                <div
                  className="w-8 h-0.5 rounded mb-3"
                  style={{ background: step.color, opacity: 0.6 }}
                />
                <h3 className="font-display font-semibold text-base text-white/85 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed font-body">
                  {step.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pipeline visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-12 glass rounded-2xl p-6"
      >
        <p className="text-xs font-display font-semibold uppercase tracking-wider text-white/30 mb-4">
          LangGraph Pipeline
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            'resolve_jd', 'parse_jd', 'parse_resume',
            'ats_score', 'gap_analysis', 'optimize_resume',
            'modify_latex', 'compile_pdf',
          ].map((node, i, arr) => (
            <div key={node} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                viewport={{ once: true }}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/03"
              >
                <span className="text-xs font-mono text-white/55">{node}</span>
              </motion.div>
              {i < arr.length - 1 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i + 0.02 }}
                  viewport={{ once: true }}
                  className="text-brand-cyan/30 text-sm font-mono"
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
