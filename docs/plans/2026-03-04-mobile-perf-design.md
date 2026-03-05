# Mobile Performance Optimization Design

**Date:** 2026-03-04
**Scope:** ParticleSystem.jsx, index.css, App.jsx
**Goal:** Eliminate scroll jank and particle lag on mobile devices

## Context

The wedding invitation site runs a canvas-based particle system (sand/snow) with simplex noise wind simulation. On mobile:
- 920 particles animate per frame with noise-based wind
- Canvas runs continuously even when hero is offscreen
- Grain overlay composites a fullscreen SVG filter layer
- No adaptive quality for low-end devices

## Changes

### 1. Pause particles when offscreen
- IntersectionObserver on hero wrapper
- Stop rAF when hero leaves viewport (200px margin)
- Resume from current time when hero re-enters
- Canvas stays in DOM, frozen at last frame

### 2. Reduce mobile particle budget
- Streaks: 250 -> 150
- Grains: 400 -> 250
- Dust: 150 -> 80
- Streams: 120 -> 70
- Total: 920 -> 550 (~40% reduction)

### 3. Adaptive FPS ratchet
- Track rolling average of last 30 frame deltas
- If average drops below 24fps for 1 second, halve all particle arrays
- One-way ratchet (no oscillation)

### 4. Cap mobile DPR at 1.5
- Current: `Math.min(devicePixelRatio, 2)`
- Mobile: `Math.min(devicePixelRatio, 1.5)`
- 44% fewer pixels to fill, imperceptible on particles

### 5. Sine wind on mobile (replaces simplex noise)
- Desktop: unchanged (simplex noise grid)
- Mobile: `windX = prevail + sin(time * freq + y * 0.01) * amp`
- Eliminates ~360 noise3D calls per frame
- Visually 90% identical at phone scale

### 6. Disable grain overlay on mobile
- CSS media query: `@media (max-width: 639px) { .grain-overlay { display: none; } }`
- Removes 1 fullscreen composite layer

### 7. Debounce resize handler
- 200ms debounce on particle rebuild
- Canvas dimensions update immediately (no gap)
- Only the expensive rebuildParticles() waits

## Files Modified
- `app/src/components/ParticleSystem.jsx` (sections 1-5, 7)
- `app/src/index.css` (section 6)
- `app/src/App.jsx` (section 1 — pass visibility ref)

## Risk
- Slightly sparser sand effect on mobile (acceptable)
- Subtly different wind drift on mobile (sine vs simplex — not noticeable)
- FPS ratchet is one-way per session (acceptable for low-end devices)
