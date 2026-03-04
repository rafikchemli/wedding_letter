import { useRef, useEffect } from 'react'

/* ── Snow: particles that fall hard at an angle ── */

const SNOW = {
  count: 65,
  mobileCount: 30,
  colors: ['#FFFFFF', '#E8EFF8', '#D0DCE8', '#F0F4FA'],
  sizeRange: [2, 6],
  opacityRange: [0.4, 0.85],
}

function createSnowflake(w, h, scattered) {
  const size = SNOW.sizeRange[0] + Math.random() * (SNOW.sizeRange[1] - SNOW.sizeRange[0])
  return {
    x: scattered ? Math.random() * w : Math.random() * w * 1.5 - w * 0.25,
    y: scattered ? Math.random() * h : -(Math.random() * h * 0.2 + size),
    size,
    color: SNOW.colors[Math.floor(Math.random() * SNOW.colors.length)],
    opacity: SNOW.opacityRange[0] + Math.random() * (SNOW.opacityRange[1] - SNOW.opacityRange[0]),
    // Each flake has its own fall speed + slight horizontal drift
    fallSpeed: 1.2 + Math.random() * 2.0,
    drift: 0.3 + Math.random() * 0.8, // consistent rightward angle
    // Small wobble — NOT floaty, just a slight jitter
    wobbleAmp: 0.2 + Math.random() * 0.5,
    wobbleFreq: 2 + Math.random() * 3,
    phase: Math.random() * Math.PI * 2,
  }
}

function animateSnow(ctx, particles, w, h, time) {
  // Gusts add bursts of sideways push
  const gust = Math.sin(time * 0.15) > 0.5
    ? (Math.sin(time * 0.15) - 0.5) * 4 * Math.sin(time * 2.5)
    : 0

  for (const p of particles) {
    const wobble = Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp

    p.y += p.fallSpeed
    p.x += p.drift + wobble + gust * (0.5 / p.size)

    // Recycle
    if (p.y > h + p.size) {
      Object.assign(p, createSnowflake(w, h, false))
    }
    if (p.x > w + p.size * 2) p.x = -p.size * 2
    if (p.x < -p.size * 2) p.x = w + p.size * 2

    // Draw — simple circle
    ctx.globalAlpha = p.opacity
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    // Subtle highlight
    ctx.globalAlpha = p.opacity * 0.3
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(p.x - p.size * 0.2, p.y - p.size * 0.2, p.size * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Sand: individual grains blowing across the screen ── */

const SAND = {
  count: 55,
  mobileCount: 25,
  colors: ['#D4A96A', '#C49A5A', '#E8C88A', '#B8894A', '#CDAA70'],
  sizeRange: [1.5, 4],
  opacityRange: [0.3, 0.7],
}

function createSandGrain(w, h, scattered) {
  const size = SAND.sizeRange[0] + Math.random() * (SAND.sizeRange[1] - SAND.sizeRange[0])
  return {
    x: scattered ? Math.random() * w : -(Math.random() * w * 0.2 + size),
    y: scattered ? Math.random() * h : Math.random() * h,
    size,
    color: SAND.colors[Math.floor(Math.random() * SAND.colors.length)],
    opacity: SAND.opacityRange[0] + Math.random() * (SAND.opacityRange[1] - SAND.opacityRange[0]),
    // Mostly horizontal wind with slight downward drift
    windSpeed: 1.0 + Math.random() * 2.5,
    fall: 0.2 + Math.random() * 0.6,
    // Vertical wobble — sand jitters up and down
    wobbleAmp: 0.3 + Math.random() * 0.8,
    wobbleFreq: 2 + Math.random() * 4,
    phase: Math.random() * Math.PI * 2,
  }
}

function animateSand(ctx, particles, w, h, time) {
  // Wind gusts — bursts of extra horizontal push
  const gust = Math.sin(time * 0.12) > 0.4
    ? (Math.sin(time * 0.12) - 0.4) * 5 * Math.sin(time * 1.8)
    : 0

  for (const p of particles) {
    const wobble = Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp

    p.x += p.windSpeed + gust * (0.4 / p.size)
    p.y += p.fall + wobble

    // Recycle — grain exits right, respawn from left
    if (p.x > w + p.size * 2) {
      Object.assign(p, createSandGrain(w, h, false))
    }
    if (p.y > h + p.size) { p.y = -p.size; p.x = Math.random() * w * 0.7 }
    if (p.y < -p.size * 2) p.y = h + p.size

    // Draw — small circle
    ctx.globalAlpha = p.opacity
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Cursor trail particles ── */

const TRAIL_MAX = 80

function spawnTrailParticle(x, y, isSnow) {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.3 + Math.random() * 1.2
  if (isSnow) {
    return {
      x, y,
      vx: Math.cos(angle) * speed * 0.5,
      vy: 0.5 + Math.random() * 1.5,
      size: 1.5 + Math.random() * 2.5,
      life: 1,
      decay: 0.005 + Math.random() * 0.005,
      color: SNOW.colors[Math.floor(Math.random() * SNOW.colors.length)],
    }
  }
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 0.3,
    size: 1 + Math.random() * 2,
    life: 1,
    decay: 0.006 + Math.random() * 0.006,
    color: SAND.colors[Math.floor(Math.random() * SAND.colors.length)],
  }
}

function animateTrail(ctx, trail) {
  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i]
    p.x += p.vx
    p.y += p.vy
    p.life -= p.decay
    if (p.life <= 0) { trail.splice(i, 1); continue }

    ctx.globalAlpha = p.life * 0.7
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Main component ── */

export default function ParticleSystem({ theme = 'sand' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let running = true
    let raf = null
    let time = 0

    const isMobile = window.innerWidth < 640

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()

    const w = window.innerWidth
    const h = window.innerHeight

    // Create particles based on theme
    const items = theme === 'snow'
      ? Array.from({ length: isMobile ? SNOW.mobileCount : SNOW.count }, () => createSnowflake(w, h, true))
      : Array.from({ length: isMobile ? SAND.mobileCount : SAND.count }, () => createSandGrain(w, h, true))

    // Cursor trail
    const trail = []
    let mouseX = -100, mouseY = -100
    const isSnow = theme === 'snow'

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // Spawn 2-3 particles per move event
      const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        if (trail.length < TRAIL_MAX) {
          trail.push(spawnTrailParticle(mouseX, mouseY, isSnow))
        }
      }
    }

    if (!isMobile) {
      window.addEventListener('mousemove', onMouseMove)
    }

    const animate = () => {
      if (!running) return
      const w = window.innerWidth
      const h = window.innerHeight

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      time += 0.016

      if (theme === 'snow') {
        animateSnow(ctx, items, w, h, time)
      } else {
        animateSand(ctx, items, w, h, time)
      }

      // Draw cursor trail on top
      if (trail.length > 0) {
        animateTrail(ctx, trail)
      }

      raf = requestAnimationFrame(animate)
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mq.matches) {
      raf = requestAnimationFrame(animate)
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf)
        raf = null
      } else if (!mq.matches && running) {
        raf = requestAnimationFrame(animate)
      }
    }

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
