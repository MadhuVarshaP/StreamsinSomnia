/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ShoppingCart, DollarSign, Users, TrendingUp, Image as ImageIcon } from 'lucide-react'
import { useRoyaltyRouter, useRoyaltyRouterInfo, useActiveListings, useStreamingRoyaltyNFT, useAllNFTs } from '@/hooks/use-contracts'
import { TransactionVerification } from '@/components/ui/transaction-verification'
import { NFTCard } from './nft-card'

interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  price?: string
}

export function NFTMarketplace() {
  const { address, isConnected } = useAccount()
  const { buyNFT, isPending: isBuying, isConfirmed: isBuyConfirmed, hash: buyHash, contractAddress } = useRoyaltyRouter()
  const { nftContract } = useRoyaltyRouterInfo()
  const { tokenIds, listings } = useActiveListings()
  const { } = useStreamingRoyaltyNFT()
  const { allNFTs, isLoading: isLoadingNFTs } = useAllNFTs()
  
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null)
  const [showBuyVerification, setShowBuyVerification] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [localBuyHash, setLocalBuyHash] = useState<`0x${string}` | null>(null)

  // Combine token IDs with their listing data
  const activeListings = tokenIds.map((tokenId, index) => ({
    tokenId,
    seller: listings[index]?.seller || '',
    price: listings[index]?.price ? (Number(listings[index].price) / 1e18).toFixed(4) : '0',
    active: listings[index]?.active || false
  })).filter(listing => listing.active)

  // Create a map of listed NFTs for quick lookup
  const listedNFTsMap = new Map(activeListings.map(listing => [listing.tokenId.toString(), listing]))

  // Add listing info to all NFTs
  const allNFTsWithListingInfo = allNFTs.map(nft => {
    const listing = listedNFTsMap.get(nft.tokenId.toString())
    return {
      ...nft,
      isListed: !!listing,
      listingPrice: listing?.price || '0',
      seller: listing?.seller || nft.owner
    }
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
    if (!address) return
    
    try {
      const txHash = await buyNFT(tokenId, price)
      // do not show immediately; wait for wallet to broadcast and hash available
      setLocalBuyHash(txHash as `0x${string}`)
      setSelectedNFT(null)
    } catch (error) {
      console.error('Buy error:', error)
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
                    {activeListings.length > 0 ? (activeListings.reduce((sum, listing) => sum + parseFloat(listing.price), 0) / activeListings.length).toFixed(4) : '0.0000'} ETH
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

            
            {/* Royalty Router Info */}
            {/* {nftContract && metaContract && (
              <div className="mt-4 p-3 rounded-lg bg-black/20 border border-lime-500/10">
                <p className="text-xs text-[#f5eada]/60 mb-2">Royalty Router Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#f5eada]/60">NFT Contract:</span>
                    <span className="text-lime-400 ml-2">{nftContract.slice(0, 6)}...{nftContract.slice(-4)}</span>
                  </div>
                  <div>
                    <span className="text-[#f5eada]/60">Meta Contract:</span>
                    <span className="text-cyan-400 ml-2">{metaContract.slice(0, 6)}...{metaContract.slice(-4)}</span>
                  </div>
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>
      </motion.div>

      {/* NFT Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-8"
      >
        {isLoadingNFTs ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-full h-48 bg-lime-500/20 rounded-lg mb-4" />
                  <div className="h-4 bg-lime-500/20 rounded mb-2" />
                  <div className="h-4 bg-lime-500/20 rounded w-2/3" />
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
                <p className="text-2xl font-bold text-lime-400">{selectedNFT.price} ETH</p>
              </div>
              
              {/* Royalty Information */}
              <div className="p-3 rounded-lg bg-black/20 border border-lime-500/10">
                <p className="text-sm text-[#f5eada]/60 mb-2">Transaction Breakdown</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#f5eada]/80">Sale Price:</span>
                    <span className="text-lime-400">{selectedNFT.price} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#f5eada]/80">Royalty (10%):</span>
                    <span className="text-cyan-400">{(parseFloat(selectedNFT.price || '0') * 0.1).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between border-t border-lime-500/20 pt-1">
                    <span className="text-[#f5eada]/80">Seller Receives:</span>
                    <span className="text-orange-400">{(parseFloat(selectedNFT.price || '0') * 0.9).toFixed(4)} ETH</span>
                  </div>
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
                  disabled={isBuying}
                  className="flex-1 bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"
                >
                  {isBuying ? 'Processing...' : 'Purchase'}
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
