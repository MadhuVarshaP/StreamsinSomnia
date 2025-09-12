'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSTTToken } from '@/hooks/use-contracts'
import { useToast } from '@/hooks/use-toast'
import { Coins, Loader2 } from 'lucide-react'

export function STTTokenBalance() {
  const { address, isConnected } = useAccount()
  const { balance, symbol, getSTTTokens, isPending, refetchBalance } = useSTTToken()
  const { toast } = useToast()
  const [isGettingTokens, setIsGettingTokens] = useState(false)

  const handleGetSTTTokens = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    setIsGettingTokens(true)
    try {
      await getSTTTokens('1000')
      
      toast({
        title: "STT Tokens Received!",
        description: "You've received 1000 STT tokens. Your balance will update shortly.",
        duration: 5000,
      })
      
      // Refetch balance after a short delay
      setTimeout(() => {
        refetchBalance()
      }, 3000)
      
    } catch (error) {
      console.error('Error getting STT tokens:', error)
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to get STT tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGettingTokens(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* STT Balance Display */}
      <Badge 
        variant="secondary" 
        className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Coins className="h-3 w-3" />
          <span className="font-mono text-sm">
            {balance ? parseFloat(balance).toFixed(2) : '0.00'} {symbol || 'STT'}
          </span>
        </div>
      </Badge>

      {/* Get STT Tokens Button */}
      <Button
        onClick={handleGetSTTTokens}
        disabled={isPending || isGettingTokens}
        size="sm"
        className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-500/50 transition-all duration-300"
      >
        {isPending || isGettingTokens ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Getting...
          </>
        ) : (
          <>
            <Coins className="h-4 w-4 mr-2" />
            Get STT
          </>
        )}
      </Button>
    </div>
  )
}
