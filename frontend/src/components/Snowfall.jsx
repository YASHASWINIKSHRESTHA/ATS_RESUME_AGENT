import { useMemo } from 'react'

/** Generates CSS keyframe-animated snowflake divs.
 *  Three layers of flakes for depth perspective:
 *  - Primary:   crisp, faster, primary white
 *  - Secondary: soft tint, mid-speed
 *  - Blurred:   filter:blur applied, slow — creates depth illusion
 */
export default function Snowfall() {
  const flakes = useMemo(() => {
    const out = []
    const seed = (n) => (Math.sin(n * 9301 + 49297) * 233280) % 1

    // Primary flakes — bright, crisp
    for (let i = 0; i < 28; i++) {
      const left     = seed(i * 3)     * 100
      const size     = 1.5 + seed(i * 7) * 2.5          // 1.5–4px
      const duration = 10 + seed(i * 11) * 8             // 10–18s
      const delay    = seed(i * 5)    * -18               // stagger start
      const opacity  = 0.45 + seed(i * 13) * 0.35        // 0.45–0.8
      const sway     = -15 + seed(i * 17) * 30            // -15…+15px

      out.push({
        id:    `p${i}`,
        cls:   'primary',
        left:  `${left}%`,
        size,
        style: {
          width:  size,
          height: size,
          left:   `${left}%`,
          opacity,
          animation: `snow-fall-${(i % 3) + 1} ${duration}s linear ${delay}s infinite`,
          '--sway': `${sway}px`,
        },
      })
    }

    // Secondary flakes — soft gray
    for (let i = 0; i < 20; i++) {
      const left     = seed((i + 30) * 3)  * 100
      const size     = 1 + seed((i + 30) * 7) * 2
      const duration = 12 + seed((i + 30) * 11) * 10
      const delay    = seed((i + 30) * 5)  * -20
      const opacity  = 0.35 + seed((i + 30) * 13) * 0.3

      out.push({
        id:    `s${i}`,
        cls:   'secondary',
        style: {
          width:  size,
          height: size,
          left:   `${left}%`,
          opacity,
          animation: `snow-fall-${(i % 3) + 1} ${duration}s linear ${delay}s infinite`,
        },
      })
    }

    // Blurred depth flakes — largest, slowest, very soft
    for (let i = 0; i < 14; i++) {
      const left     = seed((i + 60) * 3)  * 100
      const size     = 3 + seed((i + 60) * 7) * 4          // 3–7px
      const duration = 14 + seed((i + 60) * 11) * 6        // 14–20s
      const delay    = seed((i + 60) * 5) * -22
      const blurCls  = i % 2 === 0 ? 'blurred' : 'blurred2'
      const opacity  = 0.3 + seed((i + 60) * 13) * 0.25

      out.push({
        id:    `b${i}`,
        cls:   blurCls,
        style: {
          width:  size,
          height: size,
          left:   `${left}%`,
          opacity,
          animation: `snow-fall-${(i % 3) + 1} ${duration}s linear ${delay}s infinite`,
        },
      })
    }

    return out
  }, [])

  return (
    <div className="snowflakes" aria-hidden="true">
      {flakes.map((f) => (
        <div
          key={f.id}
          className={`snowflake ${f.cls}`}
          style={f.style}
        />
      ))}
    </div>
  )
}
