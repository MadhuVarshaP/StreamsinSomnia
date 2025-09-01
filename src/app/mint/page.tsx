"use client"

import { AppShell } from "../../components/app-shell"
import { MintNftForm } from "../../components/forms/mint-nft-form"
import { motion } from "framer-motion"
import { Sparkles, Zap, TrendingUp } from "lucide-react"

export default function MintPage() {
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
                <Sparkles className="h-6 w-6 text-lime-400" />
              </div>
              <h1 className="text-3xl font-bold text-[#f5eada]">Mint Your NFT</h1>
            </div>
            <p className="text-[#f5eada]/80 text-lg max-w-2xl">
              Create unique NFTs with flexible royalty splits and start earning from streaming royalties on Somnia in Streams.
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-6 rounded-xl border border-lime-500/20 bg-gradient-to-br from-lime-500/10 to-cyan-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <Sparkles className="h-5 w-5 text-lime-400" />
              </div>
              <h3 className="font-semibold text-[#f5eada]">Flexible Splits</h3>
            </div>
            <p className="text-sm text-[#f5eada]/70">Set custom royalty percentages for creators, collaborators, and DAOs</p>
          </div>
          
          <div className="p-6 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-[#f5eada]">Instant Streaming</h3>
            </div>
            <p className="text-sm text-[#f5eada]/70">Start earning from streaming royalties immediately after minting</p>
          </div>
          
          <div className="p-6 rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-[#f5eada]">Track Performance</h3>
            </div>
            <p className="text-sm text-[#f5eada]/70">Monitor your NFT&apos;s streaming performance and earnings in real-time</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div 
          className="mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <MintNftForm />
        </motion.div>
      </div>
    </AppShell>
  )
}
