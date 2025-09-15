'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Coins, Network } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'
import { motion } from 'framer-motion'

const CHAIN_NAMES: Record<number, { name: string; color: string; isTarget: boolean }> = {
  50312: { name: 'Somnia Testnet', color: 'lime', isTarget: true },
  1: { name: 'Ethereum', color: 'blue', isTarget: false },
  11155111: { name: 'Sepolia', color: 'purple', isTarget: false },
  137: { name: 'Polygon', color: 'purple', isTarget: false },
  42161: { name: 'Arbitrum', color: 'blue', isTarget: false },
  10: { name: 'Optimism', color: 'red', isTarget: false },
}

export function WalletInfo() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({
    address,
  })

  if (!isConnected || !address) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-500/20 to-cyan-500/20 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-lime-400" />
            </div>
            Wallet Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#f5eada]/80">Address</span>
              <div className="flex items-center gap-2">
                <span className=" text-sm text-[#f5eada]">
                  {shortenAddress(address, 6)}
                </span>
                <Badge 
                  variant="secondary" 
                  className="bg-lime-500/10 border-lime-500/30 text-lime-400 text-xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse mr-1" />
                  Connected
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#f5eada]/80">Network</span>
              <div className="flex items-center gap-2">
                <Network className={`h-4 w-4 ${
                  CHAIN_NAMES[chainId]?.isTarget ? 'text-lime-400' : 'text-red-400'
                }`} />
                <span className="text-sm text-[#f5eada]">
                  {CHAIN_NAMES[chainId]?.name || `Chain ${chainId}`}
                </span>
                {CHAIN_NAMES[chainId]?.isTarget && (
                  <Badge 
                    variant="secondary" 
                    className="bg-lime-500/10 border-lime-500/30 text-lime-400 text-xs"
                  >
                    <div className="w-1 h-1 rounded-full bg-lime-400 animate-pulse mr-1" />
                    Correct
                  </Badge>
                )}
              </div>
            </div>
            
            {balance && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#f5eada]/80">Balance</span>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-[#f5eada] ">
                    {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-2 border-t border-lime-500/20">
            <div className="text-xs text-[#f5eada]/60">
              Your wallet is connected and ready to interact with Somnia in Streams
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
