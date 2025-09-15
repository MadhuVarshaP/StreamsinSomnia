"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle, Copy, X, ExternalLinkIcon } from "lucide-react"
import { toast } from "sonner"
import { shortenAddress } from "@/lib/utils"

interface TransactionVerificationProps {
  isOpen: boolean
  onClose: () => void
  transactionHash: string
  transactionType: "mint" | "sell" | "deploy"
  contractAddress?: string
}

export function TransactionVerification({
  isOpen,
  onClose,
  transactionHash,
  transactionType,
  contractAddress
}: TransactionVerificationProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [copied, setCopied] = useState(false)

  const explorerUrl = `https://shannon-explorer.somnia.network/tx/${transactionHash}`
  const contractUrl = contractAddress ? `https://shannon-explorer.somnia.network/address/${contractAddress}` : null

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} copied to clipboard!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  const getTransactionTitle = () => {
    switch (transactionType) {
      case "mint":
        return "NFT Minted Successfully!"
      case "sell":
        return "NFT Sale Completed!"
      case "deploy":
        return "Contract Deployed!"
      default:
        return "Transaction Confirmed!"
    }
  }

  const getTransactionDescription = () => {
    switch (transactionType) {
      case "mint":
        return "Your NFT has been successfully minted and is now live on the Somnia testnet."
      case "sell":
        return "Your NFT sale has been processed and royalties have been distributed."
      case "deploy":
        return "Your smart contract has been deployed and is ready for use."
      default:
        return "Your transaction has been confirmed on the blockchain."
    }
  }

  const getTransactionIcon = () => {
    switch (transactionType) {
      case "mint":
        return "🎨"
      case "sell":
        return "💰"
      case "deploy":
        return "🚀"
      default:
        return "✅"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="bg-black/90 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTransactionIcon()}</div>
                    <div>
                      <CardTitle className="text-lg text-[#f5eada]">
                        {getTransactionTitle()}
                      </CardTitle>
                      <p className="text-sm text-[#f5eada]/70 mt-1">
                        {getTransactionDescription()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-[#f5eada]/60 hover:text-[#f5eada] hover:bg-lime-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Transaction Hash */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#f5eada]/80">Transaction Hash</span>
                    <Badge variant="secondary" className="bg-lime-500/10 border-lime-500/30 text-lime-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirmed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-lime-500/20">
                    <code className="text-xs text-[#f5eada]/80  flex-1">
                      {shortenAddress(transactionHash, 8)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transactionHash, "Transaction hash")}
                      className="text-[#f5eada]/60 hover:text-[#f5eada] hover:bg-lime-500/10 p-1"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Contract Address (if applicable) */}
                {contractAddress && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-[#f5eada]/80">Contract Address</span>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-black/40 border border-lime-500/20">
                      <code className="text-xs text-[#f5eada]/80  flex-1">
                        {shortenAddress(contractAddress, 8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(contractAddress, "Contract address")}
                        className="text-[#f5eada]/60 hover:text-[#f5eada] hover:bg-lime-500/10 p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => window.open(explorerUrl, '_blank')}
                    className="flex-1 bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600 transition-all duration-300"
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                  {contractUrl && (
                    <Button
                      onClick={() => window.open(contractUrl, '_blank')}
                      variant="outline"
                      className="border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Network Info */}
                <div className="pt-2 border-t border-lime-500/20">
                  <div className="flex items-center justify-between text-xs text-[#f5eada]/60">
                    <span>Network</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                      <span>Somnia Testnet</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
