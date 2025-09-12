'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSTTToken } from '@/hooks/use-contracts'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function STTTokenBalance() {
  const { address, isConnected } = useAccount()
  const { 
    balance, 
    symbol, 
    getSTTTokens, 
    isPending, 
    refetchBalance,
    faucetAmount,
    faucetCooldown,
    lastFaucetClaim,
    canClaimFromFaucet
  } = useSTTToken()
  const { toast } = useToast()
  const [isGettingTokens, setIsGettingTokens] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGetSTTTokens = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (!canClaimFromFaucet) {
      const nextClaimTime = new Date((lastFaucetClaim + faucetCooldown) * 1000)
      toast({
        title: "Faucet Cooldown Active",
        description: `You can claim again at ${nextClaimTime.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    setIsGettingTokens(true)
    try {
      await getSTTTokens()
      
      toast({
        title: "STT Tokens Received!",
        description: `You've received ${faucetAmount} STT tokens from the faucet. Your balance will update shortly.`,
        duration: 5000,
      })
      
      // Refetch balance after a short delay
      setTimeout(() => {
        refetchBalance()
      }, 3000)
      
    } catch (error) {
      console.error('Error getting STT tokens:', error)
      let errorMessage = "Failed to get STT tokens. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes('Faucet cooldown not met')) {
          errorMessage = "You need to wait before claiming again from the faucet."
        } else if (error.message.includes('User rejected')) {
          errorMessage = "Transaction was rejected."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGettingTokens(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-6 w-20 bg-lime-500/10 border border-lime-500/20 rounded animate-pulse" />
        <div className="h-8 w-24 bg-lime-500/10 border border-lime-500/20 rounded animate-pulse" />
      </div>
    )
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
          <span className="font-mono text-sm">
            {balance ? parseFloat(balance).toFixed(2) : '0.00'} {symbol || 'STT'}
          </span>
        </div>
      </Badge>

      {/* Get STT Tokens Button */}
      <Button
        onClick={handleGetSTTTokens}
        disabled={isPending || isGettingTokens || !canClaimFromFaucet}
        size="sm"
        className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-500/50 transition-all duration-300 disabled:opacity-50"
        title={!canClaimFromFaucet ? `Next claim available at ${new Date((lastFaucetClaim + faucetCooldown) * 1000).toLocaleString()}` : `Claim ${faucetAmount} STT tokens from faucet`}
      >
        {isPending || isGettingTokens ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Claiming...
          </>
        ) : (
          <>
            {canClaimFromFaucet ? `Get ${faucetAmount} STT` : 'Cooldown Active'}
          </>
        )}
      </Button>
    </div>
  )
}
