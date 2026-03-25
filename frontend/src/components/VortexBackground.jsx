import { useEffect, useRef } from 'react'

/**
 * VortexBackground
 * Canvas-based rotating energy vortex with:
 *  - Multi-arm spiral particle system (galaxy-style)
 *  - Neon glow core pulsing between blue ↔ violet
 *  - Particles drift outward & fade, looping infinitely
 *  - Outer stray particles for depth
 *  - 60fps via requestAnimationFrame
 */
export default function VortexBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // ── Resize handling ─────────────────────────────────────────
    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width  = W
    canvas.height = H

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    // ── Particle factory ─────────────────────────────────────────
    const ARMS        = 3        // spiral arms
    const PER_ARM     = 90       // particles per arm
    const TOTAL       = ARMS * PER_ARM + 60  // + ambient stray particles

    function lerpColor(t) {
      // blue (#3B82F6) → violet (#8B5CF6) along t=[0,1]
      const r = Math.round(59  + (139 - 59)  * t)
      const g = Math.round(130 + (92  - 130) * t)
      const b = Math.round(246 + (246 - 246) * t)
      return { r, g, b }
    }

    function makeParticle(index) {
      const isStray = index >= ARMS * PER_ARM

      if (isStray) {
        // Ambient floating particles — far from center
        const angle  = Math.random() * Math.PI * 2
        const dist   = 0.25 + Math.random() * 0.45   // fraction of min(W,H)/2
        return {
          arm:      -1,
          angle,
          dist,
          speed:    0.00015 + Math.random() * 0.0003,
          drift:    -0.00004 + Math.random() * 0.00008,
          size:     0.6 + Math.random() * 1.2,
          opacity:  0.15 + Math.random() * 0.3,
          colorT:   Math.random(),
          phase:    Math.random() * Math.PI * 2,
          stray:    true,
        }
      }

      const arm   = Math.floor(index / PER_ARM)
      const local = (index % PER_ARM) / PER_ARM     // 0..1 along arm

      // Logarithmic spiral: r = a * e^(b*θ)
      const armOffsetAngle = (arm / ARMS) * Math.PI * 2
      const windFactor     = 0.38                   // tightness of spiral
      const maxTheta       = Math.PI * 3.5          // spiral sweep

      const theta = local * maxTheta
      const dist  = (0.04 + local * 0.55)           // 4%..55% of core radius

      return {
        arm,
        theta,
        angleOffset: armOffsetAngle,
        windFactor,
        dist,
        speed:   0.0003 + Math.random() * 0.0004,   // rotation speed
        drift:   0.00008 + local * 0.00015,          // outward drift per frame
        maxDist: 0.72,
        size:    0.7 + local * 2.2,                  // bigger toward edge
        opacity: 0.55 - local * 0.3,
        colorT:  local,                              // blue(0) → violet(1)
        phase:   Math.random() * Math.PI * 2,
        stray:   false,
      }
    }

    // Initialise all particles
    let particles = Array.from({ length: TOTAL }, (_, i) => makeParticle(i))

    // ── Animation loop ───────────────────────────────────────────
    let t     = 0
    let rafId = null

    function draw() {
      rafId = requestAnimationFrame(draw)
      t += 0.01

      // Fade-to-black trail (motion blur)
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(0, 0, W, H)

      const cx = W / 2
      const cy = H / 2
      const R  = Math.min(W, H) * 0.42   // core radius reference

      // ── Draw core glow ───────────────────────────────────────
      const glowPulse = 0.75 + 0.25 * Math.sin(t * 1.4)
      const coreGrad  = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.18 * glowPulse)
      const blueAlpha  = Math.round(110 * glowPulse)
      const violetAlpha= Math.round(70  * glowPulse)
      coreGrad.addColorStop(0,   `rgba(120,170,255,${(0.45 * glowPulse).toFixed(2)})`)
      coreGrad.addColorStop(0.3, `rgba(59,130,246,${(0.25 * glowPulse).toFixed(2)})`)
      coreGrad.addColorStop(0.7, `rgba(139,92,246,${(0.10 * glowPulse).toFixed(2)})`)
      coreGrad.addColorStop(1,    'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.18 * glowPulse, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      // Tiny bright centerpoint
      ctx.beginPath()
      ctx.arc(cx, cy, 2.5 * glowPulse, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200,220,255,${(0.85 * glowPulse).toFixed(2)})`
      ctx.fill()

      // ── Draw particles ───────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        let px, py, alpha, r

        if (p.stray) {
          // Stray ambient: gentle circular drift
          const a   = p.angle + t * p.speed
          const d   = p.dist * R * (1 + 0.06 * Math.sin(t * 0.5 + p.phase))
          px = cx + Math.cos(a) * d
          py = cy + Math.sin(a) * d
          alpha = p.opacity * (0.7 + 0.3 * Math.sin(t * 0.8 + p.phase))
          r = p.size
        } else {
          // Spiral arm particle
          const rotation = t * p.speed * 40
          const angle    = p.angleOffset + p.theta * p.windFactor + rotation
          const distFrac = p.dist + p.drift * (t % 300)
          const d        = distFrac * R

          if (distFrac > p.maxDist) {
            // Reset particle to inner spiral
            particles[i] = makeParticle(i)
            continue
          }

          px = cx + Math.cos(angle) * d
          py = cy + Math.sin(angle) * d

          // Fade in near center, fade out at edge
          alpha = p.opacity * Math.min(1, distFrac / 0.08) * (1 - Math.max(0, (distFrac - 0.5) / 0.22))
          r = p.size
        }

        // Color
        const { r: cr, g: cg, b: cb } = lerpColor(p.colorT)

        // Glow effect — soft outer halo
        if (r > 1.2) {
          const glowR = ctx.createRadialGradient(px, py, 0, px, py, r * 4)
          glowR.addColorStop(0,   `rgba(${cr},${cg},${cb},${(alpha * 0.7).toFixed(2)})`)
          glowR.addColorStop(0.4, `rgba(${cr},${cg},${cb},${(alpha * 0.2).toFixed(2)})`)
          glowR.addColorStop(1,   'transparent')
          ctx.beginPath()
          ctx.arc(px, py, r * 4, 0, Math.PI * 2)
          ctx.fillStyle = glowR
          ctx.fill()
        }

        // Solid core of particle
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, alpha + 0.1).toFixed(2)})`
        ctx.fill()
      }

      // ── Outer neon ring ──────────────────────────────────────
      const ringPulse = 0.88 + 0.12 * Math.sin(t * 0.9)
      const ringR     = R * 0.62 * ringPulse
      const ringGrad  = ctx.createRadialGradient(cx, cy, ringR * 0.93, cx, cy, ringR * 1.08)
      ringGrad.addColorStop(0,   'transparent')
      ringGrad.addColorStop(0.35, `rgba(59,130,246,${(0.08 * ringPulse).toFixed(3)})`)
      ringGrad.addColorStop(0.6,  `rgba(139,92,246,${(0.12 * ringPulse).toFixed(3)})`)
      ringGrad.addColorStop(1,   'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(139,92,246,${(0.07 * ringPulse).toFixed(3)})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}
