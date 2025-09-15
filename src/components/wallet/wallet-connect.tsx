'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <Badge 
          variant="secondary" 
          className="bg-lime-500/10 border-lime-500/30 text-lime-400 hover:bg-lime-500/20 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse mr-2" />
          Connected
        </Badge>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyAddress}
            className="bg-black/40 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50 transition-all duration-300"
          >
            {copied ? (
              <Check className="h-4 w-4 text-lime-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnect()}
            className="bg-black/40 border-lime-500/30 text-[#f5eada] hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="hidden md:block text-sm text-[#f5eada]/80 ">
          {shortenAddress(address,4)}
        </div>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="relative overflow-hidden bg-black/40 border-2 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50 shadow-lg hover:shadow-lime-500/20 transition-all duration-300 backdrop-blur-xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <span className="font-medium">Connect Wallet</span>
            <div className="w-1 h-1 rounded-full bg-[#f5eada]/40 group-hover:bg-[#f5eada]/60 transition-colors duration-300" />
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-black/80 border-lime-500/30 backdrop-blur-xl text-[#f5eada]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="h-6 w-6 text-lime-400" />
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full justify-start bg-black/40 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50 transition-all duration-300 h-12"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-lime-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{connector.name}</div>
                  <div className="text-xs text-[#f5eada]/60">
                    {connector.type === 'injected' ? 'Browser Extension' : 
                     connector.type === 'walletConnect' ? 'Mobile & Desktop' : 
                     'Wallet Connection'}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="text-xs text-[#f5eada]/60 text-center pt-2">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}
