"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useMemo, useState } from "react"

function makeInitialData() {
  const base = Date.now() - 1000 * 60 * 5
  return Array.from({ length: 50 }, (_, i) => {
    const t = base + i * 6000
    return { time: t, incoming: 50 + Math.sin(i / 4) * 12 + Math.random() * 6 }
  })
}

export function StreamChart() {
  const [data, setData] = useState(makeInitialData)

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1]?.time || Date.now()
        const next = {
          time: last + 6000,
          incoming: 50 + Math.sin((prev.length + 1) / 4) * 12 + Math.random() * 6,
        }
        const sliced = [...prev.slice(1), next]
        return sliced
      })
    }, 1200)
    return () => clearInterval(id)
  }, [])

  const fmt = useMemo(
    () => ({
      x: (v: number) => new Date(v).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
      y: (v: number) => `${v.toFixed(2)} USDC`,
    }),
    [],
  )

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fillColor" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tickFormatter={fmt.x}
            stroke="#6b7280"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />
          <YAxis tickFormatter={fmt.y} stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} width={64} />
          <Tooltip
            contentStyle={{ background: "rgba(0,0,0,0.7)", border: "1px solid #26262b", color: "#f5eada" }}
            labelFormatter={(v) => fmt.x(Number(v))}
            formatter={(v: number | string) => [fmt.y(Number(v)), "Incoming"]}
          />
          <Area
            type="monotone"
            dataKey="incoming"
            stroke="#00ff88"
            fill="url(#fillColor)"
            strokeWidth={2}
            isAnimationActive
            animationDuration={600}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
