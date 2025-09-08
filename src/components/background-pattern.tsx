// components/BackgroundPattern.tsx
"use client"

import { useEffect, useRef } from "react"

export function BackgroundPattern() {
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
  )
}
