import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate, MotionConfig } from 'framer-motion'
import { FileText, ChevronDown } from 'lucide-react'
import '@theme-toggles/react/css/Simple.css'
import { Simple } from '@theme-toggles/react'
import InvitationForm from './components/InvitationForm'
import LetterPreview from './components/LetterPreview'
import ParticleSystem from './components/ParticleSystem'
import OrnamentalDivider from './components/OrnamentalDivider'
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
    nameSandrine: '#8B6020',
    nameRafik: '#8B6020',
    ampersand: '#8B6020',
    ornament: '#8B6020',
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

function ThemeToggle({ theme, onChange }) {
  const isSnow = theme === 'snow'
  return (
    <div
      className="fixed top-4 right-4 z-50"
      style={{ opacity: 0, animation: 'fade-in 0.4s ease-out 2s forwards' }}
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
    // Far distant snowbank — somber, in shadow
    'M-50 680 C100 670 250 645 400 620 C520 600 600 610 720 630 C850 620 950 600 1080 590 C1160 588 1220 600 1250 610 L1250 800 L-50 800Z',
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
        {/* Dune gradient fills — windward light, leeward shadow */}
        <linearGradient id="dune-back" x1="0.15" y1="0" x2="0.85" y2="0.4" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#D8B870" />
          <stop offset="30%" stopColor="#C8A050" />
          <stop offset="55%" stopColor="#A07830" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#C8A050" />
          <stop offset="100%" stopColor="#D8B870" />
        </linearGradient>
        <linearGradient id="dune-mid" x1="0.1" y1="0" x2="0.9" y2="0.3" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#DCBC78" />
          <stop offset="40%" stopColor="#D0AC60" />
          <stop offset="65%" stopColor="#B89048" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#DCBC78" />
        </linearGradient>
        <linearGradient id="dune-front" x1="0" y1="0" x2="1" y2="0.2" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#E4C888" />
          <stop offset="50%" stopColor="#D8BC70" />
          <stop offset="100%" stopColor="#E4C888" />
        </linearGradient>
        {/* Snowbank gradient fills — far=darkest, back=dark, mid=medium, front=bright */}
        <linearGradient id="snow-far" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#1E2A38" />
          <stop offset="100%" stopColor="#182230" />
        </linearGradient>
        <linearGradient id="snow-back" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#384858" />
          <stop offset="100%" stopColor="#2A3848" />
        </linearGradient>
        <linearGradient id="snow-mid" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#4A6078" />
          <stop offset="100%" stopColor="#3A5068" />
        </linearGradient>
        <linearGradient id="snow-front" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#5A7890" />
          <stop offset="100%" stopColor="#4A6880" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#hero-sky)" />
      <circle cx="600" cy="280" r="180" fill="url(#hero-sun)" />
      {/* Sand ground — static paths, fade out when snow */}
      <motion.g initial={false} animate={{ opacity: isSnow ? 0 : 1 }} transition={fade}>
        {/* Base dune fills with gradient shading */}
        <path d={GROUND_PATHS.sand[0]} fill="url(#dune-back)" fillOpacity="0.75" />
        <path d={GROUND_PATHS.sand[1]} fill="url(#dune-mid)" fillOpacity="0.6" />
        <path d={GROUND_PATHS.sand[2]} fill="url(#dune-front)" fillOpacity="0.5" />

        {/* Ridge lines — sharp crest edges where wind cuts */}
        <path d="M200 640 C260 610 310 580 340 565 C400 535 420 530 450 535" fill="none" stroke="#A07828" strokeWidth="1.5" strokeOpacity="0.25" />
        <path d="M640 615 C720 595 820 555 940 505 C1000 485 1020 482 1050 490" fill="none" stroke="#A07828" strokeWidth="1.5" strokeOpacity="0.2" />

        {/* Mid dune ridge */}
        <path d="M100 720 C200 700 320 660 480 625 C500 630 520 635 560 645" fill="none" stroke="#B89048" strokeWidth="1" strokeOpacity="0.2" />

        {/* Wind ripple ridges on back dune — subtle parallel contour lines */}
        <path d="M-50 590 C80 575 200 545 340 505 C420 485 500 500 600 530 C720 520 820 490 960 460 C1040 448 1100 465 1250 505" fill="none" stroke="#C8A858" strokeWidth="0.8" strokeOpacity="0.12" />
        <path d="M-50 620 C80 605 200 575 340 535 C420 515 500 530 600 558 C720 548 820 518 960 480 C1040 468 1100 490 1250 530" fill="none" stroke="#C8A858" strokeWidth="0.7" strokeOpacity="0.10" />
        <path d="M-50 650 C100 640 220 610 360 580 C440 565 520 575 640 595 C740 585 840 562 980 535 C1060 525 1140 540 1250 565" fill="none" stroke="#C8A858" strokeWidth="0.6" strokeOpacity="0.08" />

        {/* Wind ripple ridges on mid dune */}
        <path d="M-50 690 C100 680 250 658 400 638 C480 628 540 635 680 655 C800 645 940 625 1120 618 C1180 622 1220 635 1250 645" fill="none" stroke="#C8A858" strokeWidth="0.6" strokeOpacity="0.10" />
        <path d="M-50 710 C100 702 260 680 420 660 C500 652 560 658 700 672 C820 665 960 648 1130 642 C1190 646 1230 656 1250 662" fill="none" stroke="#C8A858" strokeWidth="0.5" strokeOpacity="0.08" />
      </motion.g>
      {/* Snow ground — static paths, fade in when snow */}
      <motion.g initial={false} animate={{ opacity: isSnow ? 1 : 0 }} transition={fade}>
        <path d={GROUND_PATHS.snow[0]} fill="url(#snow-far)" fillOpacity="0.9" />
        <path d={GROUND_PATHS.snow[1]} fill="url(#snow-back)" fillOpacity="0.85" />
        <path d={GROUND_PATHS.snow[2]} fill="url(#snow-mid)" fillOpacity="0.8" />
        <path d={GROUND_PATHS.snow[3]} fill="url(#snow-front)" fillOpacity="0.75" />
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
      className="font-display font-semibold tracking-widest uppercase drop-shadow-sm"
      style={{
        fontSize: 'clamp(1rem, 0.8rem + 0.6vw, 1.25rem)',
        backgroundImage: gradient,
        backgroundSize: '250% auto',
        backgroundPosition,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
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
      return saved
    } catch { return 'sand' }
  })

  const handleThemeChange = (t) => {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    try { localStorage.setItem('wedding-theme', t) } catch {}
  }

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
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const t = THEMES[theme]

  // Garage door — hero slides up as you scroll, revealing content below
  const heroWrapperRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroWrapperRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroScroll, [0.1, 0.85], ['0%', '-100%'])

  return (
    <MotionConfig reducedMotion="user">
    <div
      data-theme={theme}
      className="min-h-screen relative overflow-x-hidden transition-colors duration-700"
      style={{ backgroundColor: t.bg }}
    >
      <div className="grain-overlay" aria-hidden="true" />
      <ThemeToggle theme={theme} onChange={handleThemeChange} />

      {/* Hero — garage door: slides up on scroll to reveal form */}
      {currentStep === 0 && (
        <div ref={heroWrapperRef} className="relative" style={{ height: '140vh' }}>
        <motion.section
          className="sticky top-0 h-dvh flex flex-col items-center overflow-hidden z-20"
          style={{ y: heroY, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        >
          {/* Themed background */}
          <div className="absolute inset-0 z-0">
            <HeroSvg theme={theme} />
            <div className="absolute inset-0" style={{ background: t.overlay }} />
            <div className="absolute inset-0" style={{ background: t.tint }} />
            <ParticleSystem theme={theme} />
          </div>

          {/* Top spacer — pushes names to center, shrinks on small screens */}
          <div className="flex-1 min-h-8 sm:min-h-0" />

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
              className="uppercase tracking-[0.4em] mb-8 drop-shadow-sm"
              style={{ color: t.heroSub, fontSize: 'clamp(0.65rem, 0.5rem + 0.4vw, 0.85rem)' }}
            >
              Vous êtes invité(e) au mariage de
            </motion.p>

            <div>
              <AnimatedName
                text="Sandrine"
                delay={1.5}
                className="leading-[1] mb-2 drop-shadow-sm"
                style={{ color: t.nameSandrine, fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
              />
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 2.3, ease: 'easeOut' }}
                className="ornament my-4 font-display italic"
                style={{ color: t.ampersand, '--ornament-line': t.ornamentLine, fontSize: 'clamp(1.25rem, 1rem + 0.8vw, 1.75rem)' }}
              >
                &
              </motion.div>
              <AnimatedName
                text="Rafik"
                delay={2.7}
                className="leading-[1] drop-shadow-sm"
                style={{ color: t.nameRafik, fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 3.8 }}
              className="mt-12 space-y-2"
            >
              <ScrollGoldFoil delay={3.8} gradient={t.goldGradient}>
                19 septembre 2026
              </ScrollGoldFoil>
              <p className="tracking-wider drop-shadow-sm" style={{ color: t.heroLight, fontSize: 'clamp(0.75rem, 0.6rem + 0.4vw, 0.9rem)' }}>
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
        </motion.section>
        </div>
      )}


      {/* Main — pulled up behind the hero so it's revealed as the door opens */}
      <main
        id="form-section"
        className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10"
        style={currentStep === 0 ? { marginTop: '-40vh', backgroundColor: t.bg } : undefined}
      >
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
