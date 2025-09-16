/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ShoppingCart, DollarSign, Users, TrendingUp, Image as ImageIcon } from 'lucide-react'
import { useRoyaltyRouter, useRoyaltyRouterInfo, useActiveListings, useStreamingRoyaltyNFT, useAllNFTs, useSTTToken } from '@/hooks/use-contracts'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'
import { TransactionVerification } from '@/components/ui/transaction-verification'
import { NFTCard } from './nft-card'
import { useToast } from '@/hooks/use-toast'

interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  price?: string
}

export function NFTMarketplace() {
  const { address, isConnected } = useAccount()
  const { buyNFT, isPending: isBuying, isConfirmed: isBuyConfirmed, hash: buyHash, contractAddress } = useRoyaltyRouter()
  const { nftContract, tokenContract } = useRoyaltyRouterInfo()
  const { tokenIds, listings, refetch: refetchListings } = useActiveListings()
  const { } = useStreamingRoyaltyNFT()
  const { allNFTs, isLoading: isLoadingNFTs, refetch: refetchNFTs } = useAllNFTs()
  const { approveSTT, balance: sttBalance, useSTTAllowance, refetchBalance } = useSTTToken()
  const { toast } = useToast()
  
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null)
  const [showBuyVerification, setShowBuyVerification] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [localBuyHash, setLocalBuyHash] = useState<`0x${string}` | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  

  // Get current STT allowance for the router
  const { data: currentAllowance } = useSTTAllowance(
    address as `0x${string}`, 
    CONTRACT_ADDRESSES.ROYALTY_ROUTER as `0x${string}`
  )

  // Combine token IDs with their listing data
  const activeListings = tokenIds.map((tokenId, index) => ({
    tokenId,
    seller: listings[index]?.seller || '',
    price: listings[index]?.price ? (Number(listings[index].price) / 1e18).toFixed(2) : '0',
    active: listings[index]?.active || false
  })).filter(listing => listing.active)

  // Create a map of listed NFTs for quick lookup
  const listedNFTsMap = new Map(activeListings.map(listing => [listing.tokenId.toString(), listing]))

  // Add listing info to all NFTs and filter out owned NFTs
  const allNFTsWithListingInfo = allNFTs
    .map(nft => {
      const listing = listedNFTsMap.get(nft.tokenId.toString())
      return {
        ...nft,
        isListed: !!listing,
        listingPrice: listing?.price || '0',
        seller: listing?.seller || nft.owner
      }
    })
    .filter(nft => {
      // Only show NFTs that are listed for sale
      return nft.isListed
    })


  // Avoid hydration mismatches: gate rendering until mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show verification popup when purchase completes
  useEffect(() => {
    if (localBuyHash) {
      setShowBuyVerification(true)
    }
  }, [localBuyHash])

  const handleBuyNFT = async (tokenId: bigint, price: string) => {
    if (!address || !tokenContract) return
    
    try {
      // First, check if we have enough STT balance
      const requiredAmount = parseFloat(price)
      const currentBalance = parseFloat(sttBalance)
      
      if (currentBalance < requiredAmount) {
        toast({
          title: "Insufficient Balance",
          description: `You have ${currentBalance.toFixed(2)} STT but need ${requiredAmount.toFixed(2)} STT.`,
          variant: "destructive",
        })
        return
      }

      // Check current allowance
      const allowanceAmount = currentAllowance ? parseFloat(formatEther(currentAllowance)) : 0
      
      // If allowance is insufficient, approve first
      if (allowanceAmount < requiredAmount) {
        setIsApproving(true)
        try {
          await approveSTT(CONTRACT_ADDRESSES.ROYALTY_ROUTER as `0x${string}`, price)
          // Wait a moment for the approval to be processed
          await new Promise(resolve => setTimeout(resolve, 2000))
          toast({
            title: "Approval Successful",
            description: "STT tokens approved. Proceeding with purchase...",
            duration: 3000,
          })
        } catch (approveError) {
          console.error('Approval error:', approveError)
          toast({
            title: "Approval Failed",
            description: "Failed to approve STT tokens. Please try again.",
            variant: "destructive",
          })
          setIsApproving(false)
          return
        } finally {
          setIsApproving(false)
        }
      }

      // Now proceed with the purchase
      const txHash = await buyNFT(tokenId)
      setLocalBuyHash(txHash as `0x${string}`)
      setSelectedNFT(null)
      
      // Show success message
      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased NFT #${tokenId.toString()}. The ownership has been transferred to your wallet.`,
        duration: 5000,
      })
      
      // Refresh data after successful purchase
      setTimeout(() => {
        refetchBalance()
        refetchNFTs()
        refetchListings()
        // Trigger a page refresh to update ownership in My Streams
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Buy error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to purchase NFT. Please try again.'
      
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }


  if (!mounted) {
    return null
  }

  if (!isConnected) {
    return (
      <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 text-lime-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[#f5eada]/60">Connect your wallet to view and trade NFTs</p>
        </CardContent>
      </Card>
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
        <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <ShoppingCart className="h-5 w-5 text-lime-400" />
              </div>
              NFT Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                <TrendingUp className="h-5 w-5 text-lime-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Total NFTs</p>
                  <p className="text-lg font-semibold text-lime-400">{allNFTs.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Users className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Active Listings</p>
                  <p className="text-lg font-semibold text-cyan-400">{activeListings.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <DollarSign className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Avg. Price</p>
                  <p className="text-lg font-semibold text-orange-400">
                    {activeListings.length > 0 ? (activeListings.reduce((sum, listing) => sum + parseFloat(listing.price), 0) / activeListings.length).toFixed(2) : '0.00'} STT
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <ShoppingCart className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Router Status</p>
                  <p className="text-lg font-semibold text-yellow-400">
                    {nftContract ? 'Active' : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* NFT Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-8 max-w-7xl mx-auto"
      >
        {isLoadingNFTs ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl h-[520px]">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="animate-pulse h-full flex flex-col">
                  <div className="w-full h-52 bg-lime-500/20" />
                  <div className="flex-1 p-6 space-y-4">
                    <div className="h-6 bg-lime-500/20 rounded mb-2" />
                    <div className="h-4 bg-lime-500/20 rounded w-2/3" />
                    <div className="h-4 bg-lime-500/20 rounded w-1/2" />
                    <div className="h-20 bg-lime-500/20 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : allNFTsWithListingInfo.length === 0 ? (
          <Card className="col-span-full bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-12 w-12 text-lime-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
              <p className="text-[#f5eada]/60">No NFTs have been minted yet. Be the first to mint one!</p>
            </CardContent>
          </Card>
        ) : (
          allNFTsWithListingInfo.map((nft) => (
            <NFTCard
              key={nft.tokenId.toString()}
              tokenId={nft.tokenId}
              owner={nft.owner}
              tokenURI={nft.tokenURI}
              isListed={nft.isListed}
              listingPrice={nft.listingPrice}
              seller={nft.seller}
              onPurchase={(tokenId, price) => setSelectedNFT({
                tokenId,
                owner: nft.seller,
                tokenURI: nft.tokenURI,
                price
              })}
            />
          ))
        )}
      </motion.div>


      {/* Purchase Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-black/80 border-2 border-lime-500/30 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md text-[#f5eada]"
          >
            <h3 className="text-xl font-semibold mb-4">Purchase NFT #{selectedNFT.tokenId.toString()}</h3>
            
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-black/20 border border-lime-500/10">
                <p className="text-sm text-[#f5eada]/60 mb-2">Purchase Price</p>
                <p className="text-2xl font-bold text-lime-400">{selectedNFT.price} STT</p>
              </div>
              
              {/* Royalty Information */}
              <div className="p-3 rounded-lg bg-black/20 border border-lime-500/10">
                <p className="text-sm text-[#f5eada]/60 mb-2">Transaction Breakdown</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#f5eada]/80">Sale Price:</span>
                    <span className="text-lime-400">{selectedNFT.price} STT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#f5eada]/80">Royalty (10%):</span>
                    <span className="text-cyan-400">{(parseFloat(selectedNFT.price || '0') * 0.1).toFixed(2)} STT</span>
                  </div>
                  <div className="flex justify-between border-t border-lime-500/20 pt-1">
                    <span className="text-[#f5eada]/80">Seller Receives:</span>
                    <span className="text-orange-400">{(parseFloat(selectedNFT.price || '0') * 0.9).toFixed(2)} STT</span>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-lime-500/10 border border-lime-500/20">
                  <p className="text-xs text-lime-400/80">
                    ✅ Ownership will be transferred to your wallet
                  </p>
                  <p className="text-xs text-lime-400/80">
                    ✅ Royalty will be distributed to creators automatically
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedNFT(null)}
                  variant="outline"
                  className="flex-1 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleBuyNFT(selectedNFT.tokenId, selectedNFT.price || '0')}
                  disabled={isBuying || isApproving}
                  className="flex-1 bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"                                                                                    
                >
                  {isApproving ? 'Approving...' : isBuying ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Purchase Transaction Verification Popup */}
      {(localBuyHash || buyHash) && (
        <TransactionVerification
          isOpen={showBuyVerification}
          onClose={() => setShowBuyVerification(false)}
          transactionHash={(localBuyHash || buyHash)!}
          transactionType="sell"
          contractAddress={contractAddress}
        />
      )}

    </div>
  )
}
