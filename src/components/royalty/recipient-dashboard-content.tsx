"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet,
  History,
  TrendingUp,
  Crown
} from "lucide-react"
import { RecipientDashboard, NFTEarnings } from "@/types/nft"

interface RecipientDashboardContentProps {
  dashboard: RecipientDashboard | null
  nftEarnings: NFTEarnings[]
  isLoading: boolean
  isNFTEarningsLoading: boolean
}

export function RecipientDashboardContent({ 
  dashboard, 
  nftEarnings,
  isLoading, 
  isNFTEarningsLoading
}: RecipientDashboardContentProps) {

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1e18).toFixed(4)
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  const totalEarnings = nftEarnings.reduce((sum, earning) => sum + Number(earning.totalEarnings), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#f5eada]/60">Loading royalty dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Wallet className="h-12 w-12 text-lime-400" />
          <p className="text-sm text-[#f5eada]/60">No royalty data found</p>
          <p className="text-xs text-[#f5eada]/40">Connect your wallet to view royalty information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
          <div className="px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Wallet className="h-6 w-6 text-lime-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#f5eada]">Royalty Dashboard</h1>
                  <p className="text-[#f5eada]/70">Track your royalty earnings and history</p>
                </div>
              </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-lime-500/20 bg-gradient-to-br from-lime-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <Wallet className="h-5 w-5 text-lime-400" />
              </div>
              <div>
                <p className="text-sm text-[#f5eada]/70">Total Earnings</p>
                <p className="text-2xl font-bold text-[#f5eada]">{formatAmount(dashboard.totalEarnings)} STT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <History className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-[#f5eada]/70">Total Records</p>
                <p className="text-2xl font-bold text-[#f5eada]">{dashboard.historyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-[#f5eada]/70">Recent Records</p>
                <p className="text-2xl font-bold text-[#f5eada]">{dashboard.history.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Royalty History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <History className="h-5 w-5 text-lime-400" />
              </div>
              <CardTitle className="text-xl font-bold text-[#f5eada]">Royalty History</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            {dashboard.history.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <History className="h-12 w-12 text-lime-400" />
                  <p className="text-sm text-[#f5eada]/60">No royalty history found</p>
                  <p className="text-xs text-[#f5eada]/40">Royalty payments will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.history.slice(0, 20).map((record, index: number) => (
                  <motion.div
                    key={`${record.nftName}-${record.timestamp}-${index}`}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-lime-500/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-lime-500/20">
                        <TrendingUp className="h-4 w-4 text-lime-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#f5eada]">{record.nftName}</p>
                        <p className="text-sm text-[#f5eada]/70">{formatDate(record.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lime-400">+{formatAmount(record.amount)} STT</p>
                      <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">
                        Royalty Payment
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {dashboard.history.length > 20 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-[#f5eada]/60">
                      Showing 20 of {dashboard.history.length} records
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* NFT Earnings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <TrendingUp className="h-5 w-5 text-lime-400" />
              </div>
              <CardTitle className="text-xl font-bold text-[#f5eada]">Per-NFT Earnings Summary</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            {isNFTEarningsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-6 w-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-[#f5eada]/60">Loading NFT earnings...</p>
                </div>
              </div>
            ) : nftEarnings.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-lime-400" />
                  <p className="text-sm text-[#f5eada]/60">No NFT earnings found</p>
                  <p className="text-xs text-[#f5eada]/40">Earnings will appear here when NFTs you&apos;re involved in generate royalties</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Total Earnings Summary */}
                <div className="p-4 bg-black/20 rounded-lg border border-lime-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#f5eada]/70">Total Earnings Across All NFTs</p>
                      <p className="text-2xl font-bold text-lime-400">{formatAmount(BigInt(totalEarnings))} STT</p>
                    </div>
                    <div className="p-2 rounded-lg bg-lime-500/20">
                      <TrendingUp className="h-6 w-6 text-lime-400" />
                    </div>
                  </div>
                </div>

                {/* Individual NFT Earnings */}
                {nftEarnings.map((earning, index) => (
                  <motion.div
                    key={`${earning.nftName}-${earning.tokenId}`}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-lime-500/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-lime-500/20">
                        <Crown className="h-4 w-4 text-lime-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#f5eada]">{earning.nftName}</p>
                        <p className="text-sm text-[#f5eada]/70">Token ID: #{earning.tokenId.toString()}</p>
                        <p className="text-xs text-[#f5eada]/50">Share: {earning.sharePercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lime-400">{formatAmount(earning.totalEarnings)} STT</p>
                      <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">
                        Total Earnings
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
