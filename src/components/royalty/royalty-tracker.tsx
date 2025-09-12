'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Users, Activity, Zap } from 'lucide-react'
import { useStreamingRoyaltyNFT, useRoyaltySplitter } from '@/hooks/use-contracts'

interface RoyaltyEvent {
  id: string
  tokenId: bigint
  amount: string
  timestamp: number
  type: 'sale' | 'royalty'
  from: string
  to: string
}

export function RoyaltyTracker() {
  const { address, isConnected } = useAccount()
  const { balance } = useStreamingRoyaltyNFT()
  const { shares } = useRoyaltySplitter()
  
  const [royaltyEvents, setRoyaltyEvents] = useState<RoyaltyEvent[]>([])
  const [totalEarnings, setTotalEarnings] = useState('0')
  const [isLoading, setIsLoading] = useState(true)

  // Mock royalty events (in production, you'd listen to contract events)
  useEffect(() => {
    const generateMockEvents = () => {
      const events: RoyaltyEvent[] = []
      const now = Date.now()
      
      for (let i = 0; i < 10; i++) {
        events.push({
          id: `event-${i}`,
          tokenId: BigInt(Math.floor(Math.random() * 5) + 1),
          amount: (Math.random() * 0.5 + 0.01).toFixed(4),
          timestamp: now - (i * 3600000), // 1 hour intervals
          type: Math.random() > 0.5 ? 'sale' : 'royalty',
          from: `0x${Math.random().toString(16).substr(2, 40)}`,
          to: address || `0x${Math.random().toString(16).substr(2, 40)}`,
        })
      }
      
      setRoyaltyEvents(events.sort((a, b) => b.timestamp - a.timestamp))
      setTotalEarnings(events.reduce((sum, event) => sum + parseFloat(event.amount), 0).toFixed(4))
      setIsLoading(false)
    }

    if (isConnected) {
      generateMockEvents()
    }
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-lime-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[#f5eada]/60">Connect your wallet to view royalty earnings</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <TrendingUp className="h-5 w-5 text-lime-400" />
              </div>
              Royalty Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                <DollarSign className="h-5 w-5 text-lime-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Total Earnings</p>
                  <p className="text-lg font-semibold text-lime-400">{totalEarnings} STT</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Users className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Your NFTs</p>
                  <p className="text-lg font-semibold text-cyan-400">{balance?.toString() || '0'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-magenta-500/10 border border-magenta-500/20">
                <Activity className="h-5 w-5 text-magenta-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Total Events</p>
                  <p className="text-lg font-semibold text-magenta-400">{royaltyEvents.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Zap className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Avg. per Event</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    {royaltyEvents.length > 0 ? (parseFloat(totalEarnings) / royaltyEvents.length).toFixed(4) : '0.0000'} STT
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Royalty Events */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              Recent Royalty Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-lime-500/20 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : royaltyEvents.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-lime-400/60 mx-auto mb-4" />
                <p className="text-[#f5eada]/60">No royalty events yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {royaltyEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-lime-500/10 hover:bg-lime-500/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        event.type === 'sale' ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        {event.type === 'sale' ? (
                          <DollarSign className="h-5 w-5 text-green-400" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {event.type === 'sale' ? 'NFT Sale' : 'Royalty Payment'}
                        </p>
                        <p className="text-sm text-[#f5eada]/60">
                          Token #{event.tokenId.toString()} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lime-400">+{event.amount} STT</p>
                      <Badge 
                        variant="secondary" 
                        className={`${
                          event.type === 'sale' 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }`}
                      >
                        {event.type === 'sale' ? 'Sale' : 'Royalty'}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Split Info */}
      {shares && shares.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-magenta-500/20">
                  <Users className="h-5 w-5 text-magenta-400" />
                </div>
                Revenue Split Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shares.map((share, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-lime-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-500/20 to-cyan-500/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-lime-400">
                          {share.account.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{share.account.slice(0, 6)}...{share.account.slice(-4)}</p>
                        <p className="text-sm text-[#f5eada]/60">Recipient</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-magenta-400">{(Number(share.bps) / 100).toFixed(1)}%</p>
                      <p className="text-sm text-[#f5eada]/60">{share.bps.toString()} bps</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
