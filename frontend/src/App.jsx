import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import VortexBackground from './components/VortexBackground'
import Navbar          from './components/Navbar'
import HeroSection     from './components/HeroSection'
import HowItWorks      from './components/HowItWorks'
import InputSection    from './components/InputSection'
import LoadingPipeline from './components/LoadingPipeline'
import ResultsSection  from './components/ResultsSection'
import OutputSection   from './components/OutputSection'
import ErrorBanner     from './components/ErrorBanner'
import Footer          from './components/Footer'

import { analyzeResume } from './api/client'

export default function App() {
  const [loading,       setLoading]       = useState(false)
  const [currentStep,   setCurrentStep]   = useState('')
  const [results,       setResults]       = useState(null)
  const [error,         setError]         = useState(null)
  const [originalText,  setOriginalText]  = useState('')

  const resultsRef = useRef(null)

  useEffect(() => {
    if (!loading) return
    const STEPS = [
      'Fetching Job Description',
      'Parsing Job Description',
      'Parsing Resume',
      'Computing ATS Score',
      'Analyzing Skill Gaps',
      'Optimizing Resume Content',
      'Modifying LaTeX Template',
      'Enforcing One-Page Layout',
      'Compiling PDF',
    ]
    let index = 0
    const interval = setInterval(() => {
      if (index < STEPS.length - 1) { index++; setCurrentStep(STEPS[index]) }
    }, 7000)
    setCurrentStep(STEPS[0])
    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = async ({ resumeFile, jdInput, coldEmailConfig }) => {
    setError(null)
    setResults(null)
    setLoading(true)

    try {
      const data = await analyzeResume({ resumeFile, jdInput, coldEmailConfig, onProgress: () => {} })
      if (!data.success) throw new Error(data.pipeline_error || 'Analysis failed.')
      setResults(data)
      // Use the improved_resume_text as the "before" comparison baseline (cleaned text)
      setOriginalText(data.improved_resume_text || '')
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setCurrentStep('')
    }
  }

  return (
    /* Pure black background — spec requirement */
    <div className="min-h-screen text-[#F9FAFB] relative" style={{ background: '#000000' }}>

      {/* ── Vortex Background ── */}
      <VortexBackground />

      <Navbar />

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && <LoadingPipeline currentStep={currentStep} />}
      </AnimatePresence>

      <main className="relative z-10">
        <HeroSection />

        {/* Section divider */}
        <div className="max-w-content mx-auto px-6">
          <div className="divider" />
        </div>

        <HowItWorks />

        <div className="max-w-content mx-auto px-6">
          <div className="divider" />
        </div>

        <InputSection onSubmit={handleSubmit} loading={loading} />

        <AnimatePresence>
          {results && (
            <motion.div
              key="results"
              ref={resultsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-content mx-auto px-6">
                <div className="divider" />
              </div>

              <ResultsSection data={results} originalResume={originalText} />

              <div className="max-w-content mx-auto px-6">
                <div className="divider" />
              </div>

              <OutputSection data={results} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
