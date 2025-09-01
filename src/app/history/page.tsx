"use client"

import { AppShell } from "../../components/app-shell"
import { historyRows } from "../../lib/mock-data"
import { useMemo, useState } from "react"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { motion } from "framer-motion"
import { Search, History, TrendingUp, DollarSign, Users, Calendar } from "lucide-react"

export default function HistoryPage() {
  const [q, setQ] = useState("")
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return historyRows
    return historyRows.filter((r) => [r.nftId, r.event, r.date, r.recipient].some((v) => v.toLowerCase().includes(s)))
  }, [q])

  const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0)
  const streamCount = filtered.filter(r => r.event === "Stream").length
  const saleCount = filtered.filter(r => r.event === "Sale").length

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl border border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 p-8 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)] animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <History className="h-6 w-6 text-lime-400" />
              </div>
              <h1 className="text-3xl font-bold text-[#f5eada]">Distribution History</h1>
            </div>
            <p className="text-[#f5eada]/80 text-lg max-w-2xl">
              Track all your royalty distributions, streaming payments, and NFT sales across Somnia in Streams.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-[#f5eada]/70">Total Distributed</p>
                  <p className="text-2xl font-bold text-[#f5eada]">${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-[#f5eada]/70">Streaming Events</p>
                  <p className="text-2xl font-bold text-[#f5eada]">{streamCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Calendar className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-[#f5eada]/70">Sales Events</p>
                  <p className="text-2xl font-bold text-[#f5eada]">{saleCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-lime-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Users className="h-5 w-5 text-lime-400" />
                </div>
                <div>
                  <p className="text-sm text-[#f5eada]/70">Total Events</p>
                  <p className="text-2xl font-bold text-[#f5eada]">{filtered.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
            </div>

            <CardHeader className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <History className="h-5 w-5 text-lime-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#f5eada]">Transaction History</CardTitle>
              </div>
              <div className="w-full md:w-80">
                <div className="relative">
                  <Input
                    placeholder="Search history..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20 pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#f5eada]/40" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-[#f5eada]/70">
                    <tr className="border-b border-lime-500/20">
                      <th className="py-3 pr-4 font-medium">NFT</th>
                      <th className="py-3 pr-4 font-medium">Event</th>
                      <th className="py-3 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">Amount</th>
                      <th className="py-3 font-medium">Recipients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, index) => (
                      <motion.tr 
                        key={r.id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="py-3 pr-4 text-[#f5eada]/90 font-medium">{r.nftId}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                            r.event === "Stream" 
                              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                              : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                          }`}>
                            {r.event}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-[#f5eada]/90">{r.date}</td>
                        <td className="py-3 pr-4 text-[#f5eada] font-medium">${r.amount.toFixed(2)} USDC</td>
                        <td className="py-3 text-[#f5eada]/90">{r.recipient}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <motion.div 
                    className="py-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-lime-500/20">
                        <Search className="h-6 w-6 text-lime-400" />
                      </div>
                      <p className="text-sm text-[#f5eada]/60">No results found</p>
                      <p className="text-xs text-[#f5eada]/40">Try adjusting your search terms</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  )
}
