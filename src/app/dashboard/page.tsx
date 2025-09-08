/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { AppShell } from "../../components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { StreamChart } from "../../components/charts/stream-chart"
import { NFTMarketplace } from "../../components/marketplace/nft-marketplace"
import { motion } from "framer-motion"
import { TrendingUp, Activity, Zap, Music, Users, Crown } from "lucide-react"
import { useAllNFTs } from "../../hooks/use-contracts"
import { useAccount } from "wagmi"

export default function DashboardPage() {
  const { address } = useAccount()
  const { allNFTs, totalSupply, isLoading } = useAllNFTs()

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

        {/* NFT Analytics - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                  <Music className="h-5 w-5 text-lime-400" />
                  <div>
                    <p className="text-xs text-[#f5eada]/60">Total NFTs</p>
                    <p className="text-lg font-bold text-lime-400">
                      {isLoading ? "..." : totalSupply?.toString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <Users className="h-5 w-5 text-cyan-400" />
                  <div>
                    <p className="text-xs text-[#f5eada]/60">Owners</p>
                    <p className="text-lg font-bold text-cyan-400">
                      {isLoading ? "..." : new Set(allNFTs.map(nft => nft.owner)).size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Crown className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-[#f5eada]/60">Avg. Royalty</p>
                    <p className="text-lg font-bold text-orange-400">
                      {isLoading ? "..." : allNFTs.length > 0 
                        ? (allNFTs.reduce((sum, nft) => {
                            const royalty = nft.royaltyInfo ? Number(nft.royaltyInfo[1]) / 100 : 0
                            return sum + royalty
                          }, 0) / allNFTs.length).toFixed(1)
                        : "0"
                      }%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-[#f5eada]/60">Active</p>
                    <p className="text-lg font-bold text-purple-400">
                      {isLoading ? "..." : allNFTs.length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Minted NFTs - Top Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-[#f5eada]">
                <Music className="h-5 w-5 text-lime-400" />
                Minted NFTs
              </CardTitle>
              <p className="text-[#f5eada]/70 text-sm">Latest NFTs on Somnia testnet</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
                      <CardContent className="p-4">
                        <div className="animate-pulse">
                          <div className="w-full h-32 bg-lime-500/20 rounded-lg mb-3" />
                          <div className="h-3 bg-lime-500/20 rounded mb-2" />
                          <div className="h-3 bg-lime-500/20 rounded w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : allNFTs.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="h-8 w-8 text-lime-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No NFTs Minted Yet</h3>
                  <p className="text-[#f5eada]/60 text-sm">Be the first to mint an NFT on the Somnia testnet!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {allNFTs.slice(0, 8).map((nft, index) => (
                    <motion.div
                      key={nft.tokenId.toString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <NFTDisplay
                        nft={nft}
                        showOwner={true}
                        isOwned={nft.owner === address}
                        onViewDetails={(nft) => {
                          // Handle view details
                          console.log('View details for NFT:', nft)
                        }}
                        onSell={nft.owner === address ? (nft) => {
                          // Handle sell NFT
                          console.log('Sell NFT:', nft)
                        } : undefined}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div> */}
        </motion.div>
      </div>
    </AppShell>
  )
}
