'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Network, AlertTriangle, Check } from 'lucide-react'

const CHAIN_NAMES: Record<number, { name: string; color: string; isTarget: boolean }> = {
  50312: { name: 'Somnia Testnet', color: 'lime', isTarget: true },
  1: { name: 'Ethereum', color: 'blue', isTarget: false },
  11155111: { name: 'Sepolia', color: 'purple', isTarget: false },
  137: { name: 'Polygon', color: 'purple', isTarget: false },
  42161: { name: 'Arbitrum', color: 'blue', isTarget: false },
  10: { name: 'Optimism', color: 'red', isTarget: false },
}

export function NetworkSwitcher() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const [showDialog, setShowDialog] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix hydration error by ensuring component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-switch to Somnia testnet when wallet connects
  useEffect(() => {
    if (isConnected && chainId !== 50312 && !isPending) {
      switchChain({ chainId: 50312 })
    }
  }, [isConnected, chainId, isPending, switchChain])

  const currentChain = CHAIN_NAMES[chainId]
  const isCorrectNetwork = chainId === 50312

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-24 bg-lime-500/10 border border-lime-500/20 rounded animate-pulse" />
        <div className="h-6 w-20 bg-lime-500/10 border border-lime-500/20 rounded animate-pulse" />
      </div>
    )
  }

  if (!isConnected) {
    return null
  }

  const handleSwitchToSomnia = () => {
    switchChain({ chainId: 50312 })
    setShowDialog(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`relative overflow-hidden transition-all duration-300 ${
              isCorrectNetwork
                ? 'bg-lime-500/10 border-lime-500/50 text-lime-400 hover:bg-lime-500/20'
                : 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentChain?.name || `Chain ${chainId}`}
              </span>
              {!isCorrectNetwork && (
                <AlertTriangle className="h-3 w-3 animate-pulse" />
              )}
            </div>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-black/80 border-lime-500/30 backdrop-blur-xl text-[#f5eada]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Network className="h-6 w-6 text-lime-400" />
              Switch Network
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-lime-500/10 border border-lime-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="font-medium text-lime-400">Recommended Network</span>
              </div>
              <p className="text-sm text-[#f5eada]/80">
                Somnia in Streams is optimized for the Somnia Testnet. Please switch to continue.
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleSwitchToSomnia}
                disabled={isPending || isCorrectNetwork}
                className="w-full justify-start bg-lime-500/20 border-lime-500/50 text-lime-400 hover:bg-lime-500/30 h-12"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Network className="h-4 w-4 text-lime-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Somnia Testnet</div>
                    <div className="text-xs text-lime-400/60">
                      Chain ID: 50312 • Recommended
                    </div>
                  </div>
                  {isCorrectNetwork && (
                    <Check className="h-4 w-4 text-lime-400 ml-auto" />
                  )}
                </div>
              </Button>
            </div>
            
            <div className="text-xs text-[#f5eada]/60 text-center pt-2">
              {isPending ? 'Switching network...' : 'Make sure you have the Somnia Testnet added to your wallet.'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Network Status Badge */}
      <Badge 
        variant="secondary" 
        className={`${
          isCorrectNetwork
            ? 'bg-lime-500/10 border-lime-500/30 text-lime-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${
          isCorrectNetwork ? 'bg-lime-400' : 'bg-red-400'
        } animate-pulse mr-1`} />
        {isCorrectNetwork ? 'Correct Network' : 'Wrong Network'}
      </Badge>
    </div>
  )
}
