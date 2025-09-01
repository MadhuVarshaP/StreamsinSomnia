"use client"

import { AppShell } from "../../components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { StreamChart } from "../../components/charts/stream-chart"
import { WalletBalances } from "../../components/cards/wallet-balances"
import { PayoutsTable } from "../../components/tables/payouts-table"
import { motion } from "framer-motion"
import { TrendingUp, Activity, Zap } from "lucide-react"

export default function DashboardPage() {
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <Zap className="h-6 w-6 text-lime-400" />
              </div>
              <h1 className="text-3xl font-bold text-[#f5eada]">Live Royalty Dashboard</h1>
            </div>
            <p className="text-[#f5eada]/80 text-lg max-w-2xl">
              Real-time streaming royalties powered by Somnia in Streams. Track your NFT performance and earnings across all platforms.
            </p>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-2 border-lime-500/30 bg-gradient-to-br from-lime-500/20 via-cyan-500/10 to-yellow-500/20 backdrop-blur-xl text-[#f5eada] shadow-2xl hover:shadow-lime-500/20 transition-all duration-300 group">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
              </div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-lime-500/20 border border-lime-500/30">
                    <TrendingUp className="h-6 w-6 text-lime-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#f5eada]/70 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-[#f5eada] tracking-tight">$7,854.27</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-lime-400 font-medium">+12.5%</span>
                    <span className="text-xs text-[#f5eada]/50">vs last month</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-lime-400 to-lime-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 via-magenta-500/10 to-orange-500/20 backdrop-blur-xl text-[#f5eada] shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
              </div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                    <Activity className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#f5eada]/70 font-medium">Active Streams</p>
                  <p className="text-3xl font-bold text-[#f5eada] tracking-tight">12</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cyan-400 font-medium">+3 new</span>
                    <span className="text-xs text-[#f5eada]/50">this week</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 0.9, duration: 1 }}
                  />
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-2 border-magenta-500/30 bg-gradient-to-br from-magenta-500/20 via-lime-500/10 to-cyan-500/20 backdrop-blur-xl text-[#f5eada] shadow-2xl hover:shadow-magenta-500/20 transition-all duration-300 group">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
              </div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-magenta-500/20 border border-magenta-500/30">
                    <Zap className="h-6 w-6 text-magenta-400" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-magenta-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#f5eada]/70 font-medium">This Month</p>
                  <p className="text-3xl font-bold text-[#f5eada] tracking-tight">+24.3%</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-magenta-400 font-medium">trending up</span>
                    <span className="text-xs text-[#f5eada]/50">vs last month</span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-magenta-400 to-magenta-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "95%" }}
                    transition={{ delay: 1.0, duration: 1 }}
                  />
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="grid grid-cols-1 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
                    <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
            </div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Activity className="h-5 w-5 text-lime-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#f5eada]">Live Royalty Streams</CardTitle>
              </div>
          </CardHeader>
            
            <CardContent className="relative z-10">
            <StreamChart />
          </CardContent>
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </Card>

        <WalletBalances />
        <PayoutsTable />
        </motion.div>
      </div>
    </AppShell>
  )
}
