import { useEffect, useRef } from 'react'

export default function FluidBlobs() {
  const containerRef = useRef(null)
  const blob1Ref = useRef(null)

  useEffect(() => {
    let ticking = false
    const handleMouseMove = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!containerRef.current || !blob1Ref.current) return
          const rect = containerRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          
          blob1Ref.current.animate({
            left: `${x}px`,
            top: `${y}px`
          }, { duration: 3000, fill: 'forwards', easing: 'ease-out' })
          
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-3xl"
    >
      <div 
        className="w-full h-full absolute top-0 left-0" 
      >
        {/* Blob 1: Cursor follower (Blue) */}
        <div 
          ref={blob1Ref}
          className="absolute w-[450px] h-[450px] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0) 70%)',
            left: '50%',
            top: '50%',
            filter: 'blur(60px)',
            willChange: 'left, top',
          }}
        />
        
        {/* Blob 2: Floating slow (Violet) */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(139,92,246,0) 70%)',
            left: '10%',
            top: '20%',
            filter: 'blur(70px)',
            animation: 'float-blob 22s infinite alternate ease-in-out'
          }}
        />
        
        {/* Blob 3: Floating slow (Blue) */}
        <div 
          className="absolute w-[550px] h-[550px] rounded-full opacity-20 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, rgba(59,130,246,0) 70%)',
            right: '-10%',
            bottom: '0%',
            filter: 'blur(80px)',
            animation: 'float-blob 28s infinite alternate-reverse ease-in-out'
          }}
        />
      </div>
    </div>
  )
}
