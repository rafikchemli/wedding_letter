import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, FileText, ChevronRight, Check } from 'lucide-react'
import InvitationForm from './components/InvitationForm'
import LetterPreview from './components/LetterPreview'
import './index.css'

const steps = [
  { id: 'form', label: 'Formulaire' },
  { id: 'preview', label: 'Apercu' },
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
              <p className="text-xs text-gray-500">19 septembre 2026</p>
            </div>
          </div>

          {/* Step indicator with layoutId pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs relative">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (i < currentStep) setCurrentStep(i)
                  }}
                  className={`relative px-3 py-1.5 rounded-full font-medium transition-colors duration-300 cursor-default ${
                    i < currentStep ? 'cursor-pointer' : ''
                  } ${
                    i === currentStep
                      ? 'text-white'
                      : i < currentStep
                        ? 'text-blue-600'
                        : 'text-gray-400'
                  }`}
                >
                  {i === currentStep && (
                    <motion.span
                      layoutId="step-pill"
                      className="absolute inset-0 bg-blue-500 rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                  {i < currentStep && (
                    <span className="absolute inset-0 bg-blue-50 rounded-full" />
                  )}
                  {i > currentStep && (
                    <span className="absolute inset-0 bg-gray-100 rounded-full" />
                  )}
                  <span className="relative z-10">{step.label}</span>
                </button>
                {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
              </div>
            ))}
          </div>

          {/* Mobile step counter */}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {currentStep === 0 && (
              <>
                <motion.div
                  className="text-center mb-10 sm:mb-14"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium tracking-wider uppercase mb-5">
                    <FileText className="w-3.5 h-3.5" />
                    Lettre d'invitation IRCC
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 leading-[1.2]">
                    Generez votre lettre d'invitation
                  </h2>
                  <p className="text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
                    Remplissez le formulaire ci-dessous pour generer une lettre officielle
                    pour votre demande de visa visiteur au Canada.
                  </p>
                </motion.div>
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
        Mariage Rafik & Sandrine — 19 septembre 2026 — Montreal
      </footer>
    </div>
  )
}

export default App
