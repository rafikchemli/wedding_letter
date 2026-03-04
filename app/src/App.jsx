import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, FileText, ChevronRight, Check } from 'lucide-react'
import InvitationForm from './components/InvitationForm'
import LetterPreview from './components/LetterPreview'
import './index.css'

const steps = [
  { label: 'Formulaire', icon: FileText },
  { label: 'Aperçu', icon: Check },
]

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(null)

  const handleFormSubmit = (data) => {
    setFormData(data)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 leading-tight">Rafik & Sandrine</h1>
              <p className="text-xs text-gray-500">19 septembre 2026 — Montréal</p>
            </div>
          </div>

          {/* Step indicator — desktop */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <motion.span
                  layout
                  className={`px-3 py-1.5 rounded-full font-medium transition-all duration-300 ${
                    i === currentStep
                      ? 'bg-blue-500 text-white shadow-sm'
                      : i < currentStep
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.label}
                </motion.span>
                {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
              </div>
            ))}
          </div>

          {/* Step indicator — mobile */}
          <div className="sm:hidden text-xs font-medium text-gray-500">
            {currentStep + 1}/{steps.length}
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {currentStep === 0 && (
              <>
                <div className="text-center mb-10 sm:mb-14">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium tracking-wider uppercase mb-5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lettre d'invitation IRCC
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 leading-[1.2]"
                  >
                    Générez votre lettre d'invitation
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-base text-gray-500 max-w-lg mx-auto leading-relaxed"
                  >
                    Remplissez le formulaire ci-dessous pour générer une lettre officielle
                    pour votre demande de visa visiteur au Canada.
                  </motion.p>
                </div>
                <InvitationForm onSubmit={handleFormSubmit} initialData={formData} />
              </>
            )}

            {currentStep >= 1 && formData && (
              <LetterPreview data={formData} onBack={handleBack} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 sm:py-10 text-center text-xs text-gray-400">
        Mariage Rafik & Sandrine — 19 septembre 2026 — Montréal
      </footer>
    </div>
  )
}

export default App
