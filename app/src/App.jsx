import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, FileText, Download, ChevronRight } from 'lucide-react'
import InvitationForm from './components/InvitationForm'
import LetterPreview from './components/LetterPreview'
import './index.css'

const steps = ['Formulaire', 'Aperçu', 'Télécharger']

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
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Rafik & Sandrine</h1>
              <p className="text-xs text-gray-500">19 septembre 2026</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${
                    i === currentStep
                      ? 'bg-blue-500 text-white'
                      : i < currentStep
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step}
                </span>
                {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {currentStep === 0 && (
            <>
              <div className="text-center mb-8 sm:mb-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium tracking-wider uppercase mb-4"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Lettre IRCC
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
                  Générez votre lettre d'invitation
                </h2>
                <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
                  Remplissez le formulaire ci-dessous pour générer une lettre d'invitation
                  officielle pour votre demande de visa visiteur au Canada.
                </p>
              </div>
              <InvitationForm onSubmit={handleFormSubmit} initialData={formData} />
            </>
          )}

          {currentStep >= 1 && formData && (
            <LetterPreview
              data={formData}
              onBack={handleBack}
              onDownloadStep={() => setCurrentStep(2)}
            />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        Mariage Rafik & Sandrine — 19 septembre 2026 — Montréal
      </footer>
    </div>
  )
}

export default App
