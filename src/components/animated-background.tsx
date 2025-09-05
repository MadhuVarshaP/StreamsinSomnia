"use client"

import { motion, useMotionTemplate, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  const angle = useSpring(45, { stiffness: 40, damping: 20, mass: 1.2 })
  const angle2 = useSpring(135, { stiffness: 30, damping: 25, mass: 1.5 })
  const angle3 = useSpring(225, { stiffness: 35, damping: 22, mass: 1.3 })
  
  useEffect(() => {
    let dir = 1
    let currentAngle = 45
    const id = setInterval(() => {
      currentAngle += dir * 0.3
      if (currentAngle > 70 || currentAngle < 20) dir *= -1
      angle.set(currentAngle)
    }, 80)
    return () => clearInterval(id)
  }, [angle])

  useEffect(() => {
    let dir = -1
    let currentAngle = 135
    const id = setInterval(() => {
      currentAngle += dir * 0.4
      if (currentAngle > 180 || currentAngle < 90) dir *= -1
      angle2.set(currentAngle)
    }, 100)
    return () => clearInterval(id)
  }, [angle2])

  useEffect(() => {
    let dir = 1
    let currentAngle = 225
    const id = setInterval(() => {
      currentAngle += dir * 0.2
      if (currentAngle > 270 || currentAngle < 180) dir *= -1
      angle3.set(currentAngle)
    }, 120)
    return () => clearInterval(id)
  }, [angle3])

  const gradient1 = useMotionTemplate`linear-gradient(${angle}deg, rgba(10,10,12,1) 0%, rgba(20,15,25,1) 30%, rgba(15,10,20,1) 70%, rgba(8,8,12,1) 100%)`
  const gradient2 = useMotionTemplate`radial-gradient(ellipse at 20% 30%, rgba(0,255,136,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,0,128,0.12) 0%, transparent 50%)`
  const gradient3 = useMotionTemplate`conic-gradient(from ${angle2}deg at 50% 50%, rgba(0,212,255,0.08) 0deg, rgba(0,255,136,0.12) 120deg, rgba(255,0,128,0.10) 240deg, rgba(0,212,255,0.08) 360deg)`

  // Show static background during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          aria-hidden 
          style={{ 
            background: 'linear-gradient(45deg, rgba(10,10,12,1) 0%, rgba(20,15,25,1) 30%, rgba(15,10,20,1) 70%, rgba(8,8,12,1) 100%)'
          }} 
          className="absolute inset-0" 
        />
        <div 
          aria-hidden 
          style={{ 
            background: 'radial-gradient(ellipse at 20% 30%, rgba(0,255,136,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,0,128,0.12) 0%, transparent 50%)'
          }} 
          className="absolute inset-0" 
        />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base gradient layer */}
      <motion.div 
        aria-hidden 
        style={{ backgroundImage: gradient1 }} 
        className="absolute inset-0" 
      />
      
      {/* Color overlay layer */}
      <motion.div 
        aria-hidden 
        style={{ backgroundImage: gradient2 }} 
        className="absolute inset-0" 
      />
      
      {/* Rotating conic gradient */}
      <motion.div 
        aria-hidden 
        style={{ backgroundImage: gradient3 }} 
        className="absolute inset-0" 
      />
      
      {/* Glassy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]" />
      
      {/* Animated orbs */}
      <FloatingOrbs />
      
      {/* Grid pattern */}
      <GridPattern />
      
      {/* Floating particles */}
      <Particles />
    </div>
  )
}

function FloatingOrbs() {
  const orbs = [
    { size: 200, x: 10, y: 20, color: "rgba(0,255,136,0.08)", delay: 0 },
    { size: 150, x: 80, y: 10, color: "rgba(255,0,128,0.10)", delay: 2 },
    { size: 180, x: 60, y: 70, color: "rgba(0,212,255,0.08)", delay: 4 },
    { size: 120, x: 20, y: 80, color: "rgba(255,255,0,0.08)", delay: 1 },
    { size: 160, x: 90, y: 50, color: "rgba(255,102,0,0.08)", delay: 3 },
  ]

  return (
    <div aria-hidden className="absolute inset-0">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            backgroundColor: orb.color,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.6, 0],
            scale: [0.8, 1.2, 0.9, 1.1, 0.8],
            x: [0, 20, -10, 15, 0],
            y: [0, -15, 10, -5, 0],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Number.POSITIVE_INFINITY,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function GridPattern() {
  return (
    <div 
      aria-hidden 
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    />
  )
}

// Deterministic hash function for consistent server/client rendering
function hash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

function Particles() {
  const particles = new Array(25).fill(0).map((_, i) => {
    const seed = `particle-${i}`
    const hashValue = hash(seed)
    
    return {
      id: i,
      size: (hashValue % 300) / 100 + 1, // 1-4 range
      x: (hashValue % 10000) / 100, // 0-100 range
      y: ((hashValue >> 8) % 10000) / 100, // 0-100 range
      color: [
        "rgba(0,255,136,0.4)",
        "rgba(255,0,128,0.3)", 
        "rgba(0,212,255,0.3)",
        "rgba(255,255,0,0.3)",
        "rgba(255,102,0,0.3)",
        "rgba(245,234,218,0.2)"
      ][hashValue % 6],
      duration: 8 + (hashValue % 1200) / 100, // 8-20 range
      delay: (hashValue % 500) / 100, // 0-5 range
    }
  })

  return (
    <div aria-hidden className="absolute inset-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0.4, 0.8, 0],
            scale: [0, 1.2, 0.8, 1, 0],
            y: ["0%", "-20%", "-10%", "-15%", "0%"],
            x: ["0%", "10%", "-5%", "8%", "0%"],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
