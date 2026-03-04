import { useRef, useEffect } from 'react'
import { createNoise3D } from 'simplex-noise'

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

/* ── Sand: particles blow off the SVG dune crests ── */

const SAND = {
  colors: ['#D4A96A', '#C49A5A', '#E8C88A', '#B8894A', '#CDAA70'],
  dustColors: ['#E8D8B8', '#F0E0C0', '#D8C8A0'],
}

const SAND_COUNTS = {
  streaks:   { desktop: 600, mobile: 250 },
  grains:    { desktop: 1000, mobile: 400 },
  dustMotes: { desktop: 400, mobile: 150 },
}

function pickColor(arr) { return arr[Math.floor(Math.random() * arr.length)] }

/* ── Dune crest mapping ──
   SVG viewBox is 0 0 1200 800, rendered with xMidYMid slice on a 100vh hero.
   These are key crest points sampled from GROUND_PATHS.sand in App.jsx.
   We convert SVG coords → screen coords at runtime. */

// Crest sample points [svgX, svgY] — the ridgelines of each dune
const DUNE_CRESTS = [
  // Back dune — dramatic high crests
  [[0, 700], [200, 640], [340, 565], [420, 530], [450, 535], [560, 600], [640, 615],
   [820, 555], [940, 505], [1020, 482], [1050, 490], [1180, 575], [1250, 600]],
  // Mid dune — rounder bumps
  [[0, 740], [200, 700], [350, 655], [480, 625], [520, 635], [700, 675], [820, 650],
   [1040, 615], [1120, 625], [1250, 665]],
  // Front dune — gentle ridge
  [[0, 760], [350, 738], [500, 722], [680, 710], [760, 718], [1050, 740], [1250, 735]],
]

// Convert SVG viewBox coords → screen coords (xMidYMid slice)
function svgToScreen(svgX, svgY, w, h) {
  const scale = Math.max(w / 1200, h / 800)
  const ox = (w - 1200 * scale) / 2
  const oy = (h - 800 * scale) / 2
  return { x: svgX * scale + ox, y: svgY * scale + oy }
}

// Linearly interpolate along a crest polyline at parameter t ∈ [0,1]
function sampleCrest(crest, t, w, h) {
  const n = crest.length - 1
  const i = Math.min(Math.floor(t * n), n - 1)
  const f = (t * n) - i
  const ax = crest[i][0], ay = crest[i][1]
  const bx = crest[i + 1][0], by = crest[i + 1][1]
  return svgToScreen(ax + (bx - ax) * f, ay + (by - ay) * f, w, h)
}

// Pick a random point on a random dune crest
function randomCrestPoint(w, h, duneIndex) {
  const idx = duneIndex ?? Math.floor(Math.random() * DUNE_CRESTS.length)
  const t = Math.random()
  return { ...sampleCrest(DUNE_CRESTS[idx], t, w, h), dune: idx }
}

// Streaks — fast elongated particles blown off dune ridges
function createStreak(w, h, scattered) {
  const { x, y, dune } = randomCrestPoint(w, h)
  // If scattered (init), spread along the travel path; otherwise start at crest
  const travelX = scattered ? Math.random() * w * 0.4 : 0
  const travelY = scattered ? -(Math.random() * 30) : 0
  return {
    kind: 'streak',
    x: x + travelX,
    y: y + travelY,
    spawnY: y,
    length: 5 + Math.random() * 12,
    thickness: 0.3 + Math.random() * 0.6,
    color: pickColor(SAND.colors),
    opacity: 0.25 + Math.random() * 0.35,
    windSpeed: 2.5 + Math.random() * 3.0,
    drift: -(0.3 + Math.random() * 0.8), // blow upward off crest
    wobbleAmp: 0.15 + Math.random() * 0.3,
    wobbleFreq: 1.5 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    life: scattered ? Math.random() : 1,
    decay: 0.002 + Math.random() * 0.003,
  }
}

// Grains — round dots that lift off the dune and arc back down
function createGrain(w, h, scattered) {
  const { x, y, dune } = randomCrestPoint(w, h)
  const travelX = scattered ? Math.random() * w * 0.3 : 0
  const travelY = scattered ? -(Math.random() * 60) + Math.random() * 30 : 0
  return {
    kind: 'grain',
    x: x + travelX,
    y: y + travelY,
    spawnY: y,
    size: 0.5 + Math.random() * 1.5,
    color: pickColor(SAND.colors),
    opacity: 0.2 + Math.random() * 0.45,
    windSpeed: 1.0 + Math.random() * 2.0,
    lift: -(0.4 + Math.random() * 1.0),  // initial upward velocity
    fall: 0.015 + Math.random() * 0.03,   // gravity pulls back
    vy: scattered ? (Math.random() - 0.5) * 0.5 : -(0.4 + Math.random() * 1.0),
    wobbleAmp: 0.3 + Math.random() * 0.6,
    wobbleFreq: 2 + Math.random() * 3,
    phase: Math.random() * Math.PI * 2,
    life: scattered ? Math.random() : 1,
    decay: 0.0015 + Math.random() * 0.003,
  }
}

// Dust motes — tiny particles that rise high off the crests
function createDustMote(w, h, scattered) {
  const { x, y } = randomCrestPoint(w, h)
  const travelX = scattered ? Math.random() * w * 0.5 : 0
  const travelY = scattered ? -(Math.random() * 120) : 0
  return {
    kind: 'dust',
    x: x + travelX,
    y: y + travelY,
    spawnY: y,
    size: 0.8 + Math.random() * 1.5,
    color: pickColor(SAND.dustColors),
    opacity: 0.06 + Math.random() * 0.14,
    windSpeed: 0.15 + Math.random() * 0.4,
    lift: -(0.1 + Math.random() * 0.3),
    wobbleAmp: 0.5 + Math.random() * 1.0,
    wobbleFreq: 0.5 + Math.random() * 1.0,
    phase: Math.random() * Math.PI * 2,
    pulseFreq: 0.3 + Math.random() * 0.5,
    life: scattered ? Math.random() : 1,
    decay: 0.001 + Math.random() * 0.002,
  }
}

function createSandParticles(w, h, isMobile) {
  const key = isMobile ? 'mobile' : 'desktop'
  return [
    ...Array.from({ length: SAND_COUNTS.streaks[key] }, () => createStreak(w, h, true)),
    ...Array.from({ length: SAND_COUNTS.grains[key] }, () => createGrain(w, h, true)),
    ...Array.from({ length: SAND_COUNTS.dustMotes[key] }, () => createDustMote(w, h, true)),
  ]
}

/* ── Simplex noise wind field ── */

const GRID_CELL = 40 // px per grid cell
const noise3D = createNoise3D()

// Cached wind grid — updated once per frame, sampled by all particles
let windGrid = { cols: 0, rows: 0, vx: [], vy: [] }

function updateWindGrid(w, h, time) {
  const cols = Math.ceil(w / GRID_CELL) + 1
  const rows = Math.ceil(h / GRID_CELL) + 1

  // Realloc only if canvas resized
  if (windGrid.cols !== cols || windGrid.rows !== rows) {
    const len = cols * rows
    windGrid = { cols, rows, vx: new Float32Array(len), vy: new Float32Array(len) }
  }

  // Large-scale prevailing wind (slowly shifts direction)
  const prevailAngle = noise3D(0, 0, time * 0.02) * 0.3 // ±0.3 rad from east
  const prevailX = Math.cos(prevailAngle) * 1.8
  const prevailY = Math.sin(prevailAngle) * 0.4

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      // Turbulence layer — spatially varying, evolves over time
      const angle = noise3D(c * 0.08, r * 0.08, time * 0.1) * Math.PI * 2
      // Magnitude layer — separate noise octave for intensity variation
      const mag = (noise3D(c * 0.05 + 100, r * 0.05 + 100, time * 0.06) + 1) * 0.5
      windGrid.vx[idx] = prevailX + Math.cos(angle) * mag * 1.2
      windGrid.vy[idx] = prevailY + Math.sin(angle) * mag * 0.6
    }
  }
}

function sampleWind(x, y) {
  const c = (x / GRID_CELL) | 0
  const r = (y / GRID_CELL) | 0
  const cc = Math.min(c, windGrid.cols - 1)
  const rr = Math.min(r, windGrid.rows - 1)
  const idx = Math.max(0, rr * windGrid.cols + cc)
  return { wx: windGrid.vx[idx] || 0, wy: windGrid.vy[idx] || 0 }
}

function animateSand(ctx, particles, w, h, time) {
  // Update wind field once per frame
  updateWindGrid(w, h, time)

  for (const p of particles) {
    const { wx, wy } = sampleWind(p.x, p.y)
    const wobble = Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp

    // Life fades — respawn at crest when dead or offscreen
    p.life -= p.decay
    const offscreen = p.x > w + 20 || p.x < -20 || p.y > h + 20 || p.y < -60

    if (p.kind === 'streak') {
      if (p.life <= 0 || offscreen) {
        Object.assign(p, createStreak(w, h, false))
        continue
      }

      // Streaks ride wind hard, drift upward off the crest
      p.x += p.windSpeed + wx * 1.5
      p.y += p.drift + wy * 0.5 + wobble

      // Draw — rotated elongated ellipse aligned to local wind
      const windAngle = Math.atan2(p.drift + wy * 0.5, p.windSpeed + wx * 1.5)
      ctx.globalAlpha = p.opacity * p.life
      ctx.fillStyle = p.color
      ctx.save()
      ctx.translate(p.x | 0, p.y | 0)
      ctx.rotate(windAngle)
      ctx.beginPath()
      ctx.ellipse(0, 0, p.length / 2, p.thickness / 2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

    } else if (p.kind === 'grain') {
      if (p.life <= 0 || offscreen) {
        Object.assign(p, createGrain(w, h, false))
        continue
      }

      // Grains lift off the crest then arc back down (gravity)
      p.vy += p.fall  // gravity accumulates
      p.x += p.windSpeed + wx * 0.8
      p.y += p.vy + wy * 0.3 + wobble

      // Depth-based color — warmer/darker near dune, lighter when airborne
      const heightAboveCrest = Math.max(0, p.spawnY - p.y)
      const airborne = Math.min(1, heightAboveCrest / 80)
      const hue = 35 + (1 - airborne) * 10
      const sat = 55 + (1 - airborne) * 15
      const lit = 58 + airborne * 16  // lighter when high in air

      ctx.globalAlpha = p.opacity * p.life
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`
      ctx.beginPath()
      ctx.arc(p.x | 0, p.y | 0, p.size, 0, Math.PI * 2)
      ctx.fill()

    } else {
      // Dust motes — rise gently from crests, shimmer
      if (p.life <= 0 || offscreen) {
        Object.assign(p, createDustMote(w, h, false))
        continue
      }

      p.x += p.windSpeed + wx * 0.3
      p.y += p.lift + wy * 0.1 + wobble * 0.3

      // Pulsing opacity — catches the light
      const shimmer = 0.7 + 0.3 * Math.sin(time * p.pulseFreq + p.phase)
      const alpha = p.opacity * p.life * shimmer

      // Soft glow halo
      ctx.globalAlpha = alpha * 0.3
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x | 0, p.y | 0, p.size * 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Core
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(p.x | 0, p.y | 0, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/* ── Ground streams — dense sand fog hugging the bottom ── */

const STREAM_COUNTS = { desktop: 300, mobile: 120 }

function createStreamParticle(w, h, scattered) {
  // Spawn from the front dune crest, hugging it closely
  const { x: cx, y: cy } = randomCrestPoint(w, h, 2) // front dune
  const floor = cy - 5  // just above front crest
  const depthBias = Math.pow(Math.random(), 0.5)
  return {
    x: scattered ? Math.random() * w : -(Math.random() * w * 0.3),
    y: floor + depthBias * (h - floor),
    size: 0.3 + Math.random() * 0.9,
    length: 3 + Math.random() * 8,
    color: pickColor(SAND.colors),
    opacity: 0.08 + Math.random() * 0.22,
    speed: 3.0 + Math.random() * 4.0,
    phase: Math.random() * Math.PI * 2,
    wobbleFreq: 1 + Math.random() * 2,
    wobbleAmp: 0.2 + Math.random() * 0.5,
    yHome: cy,
  }
}

function createStreamParticles(w, h, isMobile) {
  const count = isMobile ? STREAM_COUNTS.mobile : STREAM_COUNTS.desktop
  return Array.from({ length: count }, () => createStreamParticle(w, h, true))
}

function animateStreams(ctx, particles, w, h, time) {
  // Get the front dune crest y as floor reference
  const { y: crestY } = sampleCrest(DUNE_CRESTS[2], 0.5, w, h)
  const floor = crestY - 5

  for (const p of particles) {
    const { wx, wy } = sampleWind(p.x, p.y)
    const wobble = Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp

    // Fast horizontal, very slight vertical undulation
    p.x += p.speed + wx * 1.2
    p.y += wobble + wy * 0.15

    // Keep within ground zone (crest → bottom of screen)
    if (p.y < floor) p.y = floor + 2
    if (p.y > h) p.y = h - 1

    // Wrap horizontally
    if (p.x > w + p.length) {
      p.x = -(Math.random() * w * 0.2)
      p.y = floor + Math.pow(Math.random(), 0.5) * (h - floor)
    }

    // Fade opacity near the top edge of the stream zone (soft ceiling)
    const zoneDepth = (p.y - floor) / (h - floor)
    const ceilingFade = Math.min(1, zoneDepth * 4)

    // Draw — tiny fast streaks
    const windAngle = Math.atan2(wy * 0.15 + wobble, p.speed + wx * 1.2)
    ctx.globalAlpha = p.opacity * ceilingFade
    ctx.fillStyle = p.color
    ctx.save()
    ctx.translate(p.x | 0, p.y | 0)
    ctx.rotate(windAngle)
    ctx.beginPath()
    ctx.ellipse(0, 0, p.length / 2, p.size / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
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
      : createSandParticles(w, h, isMobile)

    // Ground streams (only for sand theme)
    const streams = theme === 'sand' ? createStreamParticles(w, h, isMobile) : null

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
        // Ground streams on top of particles — sand fog at the floor
        if (streams) animateStreams(ctx, streams, w, h, time)
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
      style={{ zIndex: 5 }}
      aria-hidden="true"
    />
  )
}
