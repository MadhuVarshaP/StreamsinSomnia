'use client'

import { useAccount, useChainId } from 'wagmi'
import { motion } from 'framer-motion'
import { AlertTriangle, Network, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface NetworkGuardProps {
  children: React.ReactNode
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  
  const isCorrectNetwork = chainId === 50312

  // If not connected, show the app normally
  if (!isConnected) {
    return <>{children}</>
  }

  // If connected but wrong network, show network switch prompt
  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-black/80 border-2 border-red-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-400">Wrong Network</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-[#f5eada]/80">
                  You&apos;re currently connected to the wrong network.
                </p>
                <p className="text-sm text-[#f5eada]/60">
                  Somnia in Streams requires the Somnia Testnet (Chain ID: 50312)
                </p>
              </div>

              <div className="p-4 rounded-lg bg-lime-500/10 border border-lime-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Network className="h-4 w-4 text-lime-400" />
                  </div>
                  <div>
                    <div className="font-medium text-lime-400">Somnia Testnet</div>
                    <div className="text-xs text-lime-400/60">Chain ID: 50312</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-[#f5eada]/60 mb-4">
                  Please switch to the correct network using the network switcher in the header.
                </p>
                <div className="flex items-center justify-center gap-2 text-lime-400">
                  <span className="text-sm">Use the network switcher</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // If connected and correct network, show the app
  return <>{children}</>
}
