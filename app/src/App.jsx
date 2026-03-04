import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, FileText, ChevronRight, ChevronDown } from 'lucide-react'
import InvitationForm from './components/InvitationForm'
import LetterPreview from './components/LetterPreview'
import './index.css'

const steps = [
  { id: 'form', label: 'Formulaire' },
  { id: 'preview', label: 'Aperçu' },
]

const base = import.meta.env.BASE_URL

const photos = [
  { src: `${base}photos/beach.svg`, alt: 'Rafik & Sandrine au coucher de soleil' },
  { src: `${base}photos/dunes.svg`, alt: 'Rafik & Sandrine sur les dunes' },
  { src: `${base}photos/hero.svg`, alt: 'Rafik & Sandrine dans le désert' },
]

function FloatingPetals() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="petal" />
      ))}
    </>
  )
}

const letterContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const letterChild = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function AnimatedName({ text, delay = 0, className: cls = '' }) {
  return (
    <motion.h2
      variants={letterContainer}
      initial="hidden"
      animate="visible"
      transition={{ delayChildren: delay }}
      className={cls}
      aria-label={text}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          variants={letterChild}
          className="inline-block"
          style={{ minWidth: char === ' ' ? '0.25em' : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h2>
  )
}

function OrnamentalDivider({ className = '' }) {
  return (
    <div className={`ornament text-sm font-display italic tracking-wide ${className}`}>
      ✿
    </div>
  )
}

function PhotoGallery() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-12 sm:py-16 relative z-10"
    >
      <OrnamentalDivider className="max-w-xs mx-auto mb-10" />

      <div className="flex gap-4 sm:gap-6 justify-center px-4 max-w-4xl mx-auto">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, rotate: i === 0 ? -3 : i === 2 ? 3 : 0 }}
            whileInView={{
              opacity: 1,
              y: 0,
              rotate: i === 0 ? -3 : i === 2 ? 3 : 0,
            }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            className="relative flex-1 max-w-[200px] sm:max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden
              shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover"
            />
            {/* Soft overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        ))}
      </div>

      <OrnamentalDivider className="max-w-xs mx-auto mt-10" />
    </motion.section>
  )
}

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleFormSubmit = (data) => {
    setFormData(data)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToForm = () => {
    setShowForm(true)
    setTimeout(() => {
      document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4] relative overflow-x-hidden">
      <FloatingPetals />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-[#FFFBF7]/80 backdrop-blur-xl border-b border-[#E8C4B8]/30 shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B9E7E]/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#8B9E7E]" />
            </div>
            <div>
              <h1 className="text-sm font-display font-semibold text-[#5C6B4F] leading-tight tracking-wide">
                Rafik & Sandrine
              </h1>
              <p className="text-xs text-[#C4A98A]">19 septembre 2026</p>
            </div>
          </div>

          {/* Step indicator */}
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
                        ? 'text-[#5C6B4F]'
                        : 'text-[#C4A98A]'
                  }`}
                >
                  {i === currentStep && (
                    <motion.span
                      layoutId="step-pill"
                      className="absolute inset-0 bg-[#8B9E7E] rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                  {i < currentStep && (
                    <span className="absolute inset-0 bg-[#8B9E7E]/10 rounded-full" />
                  )}
                  {i > currentStep && (
                    <span className="absolute inset-0 bg-[#E8C4B8]/20 rounded-full" />
                  )}
                  <span className="relative z-10">{step.label}</span>
                </button>
                {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[#C4A98A]" />}
              </div>
            ))}
          </div>

          {/* Mobile step counter */}
          <div className="sm:hidden text-xs font-medium text-[#C4A98A]">
            {currentStep + 1}/{steps.length}
          </div>
        </div>
      </motion.header>

      {/* Hero section with photo background */}
      {currentStep === 0 && !showForm && (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
          {/* Background photo */}
          <div className="absolute inset-0 z-0">
            <img
              src={`${base}photos/hero.svg`}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F4]/70 via-[#FDF8F4]/50 to-[#FDF8F4]/90" />
            <div className="absolute inset-0 bg-[#5C6B4F]/10" />
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative z-10 text-center px-4"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-[#5C6B4F]/80 mb-6 drop-shadow-sm">
              Vous êtes invité(e) au mariage de
            </p>

            <div>
              <AnimatedName
                text="Rafik"
                delay={0.4}
                className="font-display text-5xl sm:text-7xl font-semibold text-[#5C6B4F] leading-[1.1] mb-2 drop-shadow-sm"
              />
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
                className="ornament text-2xl my-3 text-[#8B9E7E] font-display italic"
              >
                &
              </motion.div>
              <AnimatedName
                text="Sandrine"
                delay={1.1}
                className="font-display text-5xl sm:text-7xl font-semibold text-[#5C6B4F] leading-[1.1] drop-shadow-sm"
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 space-y-2"
            >
              <p className="text-base text-[#5C6B4F] font-medium tracking-wide drop-shadow-sm">
                19 septembre 2026
              </p>
              <p className="text-sm text-[#5C6B4F]/70 drop-shadow-sm">
                Studio L'Éloi — Montréal, Québec
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-12"
            >
              <OrnamentalDivider className="mb-8 max-w-xs mx-auto" />

              <p className="text-sm text-[#5C6B4F]/60 max-w-md mx-auto leading-relaxed mb-8 drop-shadow-sm">
                Générez votre lettre d'invitation officielle IRCC
                pour votre demande de visa visiteur au Canada.
              </p>

              <motion.button
                onClick={scrollToForm}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="animated-border bg-[#8B9E7E] text-white rounded-full px-8 py-3.5 text-sm font-medium
                  hover:bg-[#7A8E6D] shadow-lg hover:shadow-xl
                  focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
                  transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Commencer le formulaire
              </motion.button>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
              className="mt-16"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5 text-[#5C6B4F]/50 mx-auto" />
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Photo gallery — visible on form step */}
      {currentStep === 0 && (
        <PhotoGallery />
      )}

      {/* Main */}
      <main id="form-section" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {currentStep === 0 && (showForm || formData) && (
              <>
                <motion.div
                  className="text-center mb-10 sm:mb-14"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B9E7E]/10 text-[#5C6B4F] text-xs font-medium tracking-wider uppercase mb-5">
                    <FileText className="w-3.5 h-3.5" />
                    Lettre d'invitation IRCC
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#5C6B4F] mb-4 leading-[1.2]">
                    Générez votre lettre d'invitation
                  </h2>
                  <p className="text-base text-[#8B9E7E]/70 max-w-lg mx-auto leading-relaxed">
                    Remplissez le formulaire ci-dessous pour générer une lettre officielle
                    pour votre demande de visa visiteur au Canada.
                  </p>

                  <OrnamentalDivider className="mt-8 max-w-xs mx-auto" />
                </motion.div>
                <InvitationForm onSubmit={handleFormSubmit} initialData={formData} />
              </>
            )}

            {/* First visit: show form immediately if hero was skipped */}
            {currentStep === 0 && !showForm && !formData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                onViewportEnter={() => setShowForm(true)}
              />
            )}

            {currentStep >= 1 && formData && (
              <LetterPreview data={formData} onBack={handleBack} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E8C4B8]/30 py-10 text-center">
        <OrnamentalDivider className="max-w-xs mx-auto mb-6" />
        <p className="font-display text-sm text-[#C4A98A] italic tracking-wide">
          Mariage Rafik & Sandrine — 19 septembre 2026 — Montréal
        </p>
      </footer>
    </div>
  )
}

export default App
