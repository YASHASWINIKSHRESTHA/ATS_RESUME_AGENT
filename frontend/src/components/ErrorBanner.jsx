import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

export default function ErrorBanner({ error, onDismiss }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
        >
          <div className="glass-strong rounded-2xl p-4 border border-brand-red/25 flex items-start gap-3"
            style={{ boxShadow: '0 0 30px #ef444422' }}
          >
            <AlertCircle size={18} className="text-brand-red shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-red font-display">Analysis Failed</p>
              <p className="text-xs text-white/55 mt-1 leading-relaxed break-words">{error}</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded-lg hover:bg-white/08 text-white/30 hover:text-white/60 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
