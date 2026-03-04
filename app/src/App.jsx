import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, MotionConfig } from 'framer-motion'
import { FileText, ChevronDown } from 'lucide-react'
import '@theme-toggles/react/css/Simple.css'
import { Simple } from '@theme-toggles/react'
import InvitationForm from './components/InvitationForm'
import LetterPreview from './components/LetterPreview'
import ParticleSystem from './components/ParticleSystem'
import { notifyHost } from './emailService'
import './index.css'

const THEMES = {
  sand: {
    bg: '#FDF5ED',
    headerBg: 'rgba(253, 248, 240, 0.82)',
    headerBorder: 'rgba(210, 170, 130, 0.3)',
    sky: ['#7FAAC8', '#A8C4D8', '#DCCEB8', '#E0C8A0'],
    sun: ['#FFF4D0', 0.8, '#F0D8C0', 0],
    ground: [
      { color: '#C4A050', opacity: 0.7 },
      { color: '#D0B068', opacity: 0.55 },
      { color: '#DCC080', opacity: 0.45 },
    ],
    overlay: 'linear-gradient(to bottom, rgba(253,245,237,0.55), rgba(253,245,237,0.25), rgba(253,245,237,0.6))',
    tint: 'rgba(74,54,40,0.04)',
    // Text
    text: '#3B4A30',
    textSoft: '#5C6B4F',
    textMuted: '#7A6B55',
    heroText: '#3A2010',
    heroSub: 'rgba(58,32,16,0.8)',
    heroLight: 'rgba(58,32,16,0.7)',
    heroMuted: 'rgba(58,32,16,0.55)',
    heroGhost: 'rgba(58,32,16,0.4)',
    nameSandrine: '#C8952A',
    nameRafik: '#C8952A',
    ampersand: '#C8952A',
    ornament: '#C8952A',
    ornamentLine: 'rgba(58,32,16,0.5)',
    badgeBg: 'rgba(139,158,126,0.1)',
    stepPast: 'rgba(139,158,126,0.1)',
    stepFuture: 'rgba(232,196,184,0.2)',
    footerBorder: 'rgba(232,196,184,0.3)',
    goldGradient: 'linear-gradient(105deg, #4A2E0A 0%, #5E3C12 20%, #7A5018 40%, #8B6020 50%, #7A5018 60%, #5E3C12 80%, #4A2E0A 100%)',
  },
  snow: {
    bg: '#111820',
    headerBg: 'rgba(17,24,32,0.88)',
    headerBorder: 'rgba(80,110,150,0.15)',
    sky: ['#0A1018', '#101825', '#182030', '#111820'],
    sun: ['#8AA0C0', 0.2, '#304060', 0],
    ground: [
      { color: '#8AA0B8', opacity: 0.35 },
      { color: '#A0B4C8', opacity: 0.28 },
      { color: '#B8C8D8', opacity: 0.2 },
    ],
    overlay: 'linear-gradient(to bottom, rgba(17,24,32,0.25), rgba(17,24,32,0.1), rgba(17,24,32,0.5))',
    tint: 'rgba(60,100,160,0.03)',
    // Text
    text: '#D8E4F0',
    textSoft: '#98AAB8',
    textMuted: '#6880A0',
    heroText: '#E4ECF4',
    heroSub: 'rgba(228,236,244,0.7)',
    heroLight: 'rgba(228,236,244,0.6)',
    heroMuted: 'rgba(228,236,244,0.45)',
    heroGhost: 'rgba(228,236,244,0.3)',
    nameSandrine: '#E4ECF4',
    nameRafik: '#E4ECF4',
    ampersand: '#B8A060',
    ornament: '#5878A0',
    ornamentLine: 'rgba(80,120,160,0.3)',
    badgeBg: 'rgba(139,158,126,0.15)',
    stepPast: 'rgba(139,158,126,0.15)',
    stepFuture: 'rgba(80,110,150,0.15)',
    footerBorder: 'rgba(80,110,150,0.15)',
    goldGradient: 'linear-gradient(105deg, #C49A2E 0%, #D4AF37 20%, #F5E6A3 40%, #FFFAD4 50%, #F5E6A3 60%, #D4AF37 80%, #C49A2E 100%)',
  },
}

const base = import.meta.env.BASE_URL

const photos = [
  { src: `${base}photos/chevre.jpeg`, alt: 'Sandrine & Rafik à Chèvre' },
  { src: `${base}photos/desert.jpeg`, alt: 'Sandrine & Rafik dans le désert' },
  { src: `${base}photos/kawa.jpeg`, alt: 'Sandrine & Rafik au café' },
]

function ThemeToggle({ theme, onChange }) {
  const isSnow = theme === 'snow'
  return (
    <div
      className="fixed top-4 right-4 z-50"
      style={{ opacity: 0, animation: 'fade-in 0.4s ease-out 5s forwards' }}
    >
      <Simple
        toggled={isSnow}
        toggle={() => onChange(isSnow ? 'sand' : 'snow')}
        duration={750}
        className="text-2xl cursor-pointer"
        style={{ color: isSnow ? '#E4ECF4' : '#3A2010' }}
        aria-label={isSnow ? 'Passer au thème sable' : 'Passer au thème neige'}
      />
    </div>
  )
}

const GROUND_PATHS = {
  sand: [
    // Back dune — two crests with long windward slopes and steeper leeward drops
    'M-50 700 C80 685 200 640 340 565 C400 535 420 530 450 535 C520 555 560 600 640 615 C720 600 820 555 940 505 C1000 485 1020 482 1050 490 C1120 520 1180 575 1250 600 L1250 800 L-50 800Z',
    // Mid dune — offset rhythm, one broad crest
    'M-50 740 C60 730 200 700 350 655 C440 630 480 625 520 635 C600 660 700 675 820 650 C940 628 1040 615 1120 625 C1180 635 1220 655 1250 665 L1250 800 L-50 800Z',
    // Front dune — gentle foreground ridge
    'M-50 760 C150 755 350 738 500 722 C620 712 680 710 760 718 C900 730 1050 740 1250 735 L1250 800 L-50 800Z',
  ],
  snow: [
    // Back snowbank — big soft mounds
    'M-50 700 C50 700 120 660 220 610 C320 560 380 560 440 600 C500 640 560 660 660 620 C760 580 820 560 900 580 C980 600 1020 640 1100 620 C1180 600 1220 580 1250 590 L1250 800 L-50 800Z',
    // Mid snowbank — pillowy bumps, offset
    'M-50 740 C30 735 100 710 200 680 C300 650 360 650 430 670 C500 690 580 700 680 680 C780 660 840 650 920 665 C1000 680 1080 695 1150 685 C1200 678 1230 670 1250 675 L1250 800 L-50 800Z',
    // Front drift — gentle rolling snow
    'M-50 760 C100 758 250 745 380 735 C510 725 580 728 700 738 C820 748 920 742 1050 732 C1150 725 1210 730 1250 735 L1250 800 L-50 800Z',
  ],
}

function HeroSvg({ theme }) {
  const t = THEMES[theme]
  const isSnow = theme === 'snow'
  const fade = { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.sky[0]} />
          <stop offset="40%" stopColor={t.sky[1]} />
          <stop offset="70%" stopColor={t.sky[2]} />
          <stop offset="100%" stopColor={t.sky[3]} />
        </linearGradient>
        <radialGradient id="hero-sun" cx="50%" cy="35%" r="15%">
          <stop offset="0%" stopColor={t.sun[0]} stopOpacity={t.sun[1]} />
          <stop offset="100%" stopColor={t.sun[2]} stopOpacity={t.sun[3]} />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#hero-sky)" />
      <circle cx="600" cy="280" r="180" fill="url(#hero-sun)" />
      {/* Sand ground — static paths, fade out when snow */}
      <motion.g initial={false} animate={{ opacity: isSnow ? 0 : 1 }} transition={fade}>
        {GROUND_PATHS.sand.map((d, i) => (
          <path key={i} d={d} fill={THEMES.sand.ground[i].color} fillOpacity={THEMES.sand.ground[i].opacity} />
        ))}
      </motion.g>
      {/* Snow ground — static paths, fade in when snow */}
      <motion.g initial={false} animate={{ opacity: isSnow ? 1 : 0 }} transition={fade}>
        {GROUND_PATHS.snow.map((d, i) => (
          <path key={i} d={d} fill={THEMES.snow.ground[i].color} fillOpacity={THEMES.snow.ground[i].opacity} />
        ))}
      </motion.g>
    </svg>
  )
}

function AnimatedName({ text, delay = 0, className: cls = '', style }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`font-calligraphy ${cls}`}
      style={style}
      aria-label={text}
    >
      {text}
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
      className="py-12 sm:py-16 relative z-10 "
    >
      <OrnamentalDivider className="max-w-xs mx-auto mb-10" />

      <div className="flex gap-4 sm:gap-6 justify-center px-4 max-w-4xl mx-auto">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40, rotate: i === 0 ? -3 : i === 2 ? 3 : 0 }}
            whileInView={{
              opacity: 1,
              y: 0,
              rotate: i === 0 ? -3 : i === 2 ? 3 : 0,
            }}
            viewport={{ once: true, margin: '0px 0px -100px 0px' }}
            transition={{ duration: 0.7, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            className="relative flex-1 max-w-[200px] sm:max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden
              shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
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

function ScrollGoldFoil({ children, delay, gradient }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], [-200, 200])
  const backgroundPosition = useMotionTemplate`${x}% center`

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
      className="text-lg font-display font-semibold tracking-wide drop-shadow-sm"
      style={{
        backgroundImage: gradient,
        backgroundSize: '250% auto',
        backgroundPosition,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
      }}
    >
      {children}
    </motion.p>
  )
}

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(null)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('wedding-theme') || 'sand'
      document.documentElement.setAttribute('data-theme', saved)
      document.documentElement.style.backgroundColor = THEMES[saved].bg
      return saved
    } catch { return 'sand' }
  })

  const handleThemeChange = (t) => {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    document.documentElement.style.backgroundColor = THEMES[t].bg
    try { localStorage.setItem('wedding-theme', t) } catch {}
  }

  const handleFormSubmit = (data) => {
    setFormData(data)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    notifyHost(data)
  }

  const handleBack = () => {
    setCurrentStep(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const t = THEMES[theme]

  return (
    <MotionConfig reducedMotion="user">
    <div
      data-theme={theme}
      className="min-h-screen relative overflow-x-hidden transition-colors duration-700"
      style={{ backgroundColor: t.bg }}
    >
      <ParticleSystem theme={theme} />
      <ThemeToggle theme={theme} onChange={handleThemeChange} />

      {/* Hero section with photo background */}
      {currentStep === 0 && (
        <section className="relative min-h-dvh flex flex-col items-center overflow-hidden">
          {/* Themed background */}
          <div className="absolute inset-0 z-0">
            <HeroSvg theme={theme} />
            <div className="absolute inset-0" style={{ background: t.overlay }} />
            <div className="absolute inset-0" style={{ background: t.tint }} />
          </div>

          {/* Top spacer — pushes names to center */}
          <div className="flex-1" />

          {/* Names & date — vertically centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative z-10 text-center px-4"
          >
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm uppercase tracking-[0.3em] mb-6 drop-shadow-sm"
              style={{ color: t.heroSub }}
            >
              Vous êtes invité(e) au mariage de
            </motion.p>

            <div>
              <AnimatedName
                text="Sandrine"
                delay={1.5}
                className="text-5xl sm:text-7xl leading-[1.1] mb-2 drop-shadow-sm"
                style={{ color: t.nameSandrine }}
              />
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 2.3, ease: 'easeOut' }}
                className="ornament text-2xl my-3 font-display italic"
                style={{ color: t.ampersand, '--ornament-line': t.ornamentLine }}
              >
                &
              </motion.div>
              <AnimatedName
                text="Rafik"
                delay={2.7}
                className="text-5xl sm:text-7xl leading-[1.1] drop-shadow-sm"
                style={{ color: t.nameRafik }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 3.8 }}
              className="mt-8 space-y-2"
            >
              <ScrollGoldFoil delay={3.8} gradient={t.goldGradient}>
                19 septembre 2026
              </ScrollGoldFoil>
              <p className="text-sm drop-shadow-sm" style={{ color: t.heroLight }}>
                Studio L'Éloi — Montréal
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom spacer — pushes CTA toward bottom */}
          <div className="flex-1" />

          {/* CTA + scroll hint — anchored near bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 4.4 }}
            className="relative z-10 text-center px-4 pb-6"
          >
            <motion.button
              onClick={scrollToForm}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-[var(--accent)] text-white rounded-full px-8 py-3.5 text-sm font-medium
                hover:bg-[var(--accent-hover)] shadow-lg hover:shadow-xl
                focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
                transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Commencer le formulaire
            </motion.button>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5.2, duration: 0.6 }}
              className="mt-6"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5 mx-auto" style={{ color: t.heroGhost }} />
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
            {currentStep === 0 && (
              <>
                <motion.div
                  className="text-center mb-10 sm:mb-14"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-5"
                    style={{ background: t.badgeBg, color: t.text }}>
                    <FileText className="w-3.5 h-3.5" />
                    Lettre d'invitation IRCC
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4 leading-[1.2] text-balance" style={{ color: t.text }}>
                    Générez votre lettre d'invitation
                  </h2>
                  <p className="text-base max-w-lg mx-auto leading-relaxed text-pretty" style={{ color: t.textSoft }}>
                    Remplissez le formulaire ci-dessous pour générer une lettre officielle
                    pour votre demande de visa visiteur au Canada.
                  </p>

                  <OrnamentalDivider className="mt-8 max-w-xs mx-auto" />
                </motion.div>
                <InvitationForm onSubmit={handleFormSubmit} initialData={formData} />
              </>
            )}

            {/* First visit: show form immediately if hero was skipped */}
            {currentStep >= 1 && formData && (
              <LetterPreview data={formData} onBack={handleBack} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t py-10 text-center transition-colors duration-700" style={{ borderColor: t.footerBorder }}>
        <OrnamentalDivider className="max-w-xs mx-auto mb-6" />
        <p className="font-display text-sm italic tracking-wide" style={{ color: t.textMuted }}>
          Mariage Sandrine & Rafik — 19 septembre 2026 — Montréal
        </p>
      </footer>
    </div>
    </MotionConfig>
  )
}

export default App
