"use client"

import { useEffect, useRef } from "react"

export function CombinedBackground() {
  const patternRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    let offset = 0
    const speed = 0.2

    function animate() {
      offset += speed
      if (patternRef.current) {
        patternRef.current.setAttribute("stroke-dashoffset", offset.toString())
      }
      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-magenta-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating particles */}
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-lime-400/20 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-cyan-400/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-magenta-400/25 rounded-full animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="w-full h-full opacity-10"
          preserveAspectRatio="none"
          viewBox="0 0 800 600"
        >
          <defs>
            <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                ref={patternRef}
                d="M 30 0 L 0 0 0 30"
                stroke="rgba(102, 255, 102, 0.12)"
                strokeWidth="0.8"
                strokeDasharray="4 4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>
    </>
  )
}
