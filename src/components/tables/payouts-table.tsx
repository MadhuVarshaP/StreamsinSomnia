"use client"

import { recentPayouts } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { DollarSign, Calendar, Users } from "lucide-react"

export function PayoutsTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
        </div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-lime-500/20">
              <DollarSign className="h-5 w-5 text-lime-400" />
            </div>
            <CardTitle className="text-xl font-bold text-[#f5eada]">Recent Payouts</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[#f5eada]/70">
                <tr className="border-b border-lime-500/20">
                  <th className="py-3 pr-4 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </th>
                  <th className="py-3 pr-4 font-medium">NFT ID</th>
                  <th className="py-3 pr-4 font-medium">Event</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Recipient
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPayouts.map((r, index) => (
                  <motion.tr 
                    key={r.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-3 pr-4 text-[#f5eada]/90 font-medium">{r.date}</td>
                    <td className="py-3 pr-4 text-[#f5eada]/90">{r.nftId}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        r.event === "Stream" 
                          ? "bg-lime-500/20 text-lime-400 border border-lime-500/30" 
                          : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      }`}>
                        {r.event}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#f5eada] font-medium">${r.amount.toFixed(2)} USDC</td>
                    <td className="py-3 text-[#f5eada]/90">{r.recipient}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  )
}
