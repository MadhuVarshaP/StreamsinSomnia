"use client"

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { DollarSign, Tag, AlertCircle } from 'lucide-react'
import { useRoyaltyRouter } from '@/hooks/use-contracts'
import { toast } from 'sonner'
import { TransactionVerification } from '@/components/ui/transaction-verification'

interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  royaltyInfo?: [string, bigint]
}

interface ListNftFormProps {
  nft: NFTData
  onClose: () => void
  onSuccess?: () => void
}

export function ListNftForm({ nft, onClose, onSuccess }: ListNftFormProps) {
  const { address, isConnected } = useAccount()
  const { sellNFT, isPending: isSelling, isConfirmed: isSaleConfirmed, hash: saleHash, contractAddress } = useRoyaltyRouter()
  
  const [sellingPrice, setSellingPrice] = useState('')
  const [showVerification, setShowVerification] = useState(false)

  const handleListForSale = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      toast.error("Please enter a valid selling price")
      return
    }

    if (address.toLowerCase() !== nft.owner.toLowerCase()) {
      toast.error("You can only list NFTs that you own")
      return
    }

    try {
      toast.loading("Listing NFT for sale...", { id: "list" })
      
      // For now, we'll use a placeholder buyer address
      // In a real implementation, this would be handled by the marketplace
      const buyerAddress = "0x0000000000000000000000000000000000000000" as `0x${string}`
      
      await sellNFT(
        nft.tokenId,
        nft.owner as `0x${string}`,
        buyerAddress,
        sellingPrice
      )
      
      toast.success("NFT listed for sale successfully!", { id: "list" })
      onSuccess?.()
      onClose()
      
    } catch (err) {
      console.error("List error:", err)
      toast.error("Failed to list NFT for sale. Please try again.", { id: "list" })
    }
  }

  // Show verification popup when sale is confirmed
  if (isSaleConfirmed && saleHash) {
    setShowVerification(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-black/80 border-2 border-lime-500/30 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md text-[#f5eada]"
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-lime-500/20">
              <Tag className="h-5 w-5 text-lime-400" />
            </div>
            List NFT for Sale
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleListForSale}>
          <CardContent className="space-y-6">
            {/* NFT Info */}
            <div className="p-4 rounded-lg bg-black/20 border border-lime-500/10">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#f5eada]/60">Token ID:</span>
                  <span className="text-lime-400">#{nft.tokenId.toString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#f5eada]/60">Owner:</span>
                  <span className="text-cyan-400">{nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
                </div>
                {nft.royaltyInfo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#f5eada]/60">Royalty:</span>
                    <span className="text-orange-400">
                      {nft.royaltyInfo[1] ? (Number(nft.royaltyInfo[1]) / 1e18 * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="selling-price" className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Selling Price (ETH)
              </Label>
              <Input
                id="selling-price"
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                placeholder="0.1"
                required
              />
            </div>

            {/* Royalty Information */}
            {nft.royaltyInfo && sellingPrice && (
              <div className="p-4 rounded-lg bg-black/20 border border-cyan-500/10">
                <p className="text-sm text-[#f5eada]/60 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Sale Breakdown
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#f5eada]/80">Sale Price:</span>
                    <span className="text-lime-400">{sellingPrice} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#f5eada]/80">Royalty ({nft.royaltyInfo[1] ? (Number(nft.royaltyInfo[1]) / 1e18 * 100).toFixed(1) : '0'}%):</span>
                    <span className="text-cyan-400">
                      {nft.royaltyInfo[1] ? (parseFloat(sellingPrice) * Number(nft.royaltyInfo[1]) / 1e18).toFixed(4) : '0'} ETH
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-lime-500/20 pt-2">
                    <span className="text-[#f5eada]/80">You Receive:</span>
                    <span className="text-orange-400">
                      {nft.royaltyInfo[1] ? (parseFloat(sellingPrice) - parseFloat(sellingPrice) * Number(nft.royaltyInfo[1]) / 1e18).toFixed(4) : sellingPrice} ETH
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSelling || !sellingPrice || parseFloat(sellingPrice) <= 0}
                className="flex-1 bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"
              >
                {isSelling ? 'Listing...' : 'List for Sale'}
              </Button>
            </div>
          </CardContent>
        </form>
      </motion.div>

      {/* Transaction Verification Popup */}
      {saleHash && (
        <TransactionVerification
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
          transactionHash={saleHash}
          transactionType="list"
          contractAddress={contractAddress}
        />
      )}
    </>
  )
}
