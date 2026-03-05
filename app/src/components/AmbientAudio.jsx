import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

const AUDIO_SRC = {
  snow: '/audio/snow-ambient.mp3',
  sand: '/audio/sand-ambient.mp3',
}

const TRACK_NAMES = {
  snow: 'Secunda — Jeremy Soule',
  sand: 'Nascence — Austin Wintory',
}

const MAX_VOLUME = 1.0
const CROSSFADE_MS = 1500
const FADE_IN_MS = 1200
const LOOP_FADE_MS = 2000
const PILL_SHOW_MS = 2500

function easeInOut(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function AmbientAudio({ theme = 'sand' }) {
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showPill, setShowPill] = useState(false)
  const [nudge, setNudge] = useState(false)

  const audioRef = useRef({ snow: null, sand: null })
  const fadingRef = useRef(null)
  const activeThemeRef = useRef(theme)
  const wasPlayingRef = useRef(false)
  const pillTimerRef = useRef(null)
  const playingRef = useRef(false)
  const loopFadeRef = useRef(null)

  // Sync playing state to ref for Audio ended listeners
  useEffect(() => { playingRef.current = playing }, [playing])

  /* ── Show pill briefly ── */
  const flashPill = useCallback(() => {
    setShowPill(true)
    if (pillTimerRef.current) clearTimeout(pillTimerRef.current)
    pillTimerRef.current = setTimeout(() => setShowPill(false), PILL_SHOW_MS)
  }, [])

  /* ── Get or create an Audio element ── */
  const getAudio = useCallback((key) => {
    if (!audioRef.current[key]) {
      const a = new Audio(AUDIO_SRC[key])
      a.loop = false
      a.volume = 0
      a.preload = 'auto'

      // Manual loop with fade-in for seamless seam
      a.addEventListener('ended', () => {
        if (activeThemeRef.current === key && playingRef.current) {
          a.currentTime = 0
          a.volume = 0
          a.play().catch(() => {})
          const start = performance.now()
          function loopIn(now) {
            const t = Math.min((now - start) / LOOP_FADE_MS, 1)
            a.volume = MAX_VOLUME * easeInOut(t)
            if (t < 1) {
              loopFadeRef.current = requestAnimationFrame(loopIn)
            } else {
              loopFadeRef.current = null
            }
          }
          loopFadeRef.current = requestAnimationFrame(loopIn)
        }
      })

      audioRef.current[key] = a
    }
    return audioRef.current[key]
  }, [])

  /* ── Stop any running rAF fade ── */
  const cancelFade = useCallback(() => {
    if (fadingRef.current) {
      cancelAnimationFrame(fadingRef.current)
      fadingRef.current = null
    }
    if (loopFadeRef.current) {
      cancelAnimationFrame(loopFadeRef.current)
      loopFadeRef.current = null
    }
  }, [])

  /* ── Hard-stop a specific track (instant, no fade) ── */
  const stopTrack = useCallback((key) => {
    const a = audioRef.current[key]
    if (a) {
      a.pause()
      a.volume = 0
    }
  }, [])

  /* ── Hard-stop ALL tracks ── */
  const stopAll = useCallback(() => {
    cancelFade()
    Object.keys(audioRef.current).forEach(stopTrack)
  }, [cancelFade, stopTrack])

  /* ── rAF-based crossfade — starts from CURRENT volumes ── */
  const crossfade = useCallback((fromKey, toKey) => {
    cancelFade()

    const from = audioRef.current[fromKey]
    const to = getAudio(toKey)

    const fromVol = from ? from.volume : 0
    const toVol = to.volume || 0

    if (to.paused) {
      to.volume = toVol
      to.play().catch(() => {})
    }

    const start = performance.now()

    function tick(now) {
      const t = Math.min((now - start) / CROSSFADE_MS, 1)
      const ease = easeInOut(t)

      if (from) from.volume = fromVol * (1 - ease)
      to.volume = toVol + (MAX_VOLUME - toVol) * ease

      if (t < 1) {
        fadingRef.current = requestAnimationFrame(tick)
      } else {
        if (from) {
          from.pause()
          from.volume = 0
        }
        fadingRef.current = null
      }
    }

    fadingRef.current = requestAnimationFrame(tick)
    activeThemeRef.current = toKey
  }, [getAudio, cancelFade])

  /* ── Autoplay on mount — if browser allows, great; if not, button shows muted ── */
  useEffect(() => {
    const audio = getAudio(theme)
    activeThemeRef.current = theme
    audio.volume = MAX_VOLUME
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => { setNudge(true) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Delayed button entrance — after hero sequence completes ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      if (playing || nudge) flashPill()
    }, 4000)
    return () => clearTimeout(timer)
  }, [playing, nudge, flashPill])

  /* ── Theme change → crossfade if playing, otherwise just update ref ── */
  useEffect(() => {
    if (!playing) {
      stopAll()
      activeThemeRef.current = theme
      return
    }
    if (activeThemeRef.current === theme) return

    crossfade(activeThemeRef.current, theme)
    flashPill()
  }, [theme, playing, crossfade, flashPill, stopAll])

  /* ── Play / Pause toggle ── */
  const toggle = useCallback(() => {
    if (playing) {
      // Stop everything
      stopAll()
      setPlaying(false)
      setShowPill(false)
      if (pillTimerRef.current) clearTimeout(pillTimerRef.current)
    } else {
      // Play the current theme's track with fade-in
      cancelFade()
      const otherKey = theme === 'snow' ? 'sand' : 'snow'
      stopTrack(otherKey)

      const audio = getAudio(theme)
      activeThemeRef.current = theme
      audio.volume = 0
      audio.play().catch(() => {})

      // Pre-authorize the OTHER track so crossfade can .play() it from a useEffect later
      // (browsers require user-gesture for first .play() on each Audio element)
      const other = getAudio(otherKey)
      other.volume = 0
      other.play().then(() => { other.pause(); other.currentTime = 0 }).catch(() => {})

      setNudge(false)
      const start = performance.now()
      function fadeIn(now) {
        const t = Math.min((now - start) / FADE_IN_MS, 1)
        audio.volume = MAX_VOLUME * easeInOut(t)
        if (t < 1) {
          fadingRef.current = requestAnimationFrame(fadeIn)
        } else {
          fadingRef.current = null
        }
      }
      fadingRef.current = requestAnimationFrame(fadeIn)
      setPlaying(true)
      flashPill()
    }
  }, [playing, theme, getAudio, flashPill, cancelFade, stopAll, stopTrack])

  /* ── Visibility API ── */
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        wasPlayingRef.current = playing
        if (playing) {
          // Pause all (could be mid-crossfade with two tracks)
          Object.values(audioRef.current).forEach(a => { if (a && !a.paused) a.pause() })
        }
      } else if (wasPlayingRef.current) {
        // Resume only the active theme's track
        const current = audioRef.current[activeThemeRef.current]
        if (current) current.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [playing])

  /* ── Keyboard shortcut: M to mute/unmute ── */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'm' || e.key === 'M') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
        toggle()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [toggle])

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      cancelFade()
      if (pillTimerRef.current) clearTimeout(pillTimerRef.current)
      Object.values(audioRef.current).forEach(a => {
        if (a) a.pause()
      })
    }
  }, [cancelFade])

  if (!visible) return null

  const trackName = TRACK_NAMES[theme]

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-0">
      <motion.button
        onClick={toggle}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        aria-label={playing ? 'Couper le son ambiant' : 'Jouer le son ambiant'}
        className="relative flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-md cursor-pointer border transition-colors shrink-0"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)',
          borderColor: 'color-mix(in srgb, var(--text) 15%, transparent)',
          color: 'var(--text)',
        }}
      >
        <AnimatePresence>
          {playing && (
            <motion.span
              key="ring"
              className="absolute inset-0 rounded-full"
              style={{
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderColor: 'color-mix(in srgb, var(--text) 25%, transparent)',
              }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {playing ? (
            <motion.span
              key="vol-on"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center"
            >
              <Volume2 size={18} strokeWidth={1.8} />
            </motion.span>
          ) : (
            <motion.span
              key="vol-off"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center"
            >
              <VolumeX size={18} strokeWidth={1.8} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showPill && (playing || nudge) && (
          <motion.div
            key="pill"
            initial={{ opacity: 0, width: 0, x: -8 }}
            animate={{ opacity: 1, width: 'auto', x: 0 }}
            exit={{ opacity: 0, width: 0, x: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden ml-2"
          >
            <div
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] tracking-wide backdrop-blur-md border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--surface) 60%, transparent)',
                borderColor: 'color-mix(in srgb, var(--text) 12%, transparent)',
                color: 'var(--text-muted)',
              }}
            >
              {playing ? trackName : '♫ Ambiance musicale'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
