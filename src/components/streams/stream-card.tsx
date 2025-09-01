"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Play, Users, TrendingUp, Zap } from "lucide-react"
import type { StreamItem } from "@/lib/mock-data"

export function StreamCard({ stream, index = 0 }: { stream: StreamItem; index?: number }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = (p + stream.perSecondAmount * 5) % 100
        return next
      })
    }, 500)
    return () => clearInterval(id)
  }, [stream.perSecondAmount])

  const getGradient = (index: number) => {
    const gradients = [
      "from-lime-500/20 via-cyan-500/10 to-yellow-500/20",
      "from-cyan-500/20 via-magenta-500/10 to-orange-500/20", 
      "from-magenta-500/20 via-lime-500/10 to-cyan-500/20"
    ]
    return gradients[index % gradients.length]
  }

  const getBorderColor = (index: number) => {
    const borders = [
      "border-lime-500/30",
      "border-cyan-500/30",
      "border-magenta-500/30"
    ]
    return borders[index % borders.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="group"
    >
      <Card className={`
        relative overflow-hidden border-2 ${getBorderColor(index)} 
        bg-gradient-to-br ${getGradient(index)}
        backdrop-blur-xl text-[#f5eada] shadow-2xl
      `}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
        </div>

        <CardHeader className="relative z-10 flex flex-row items-center gap-4 pb-4">
          <div className="relative">
            <Image
              src={stream.thumbnail || "/placeholder.svg?height=56&width=56&query=nft%20thumbnail"}
              alt={`${stream.nftTitle} thumbnail`}
              width={56}
              height={56}
              className="rounded-lg shadow-lg"
            />
            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-green-500 shadow-lg">
              <Play className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-[#f5eada] mb-1">{stream.nftTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#f5eada]/70 bg-black/20 px-2 py-1 rounded-full">
                {stream.nftId}
              </span>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <Zap className="h-3 w-3" />
                Live
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4 pt-0">
          {/* Streaming Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#f5eada]/80 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Streaming Progress
              </span>
              <span className="text-[#f5eada] font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-2 bg-black/20 [&>div]:bg-gradient-to-r [&>div]:from-lime-500 [&>div]:to-cyan-500 [&>div]:shadow-lg" 
              />
              <div 
                className="absolute top-0 left-0 h-2 w-2 bg-white rounded-full shadow-lg"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-[#f5eada]/80">
              <Users className="h-3 w-3" />
              Recipients
            </div>
            <div className="space-y-2">
              {stream.recipients.map((r, i) => (
                <motion.div 
                  key={r.handle} 
                  className="flex items-center justify-between p-2 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + i * 0.1 + 0.3 }}
                >
                  <span className="text-[#f5eada]/90 font-medium">{r.handle}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#f5eada]/70">{r.percent}%</span>
                    <div className="w-12 h-1 bg-black/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-lime-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${r.percent}%` }}
                        transition={{ delay: index * 0.1 + i * 0.1 + 0.5, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Streaming Rate */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#f5eada]/70">Stream Rate</span>
              <span className="text-[#f5eada] font-medium">
                {stream.perSecondAmount.toFixed(3)} USDC/s
              </span>
            </div>
          </div>
        </CardContent>


      </Card>
    </motion.div>
  )
}
