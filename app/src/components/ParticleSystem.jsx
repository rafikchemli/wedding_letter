import { useRef, useEffect } from 'react'
import { createNoise3D } from 'simplex-noise'

/* ── Snow: particles that fall hard at an angle ── */

const SNOW = {
  count: 65,
  mobileCount: 30,
  sizeRange: [2, 6],
}

const BOKEH_COUNT = { desktop: 4, mobile: 2 }

// Snow terrain through-points [svgX, svgY] — from GROUND_PATHS.snow cubic beziers
// Small/far flakes stop at far layers, large/close flakes reach the front drift
const SNOW_CRESTS = [
  // Far distant snowbank
  [[-50,680], [400,620], [720,630], [1080,590], [1250,610]],
  // Back snowbank
  [[-50,700], [220,610], [440,600], [660,620], [900,580], [1100,620], [1250,590]],
  // Mid snowbank
  [[-50,740], [200,680], [430,670], [680,680], [920,665], [1150,685], [1250,675]],
  // Front drift
  [[-50,760], [380,735], [700,738], [1050,732], [1250,735]],
]

function createSnowflake(w, h, scattered) {
  const size = SNOW.sizeRange[0] + Math.random() * (SNOW.sizeRange[1] - SNOW.sizeRange[0])
  // Depth layer: small flakes stop at far terrain, large at front
  const depth = (size - SNOW.sizeRange[0]) / (SNOW.sizeRange[1] - SNOW.sizeRange[0])

  // Color temperature by depth — far: cool blue-white (#C8D8E8), close: warm white (#FFF8E0)
  const r = Math.round(200 + depth * 55)
  const g = Math.round(216 + depth * 32)
  const b = Math.round(232 - depth * 8)

  return {
    x: scattered ? Math.random() * w : Math.random() * w * 1.5 - w * 0.25,
    y: scattered ? Math.random() * h : -(Math.random() * h * 0.2 + size),
    size,
    depth,
    depthLayer: Math.min(3, Math.floor(depth * 4)),
    color: `rgb(${r},${g},${b})`,
    // Depth-scaled opacity — far: faint (0.2–0.4), close: opaque (0.7–0.9)
    opacity: (0.2 + Math.random() * 0.2) + depth * 0.5,
    // Depth-scaled speed: close/big flakes fall faster, far/small ones drift gently
    // depth 0 → slow (0.6–1.2), depth 1 → fast (1.8–3.6)
    fallSpeed: (0.6 + Math.random() * 0.6) + depth * (1.2 + Math.random() * 1.8),
    drift: (0.15 + Math.random() * 0.25) + depth * (0.3 + Math.random() * 0.6),
    // Small wobble — NOT floaty, just a slight jitter
    wobbleAmp: 0.15 + Math.random() * 0.3 + depth * 0.3,
    // Wobble freq by depth — far: slow (1.5–3.0), close: fast (3.5–5.0)
    wobbleFreq: (1.5 + Math.random() * 1.5) + depth * 2.0,
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

    // Depth-aware wind response — far: barely respond, close: ride gusts hard
    const windResponse = 0.3 + p.depth * 0.7
    p.y += p.fallSpeed
    p.x += p.drift + wobble + gust * windResponse

    // Terrain occlusion — flake disappears behind its depth-matched snowbank
    const terrainY = sampleTerrainY(p.depthLayer, p.x, w, h)
    if (p.y >= terrainY || p.y > h + p.size) {
      Object.assign(p, createSnowflake(w, h, false))
      continue
    }
    if (p.x > w + p.size * 2) p.x = -p.size * 2
    if (p.x < -p.size * 2) p.x = w + p.size * 2

    // Fade out as flake approaches its terrain line
    const fadeZone = 25
    const distToTerrain = terrainY - p.y
    const terrainFade = distToTerrain < fadeZone ? distToTerrain / fadeZone : 1

    // Draw — simple circle
    ctx.globalAlpha = p.opacity * terrainFade
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    // Subtle highlight
    ctx.globalAlpha = p.opacity * terrainFade * 0.3
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(p.x - p.size * 0.2, p.y - p.size * 0.2, p.size * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Bokeh: large soft foreground flakes (Shinkai signature) ── */

function createBokehFlake(w, h, scattered) {
  return {
    x: Math.random() * w,
    y: scattered ? Math.random() * h : -(Math.random() * 50),
    size: 12 + Math.random() * 14,
    opacity: 0.08 + Math.random() * 0.07,
    fallSpeed: 0.3 + Math.random() * 0.4,
    drift: 0.1 + Math.random() * 0.2,
    wobbleAmp: 1.5 + Math.random() * 2.0,
    wobbleFreq: 0.3 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
  }
}

function animateBokeh(ctx, particles, w, h, time) {
  for (const p of particles) {
    p.y += p.fallSpeed
    p.x += p.drift + Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp

    if (p.y > h + p.size * 2) Object.assign(p, createBokehFlake(w, h, false))
    if (p.x > w + p.size) p.x = -p.size
    if (p.x < -p.size) p.x = w + p.size

    // Outer glow
    ctx.globalAlpha = p.opacity * 0.3
    ctx.fillStyle = '#E8F0FF'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    // Mid ring
    ctx.globalAlpha = p.opacity * 0.5
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.globalAlpha = p.opacity * 0.7
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Sand bokeh: warm foreground dust motes (Shinkai) ── */

const SAND_BOKEH_COUNT = { desktop: 3, mobile: 2 }

function createSandBokeh(w, h, scattered) {
  return {
    x: scattered ? Math.random() * w : -(Math.random() * 40),
    y: h * 0.3 + Math.random() * h * 0.5,
    size: 10 + Math.random() * 12,
    opacity: 0.06 + Math.random() * 0.06,
    driftX: 0.2 + Math.random() * 0.3,
    driftY: -(0.05 + Math.random() * 0.1),
    wobbleAmp: 1.0 + Math.random() * 1.5,
    wobbleFreq: 0.2 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
  }
}

function animateSandBokeh(ctx, particles, w, h, time) {
  for (const p of particles) {
    p.x += p.driftX + Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp * 0.3
    p.y += p.driftY + Math.cos(time * p.wobbleFreq * 0.7 + p.phase) * p.wobbleAmp * 0.5

    if (p.x > w + p.size * 2) Object.assign(p, createSandBokeh(w, h, false))
    if (p.y < -p.size * 2 || p.y > h + p.size * 2) Object.assign(p, createSandBokeh(w, h, false))

    // Outer glow — warm amber
    ctx.globalAlpha = p.opacity * 0.3
    ctx.fillStyle = '#F0DCC0'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    // Mid ring
    ctx.globalAlpha = p.opacity * 0.5
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.globalAlpha = p.opacity * 0.7
    ctx.fillStyle = '#FFF0D8'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Heat shimmer: faint rising blobs near dune horizon ── */

const SHIMMER_COUNT = { desktop: 6, mobile: 3 }

function createShimmerBlob(w, h) {
  // Spawn along the mid-dune horizon zone
  return {
    x: Math.random() * w,
    y: h * 0.55 + Math.random() * h * 0.2,
    size: 30 + Math.random() * 50,
    opacity: 0.015 + Math.random() * 0.015,
    riseSpeed: 0.08 + Math.random() * 0.12,
    wobbleAmp: 8 + Math.random() * 12,
    wobbleFreq: 0.15 + Math.random() * 0.2,
    pulseFreq: 0.2 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
  }
}

function animateShimmer(ctx, particles, w, h, time) {
  for (const p of particles) {
    p.y -= p.riseSpeed
    p.x += Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp * 0.02

    // Reset when risen too high
    if (p.y < h * 0.3) Object.assign(p, createShimmerBlob(w, h))

    const pulse = 0.6 + 0.4 * Math.sin(time * p.pulseFreq + p.phase)

    ctx.globalAlpha = p.opacity * pulse
    ctx.fillStyle = '#F8E8D0'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Sand: particles blow off the SVG dune crests ── */

const SAND = {
  colors: ['#D4A96A', '#C49A5A', '#E8C88A', '#B8894A', '#CDAA70'],
  dustColors: ['#E8D8B8', '#F0E0C0', '#D8C8A0'],
}

const SAND_COUNTS = {
  streaks:   { desktop: 600, mobile: 150 },
  grains:    { desktop: 1000, mobile: 250 },
  dustMotes: { desktop: 400, mobile: 80 },
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

// Sample snow terrain Y at a screen X for a given crest layer
function sampleTerrainY(crestIdx, screenX, w, h) {
  const crest = SNOW_CRESTS[crestIdx]
  const pts = crest.map(([sx, sy]) => svgToScreen(sx, sy, w, h))
  if (screenX <= pts[0].x) return pts[0].y
  if (screenX >= pts[pts.length - 1].x) return pts[pts.length - 1].y
  for (let i = 0; i < pts.length - 1; i++) {
    if (screenX <= pts[i + 1].x) {
      const t = (screenX - pts[i].x) / (pts[i + 1].x - pts[i].x)
      return pts[i].y + t * (pts[i + 1].y - pts[i].y)
    }
  }
  return pts[pts.length - 1].y
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
  // Depth: 0=back(far) → 1=front(close) — closer dunes move faster
  const depth = dune / (DUNE_CRESTS.length - 1)
  return {
    kind: 'streak',
    depth,
    x: x + travelX,
    y: y + travelY,
    spawnY: y,
    length: (5 + Math.random() * 8) + depth * 6,
    thickness: (0.4 + Math.random() * 0.5) + depth * 0.5,
    color: pickColor(SAND.colors),
    opacity: (0.3 + Math.random() * 0.2) + depth * 0.3,
    windSpeed: (0.6 + Math.random() * 0.8) + depth * (0.8 + Math.random() * 1.0),
    drift: -((0.1 + Math.random() * 0.2) + depth * 0.3),
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
  const depth = dune / (DUNE_CRESTS.length - 1)
  return {
    kind: 'grain',
    depth,
    x: x + travelX,
    y: y + travelY,
    spawnY: y,
    size: (0.6 + Math.random() * 1.0) + depth * 1.2,
    color: pickColor(SAND.colors),
    opacity: (0.3 + Math.random() * 0.25) + depth * 0.3,
    windSpeed: (0.25 + Math.random() * 0.4) + depth * (0.4 + Math.random() * 0.6),
    lift: -((0.15 + Math.random() * 0.3) + depth * 0.3),
    fall: 0.008 + Math.random() * 0.015,
    vy: scattered ? (Math.random() - 0.5) * 0.25 : -((0.15 + Math.random() * 0.3) + depth * 0.3),
    wobbleAmp: 0.3 + Math.random() * 0.6,
    wobbleFreq: 2 + Math.random() * 3,
    phase: Math.random() * Math.PI * 2,
    life: scattered ? Math.random() : 1,
    decay: 0.0015 + Math.random() * 0.003,
  }
}

// Dust motes — tiny particles that rise high off the crests
function createDustMote(w, h, scattered) {
  const { x, y, dune } = randomCrestPoint(w, h)
  const travelX = scattered ? Math.random() * w * 0.5 : 0
  const travelY = scattered ? -(Math.random() * 120) : 0
  const depth = dune / (DUNE_CRESTS.length - 1)
  return {
    kind: 'dust',
    depth,
    x: x + travelX,
    y: y + travelY,
    spawnY: y,
    size: (0.8 + Math.random() * 1.2) + depth * 1.0,
    color: pickColor(SAND.dustColors),
    opacity: (0.08 + Math.random() * 0.12) + depth * 0.15,
    windSpeed: (0.04 + Math.random() * 0.08) + depth * (0.06 + Math.random() * 0.1),
    lift: -((0.03 + Math.random() * 0.08) + depth * 0.1),
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

/* ── Wind field ── */

// Mobile uses cheap sine wind; desktop uses full simplex noise grid
let useMobileWind = false

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

function sampleWind(x, y, time) {
  if (useMobileWind) {
    // Cheap sine-based wind — no grid, no noise lookups
    return {
      wx: 1.5 + Math.sin(time * 0.3 + y * 0.01) * 0.8,
      wy: Math.sin(time * 0.5 + x * 0.008) * 0.25,
    }
  }
  const c = (x / GRID_CELL) | 0
  const r = (y / GRID_CELL) | 0
  const cc = Math.min(c, windGrid.cols - 1)
  const rr = Math.min(r, windGrid.rows - 1)
  const idx = Math.max(0, rr * windGrid.cols + cc)
  return { wx: windGrid.vx[idx] || 0, wy: windGrid.vy[idx] || 0 }
}

function animateSand(ctx, particles, w, h, time) {
  // Update wind field once per frame (desktop only — mobile uses sine wind)
  if (!useMobileWind) updateWindGrid(w, h, time)

  for (const p of particles) {
    const { wx, wy } = sampleWind(p.x, p.y, time)
    const wobble = Math.sin(time * p.wobbleFreq + p.phase) * p.wobbleAmp

    // Life fades — respawn at crest when dead or offscreen
    p.life -= p.decay
    const offscreen = p.x > w + 20 || p.x < -20 || p.y > h + 20 || p.y < -60

    if (p.kind === 'streak') {
      if (p.life <= 0 || offscreen) {
        Object.assign(p, createStreak(w, h, false))
        continue
      }

      // Streaks ride wind hard — depth-scaled response
      const streakWind = 0.8 + p.depth * 1.2
      p.x += p.windSpeed + wx * streakWind
      p.y += p.drift + wy * 0.5 + wobble

      // Draw — rotated elongated ellipse aligned to local wind
      const windAngle = Math.atan2(p.drift + wy * 0.5, p.windSpeed + wx * streakWind)
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
      const grainWind = 0.4 + p.depth * 0.8
      p.vy += p.fall  // gravity accumulates
      p.x += p.windSpeed + wx * grainWind
      p.y += p.vy + wy * 0.3 + wobble

      // Depth-based color — depth shifts warm/vivid for close, cool/muted for far
      const heightAboveCrest = Math.max(0, p.spawnY - p.y)
      const airborne = Math.min(1, heightAboveCrest / 80)
      const hue = 30 + (1 - airborne) * 10 + p.depth * 8
      const sat = (40 + p.depth * 20) + (1 - airborne) * 15
      const lit = 58 + airborne * 16  // lighter when high in air

      ctx.globalAlpha = p.opacity * p.life
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`
      ctx.beginPath()
      ctx.arc(p.x | 0, p.y | 0, p.size, 0, Math.PI * 2)
      ctx.fill()

      // Sparkle glint — random grains briefly catch sunlight (Shinkai)
      // Close grains glint more often and brighter
      if (Math.random() < 0.015 + p.depth * 0.025) {
        ctx.globalAlpha = Math.min(1, p.opacity * p.life * (2.5 + p.depth))
        ctx.fillStyle = '#FFFDE8'
        ctx.beginPath()
        ctx.arc(p.x | 0, p.y | 0, p.size * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

    } else {
      // Dust motes — rise gently from crests, shimmer
      if (p.life <= 0 || offscreen) {
        Object.assign(p, createDustMote(w, h, false))
        continue
      }

      const dustWind = 0.15 + p.depth * 0.3
      p.x += p.windSpeed + wx * dustWind
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

const STREAM_COUNTS = { desktop: 300, mobile: 70 }

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
    opacity: 0.18 + Math.random() * 0.3,
    speed: 0.6 + Math.random() * 0.9,
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
    const { wx, wy } = sampleWind(p.x, p.y, time)
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
      color: ['#FFFFFF', '#E8EFF8', '#D0DCE8', '#F0F4FA'][Math.floor(Math.random() * 4)],
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

export default function ParticleSystem({ theme = 'sand', activeRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let isMobile = window.innerWidth < 640
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
    let running = true
    let raf = null
    let lastTime = performance.now()

    // Enable mobile wind optimization
    useMobileWind = isMobile
    let w = window.innerWidth
    let h = window.innerHeight

    let resizeTimer = null
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`

      const newW = window.innerWidth
      const newH = window.innerHeight
      const newMobile = newW < 640

      if (Math.abs(newW - w) > 100 || Math.abs(newH - h) > 100 || newMobile !== isMobile) {
        w = newW
        h = newH
        isMobile = newMobile
        useMobileWind = isMobile
        // Debounce expensive particle rebuild — canvas resizes immediately
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(rebuildParticles, 200)
      } else {
        w = newW
        h = newH
      }
    }
    resize()

    // Create particles based on theme
    let items = theme === 'snow'
      ? Array.from({ length: isMobile ? SNOW.mobileCount : SNOW.count }, () => createSnowflake(w, h, true))
      : createSandParticles(w, h, isMobile)

    let streams = theme === 'sand' ? createStreamParticles(w, h, isMobile) : null

    // Bokeh foreground particles + heat shimmer
    const devKey = isMobile ? 'mobile' : 'desktop'
    let bokeh = theme === 'snow'
      ? Array.from({ length: BOKEH_COUNT[devKey] }, () => createBokehFlake(w, h, true))
      : Array.from({ length: SAND_BOKEH_COUNT[devKey] }, () => createSandBokeh(w, h, true))

    let shimmer = theme === 'sand'
      ? Array.from({ length: SHIMMER_COUNT[devKey] }, () => createShimmerBlob(w, h))
      : null

    function rebuildParticles() {
      items = theme === 'snow'
        ? Array.from({ length: isMobile ? SNOW.mobileCount : SNOW.count }, () => createSnowflake(w, h, true))
        : createSandParticles(w, h, isMobile)
      streams = theme === 'sand' ? createStreamParticles(w, h, isMobile) : null
      const key = isMobile ? 'mobile' : 'desktop'
      bokeh = theme === 'snow'
        ? Array.from({ length: BOKEH_COUNT[key] }, () => createBokehFlake(w, h, true))
        : Array.from({ length: SAND_BOKEH_COUNT[key] }, () => createSandBokeh(w, h, true))
      shimmer = theme === 'sand'
        ? Array.from({ length: SHIMMER_COUNT[key] }, () => createShimmerBlob(w, h))
        : null
    }

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

    let time = 0

    // FPS ratchet — track rolling average, halve particles if consistently low
    const FPS_WINDOW = 30
    const frameDeltas = []
    let ratcheted = false

    const animate = (now) => {
      if (!running) return

      // Pause when hero is offscreen
      if (activeRef && !activeRef.current) {
        lastTime = now // prevent time jump on resume
        raf = requestAnimationFrame(animate)
        return
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      time += dt

      // FPS ratchet — halve particles if avg drops below 24fps for 1 second
      if (!ratcheted) {
        frameDeltas.push(dt)
        if (frameDeltas.length > FPS_WINDOW) frameDeltas.shift()
        if (frameDeltas.length === FPS_WINDOW) {
          const avgDt = frameDeltas.reduce((a, b) => a + b, 0) / FPS_WINDOW
          if (avgDt > 1 / 24) {
            ratcheted = true
            items = items.filter((_, i) => i % 2 === 0)
            if (streams) streams = streams.filter((_, i) => i % 2 === 0)
          }
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      if (theme === 'snow') {
        animateSnow(ctx, items, w, h, time)
        if (bokeh) animateBokeh(ctx, bokeh, w, h, time)
      } else {
        if (shimmer) animateShimmer(ctx, shimmer, w, h, time)
        animateSand(ctx, items, w, h, time)
        if (streams) animateStreams(ctx, streams, w, h, time)
        if (bokeh) animateSandBokeh(ctx, bokeh, w, h, time)
      }

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
      clearTimeout(resizeTimer)
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
