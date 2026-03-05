import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import './index.css'

/* ═══════════════════════════════════════════════════════
   DESIGN LAB — 5 Hero Variations for Wedding Landing
   Navigate: ?lab=1 through ?lab=5, or no param for gallery
   ═══════════════════════════════════════════════════════ */

const COUPLE = { name1: 'Sandrine', name2: 'Rafik', date: '19 septembre 2026', venue: 'Studio L\'Éloi — Montréal' }

/* ── Variation 1: "The Reveal" ──
   Cinematic entrance. Screen starts black, a single line of light
   splits the screen, names type in one letter at a time, then the
   landscape fades up behind. Minimal, theatrical. */

function V1_TheReveal({ theme }) {
  const isSnow = theme === 'snow'
  const bg = isSnow ? '#0F1620' : '#FAF6F0'
  const fg = isSnow ? '#E4ECF4' : '#2A1808'
  const accent = isSnow ? '#5B8FAF' : '#C8952A'
  const muted = isSnow ? 'rgba(228,236,244,0.4)' : 'rgba(42,24,8,0.4)'
  const line = isSnow ? 'rgba(91,143,175,0.3)' : 'rgba(200,149,42,0.3)'

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: bg }}>
      {/* Horizontal reveal line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 right-0 h-px origin-center"
        style={{ top: '50%', backgroundColor: line }}
      />

      {/* Names — staggered letter reveal */}
      <div className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-xs uppercase tracking-[0.4em] mb-8"
          style={{ color: muted }}
        >
          Vous êtes invité(e) au mariage de
        </motion.p>

        <div className="font-calligraphy" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.1 }}>
          {COUPLE.name1.split('').map((ch, i) => (
            <motion.span
              key={`s-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
              style={{ color: fg, display: 'inline-block' }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="flex items-center gap-4 my-4 justify-center"
        >
          <div className="h-px flex-1 max-w-16" style={{ backgroundColor: line }} />
          <span className="font-display italic text-lg" style={{ color: accent }}>&</span>
          <div className="h-px flex-1 max-w-16" style={{ backgroundColor: line }} />
        </motion.div>

        <div className="font-calligraphy" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.1 }}>
          {COUPLE.name2.split('').map((ch, i) => (
            <motion.span
              key={`r-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
              style={{ color: fg, display: 'inline-block' }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 1 }}
          className="mt-10 space-y-1"
        >
          <p className="font-display text-lg tracking-wide" style={{ color: accent }}>{COUPLE.date}</p>
          <p className="text-sm" style={{ color: muted }}>{COUPLE.venue}</p>
        </motion.div>
      </div>

      {/* Subtle floating dots — ambient */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            backgroundColor: accent,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            y: [0, -20, -40],
          }}
          transition={{
            delay: 3 + Math.random() * 2,
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </section>
  )
}

/* ── Variation 2: "Split Screen" ──
   Screen split vertically — left is sand, right is snow.
   Names straddle the split. Toggle slides the divider.
   Interactive: hover left/right to peek. */

function V2_SplitScreen({ theme }) {
  const isSnow = theme === 'snow'
  const splitPos = isSnow ? '15%' : '85%'

  return (
    <section className="relative min-h-dvh overflow-hidden">
      {/* Sand side */}
      <div className="absolute inset-0" style={{ backgroundColor: '#FAF6F0' }} />

      {/* Snow side — clips from right */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: '#0F1620' }}
        initial={{ clipPath: 'inset(0 0 0 85%)' }}
        animate={{ clipPath: `inset(0 0 0 ${splitPos})` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Divider line */}
      <motion.div
        className="absolute top-0 bottom-0 w-px"
        style={{ backgroundColor: 'rgba(200,168,85,0.5)' }}
        initial={{ left: '85%' }}
        animate={{ left: splitPos }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Content — centered, mix-blend for contrast */}
      <div className="relative z-10 min-h-dvh flex flex-col items-center justify-center text-center px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xs uppercase tracking-[0.4em] mb-8"
          style={{ color: isSnow ? 'rgba(228,236,244,0.5)' : 'rgba(42,24,8,0.4)' }}
        >
          Vous êtes invité(e) au mariage de
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: isSnow ? '#E4ECF4' : '#C8952A', lineHeight: 1.1 }}
        >
          {COUPLE.name1}
        </motion.h2>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="font-display italic text-2xl my-2"
          style={{ color: isSnow ? '#5B8FAF' : '#3A2010' }}
        >
          &
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: isSnow ? '#E4ECF4' : '#C8952A', lineHeight: 1.1 }}
        >
          {COUPLE.name2}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="mt-10 space-y-1"
        >
          <p className="font-display text-lg tracking-wide" style={{ color: isSnow ? '#5B8FAF' : '#C8952A' }}>{COUPLE.date}</p>
          <p className="text-sm" style={{ color: isSnow ? 'rgba(228,236,244,0.4)' : 'rgba(42,24,8,0.4)' }}>{COUPLE.venue}</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Variation 3: "Floating Type" ──
   Large names float with parallax on mouse move.
   Extremely minimal — just type, space, and subtle motion.
   Each element has different parallax depth. */

function V3_FloatingType({ theme }) {
  const isSnow = theme === 'snow'
  const bg = isSnow ? '#0F1620' : '#FAF6F0'
  const fg = isSnow ? '#E4ECF4' : '#2A1808'
  const accent = isSnow ? '#5B8FAF' : '#C8952A'
  const muted = isSnow ? 'rgba(228,236,244,0.3)' : 'rgba(42,24,8,0.3)'

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width)
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height)
  }

  const px = (depth) => useTransform(smoothX, (v) => v * depth)
  const py = (depth) => useTransform(smoothY, (v) => v * depth)

  return (
    <section
      className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden cursor-default"
      style={{ backgroundColor: bg }}
      onMouseMove={handleMouse}
    >
      {/* Background accent circle — deepest layer */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '40vmax',
          height: '40vmax',
          background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)`,
          x: px(-30),
          y: py(-30),
        }}
      />

      <div className="relative z-10 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-xs uppercase tracking-[0.5em] mb-12"
          style={{ color: muted, x: px(-5), y: py(-5) }}
        >
          Vous êtes invité(e)
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', color: fg, lineHeight: 0.9, x: px(-15), y: py(-15) }}
        >
          {COUPLE.name1}
        </motion.h2>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="block font-display italic text-xl my-6"
          style={{ color: accent, x: px(-8), y: py(-8) }}
        >
          &
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', color: fg, lineHeight: 0.9, x: px(-20), y: py(-20) }}
        >
          {COUPLE.name2}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
          className="mt-16 space-y-2"
          style={{ x: px(-3), y: py(-3) }}
        >
          <p className="font-display text-base tracking-widest uppercase" style={{ color: accent }}>{COUPLE.date}</p>
          <p className="text-xs tracking-wider" style={{ color: muted }}>{COUPLE.venue}</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Variation 4: "Vertical Scroll Story" ──
   Content reveals as you scroll. Each element has its own
   scroll-triggered entrance. The page IS the animation. */

function V4_ScrollStory({ theme }) {
  const isSnow = theme === 'snow'
  const bg = isSnow ? '#0F1620' : '#FAF6F0'
  const fg = isSnow ? '#E4ECF4' : '#2A1808'
  const accent = isSnow ? '#5B8FAF' : '#C8952A'
  const muted = isSnow ? 'rgba(228,236,244,0.3)' : 'rgba(42,24,8,0.3)'
  const lineBg = isSnow ? 'rgba(91,143,175,0.15)' : 'rgba(200,149,42,0.15)'

  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section ref={containerRef} className="relative" style={{ backgroundColor: bg, height: '300vh' }}>
      {/* Vertical progress line */}
      <div className="fixed left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0" style={{ backgroundColor: lineBg }}>
        <motion.div className="w-full origin-top" style={{ backgroundColor: accent, height: lineHeight, opacity: 0.5 }} />
      </div>

      {/* Sticky content */}
      <div className="sticky top-0 min-h-dvh flex flex-col items-center justify-center text-center px-4 z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-xs uppercase tracking-[0.5em] mb-10"
          style={{ color: muted }}
        >
          Vous êtes invité(e) au mariage de
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: fg, lineHeight: 1 }}
        >
          {COUPLE.name1}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-6 my-4"
        >
          <div className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.4 }} />
          <span className="font-display italic text-xl" style={{ color: accent }}>&</span>
          <div className="h-px w-12" style={{ backgroundColor: accent, opacity: 0.4 }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: fg, lineHeight: 1 }}
        >
          {COUPLE.name2}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 space-y-2"
        >
          <p className="font-display text-lg tracking-wide" style={{ color: accent }}>{COUPLE.date}</p>
          <p className="text-sm" style={{ color: muted }}>{COUPLE.venue}</p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
            style={{ borderColor: muted }}
          >
            <motion.div
              animate={{ opacity: [1, 0], y: [0, 8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Variation 5: "The Curtain" ──
   Two panels (top/bottom) part like curtains on load,
   revealing the names underneath. Then particles begin.
   Dramatic, memorable entrance. */

function V5_TheCurtain({ theme }) {
  const isSnow = theme === 'snow'
  const bg = isSnow ? '#0F1620' : '#FAF6F0'
  const fg = isSnow ? '#E4ECF4' : '#2A1808'
  const accent = isSnow ? '#5B8FAF' : '#C8952A'
  const muted = isSnow ? 'rgba(228,236,244,0.3)' : 'rgba(42,24,8,0.3)'
  const curtainColor = isSnow ? '#0A1018' : '#F0E8DA'

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: bg }}>
      {/* Content underneath */}
      <div className="relative z-10 text-center px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="text-xs uppercase tracking-[0.4em] mb-10"
          style={{ color: muted }}
        >
          Vous êtes invité(e) au mariage de
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: fg, lineHeight: 1 }}
        >
          {COUPLE.name1}
        </motion.h2>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.5 }}
          className="block font-display italic text-2xl my-3"
          style={{ color: accent }}
        >
          &
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-calligraphy"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: fg, lineHeight: 1 }}
        >
          {COUPLE.name2}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 1 }}
          className="mt-12 space-y-2"
        >
          <p className="font-display text-lg tracking-wide" style={{ color: accent }}>{COUPLE.date}</p>
          <p className="text-sm" style={{ color: muted }}>{COUPLE.venue}</p>
        </motion.div>
      </div>

      {/* Top curtain */}
      <motion.div
        className="absolute inset-x-0 top-0 z-20"
        style={{ height: '50%', backgroundColor: curtainColor }}
        initial={{ y: 0 }}
        animate={{ y: '-100%' }}
        transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ backgroundColor: accent, opacity: 0.3 }} />
      </motion.div>

      {/* Bottom curtain */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-20"
        style={{ height: '50%', backgroundColor: curtainColor }}
        initial={{ y: 0 }}
        animate={{ y: '100%' }}
        transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute top-0 inset-x-0 h-px" style={{ backgroundColor: accent, opacity: 0.3 }} />
      </motion.div>

      {/* Ambient particles after curtain opens */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full z-10"
          style={{
            width: 1.5 + Math.random() * 2.5,
            height: 1.5 + Math.random() * 2.5,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: isSnow ? '#E4ECF4' : accent,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            y: isSnow ? [0, 30, 60] : [0, -10, -20],
          }}
          transition={{
            delay: 2 + Math.random() * 2,
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </section>
  )
}

/* ── Gallery / Lab Shell ── */

const VARIANTS = [
  { id: 1, name: 'The Reveal', desc: 'Cinematic letter-by-letter entrance with ambient floating dots', Component: V1_TheReveal },
  { id: 2, name: 'Split Screen', desc: 'Sand/snow split — the divider slides on toggle', Component: V2_SplitScreen },
  { id: 3, name: 'Floating Type', desc: 'Mouse-reactive parallax — each element at different depth', Component: V3_FloatingType },
  { id: 4, name: 'Scroll Story', desc: 'Vertical progress line — content reveals as you scroll', Component: V4_ScrollStory },
  { id: 5, name: 'The Curtain', desc: 'Dramatic top/bottom panels part to reveal names', Component: V5_TheCurtain },
]

export default function DesignLab() {
  const [active, setActive] = useState(null)
  const [theme, setTheme] = useState('sand')

  // Check URL for ?lab=N
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const lab = parseInt(p.get('lab'))
    if (lab >= 1 && lab <= 5) setActive(lab)
  }, [])

  const isSnow = theme === 'snow'

  // Full-screen single variation
  if (active) {
    const v = VARIANTS.find((v) => v.id === active)
    return (
      <div className="relative">
        <v.Component theme={theme} />
        {/* Controls overlay */}
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <button
            onClick={() => setActive(null)}
            className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border cursor-pointer"
            style={{
              background: isSnow ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderColor: isSnow ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
              color: isSnow ? '#E4ECF4' : '#2A1808',
            }}
          >
            ← Gallery
          </button>
          <button
            onClick={() => setTheme(isSnow ? 'sand' : 'snow')}
            className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl border cursor-pointer"
            style={{
              background: isSnow ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderColor: isSnow ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
              color: isSnow ? '#E4ECF4' : '#2A1808',
            }}
          >
            {isSnow ? '☀ Sand' : '❄ Snow'}
          </button>
        </div>
        <div className="fixed bottom-4 left-4 z-50">
          <p className="text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-xl"
            style={{
              background: isSnow ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: isSnow ? '#E4ECF4' : '#2A1808',
            }}
          >
            V{v.id}: {v.name}
          </p>
        </div>
      </div>
    )
  }

  // Gallery view
  return (
    <div className="min-h-dvh bg-neutral-950 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-white font-display text-2xl mb-2">Design Lab</h1>
        <p className="text-neutral-400 text-sm mb-8">5 hero variations — click to view full-screen. Toggle theme inside each.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v.id)}
              className="group text-left rounded-2xl overflow-hidden border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 scale-[0.35] origin-top-left" style={{ width: '285%', height: '285%', pointerEvents: 'none' }}>
                  <v.Component theme={theme} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />
              </div>
              <div className="p-4">
                <p className="text-white font-medium text-sm">V{v.id}: {v.name}</p>
                <p className="text-neutral-500 text-xs mt-1">{v.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setTheme('sand')}
            className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors ${theme === 'sand' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
          >
            ☀ Sand previews
          </button>
          <button
            onClick={() => setTheme('snow')}
            className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors ${theme === 'snow' ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
          >
            ❄ Snow previews
          </button>
        </div>
      </div>
    </div>
  )
}
