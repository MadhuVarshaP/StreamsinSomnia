/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { AppShell } from "../../components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { StreamChart } from "../../components/charts/stream-chart"
import { NFTMarketplace } from "../../components/marketplace/nft-marketplace"
import { motion } from "framer-motion"
import { TrendingUp, Activity, Zap, Music, Users, Crown } from "lucide-react"
import { useAllNFTs, useActiveListings, useStreamingRoyaltyNFT } from "../../hooks/use-contracts"
import { useAccount } from "wagmi"

export default function DashboardPage() {
  const { address } = useAccount()
  const { allNFTs, totalSupply, isLoading } = useAllNFTs()
  const { tokenIds, listings } = useActiveListings()
  const { totalSupply: nftTotalSupply } = useStreamingRoyaltyNFT()

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

           {/* NFT Marketplace */}
           <NFTMarketplace />

       

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

     
        </motion.div>
      </div>
    </AppShell>
  )
}
