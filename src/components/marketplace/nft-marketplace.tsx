'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { ShoppingCart, DollarSign, Users, TrendingUp, Image as ImageIcon } from 'lucide-react'
import { useStreamingRoyaltyNFT, useRoyaltyRouter, useRoyaltyRouterInfo } from '@/hooks/use-contracts'
import { TransactionVerification } from '@/components/ui/transaction-verification'

interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  price?: string
}

export function NFTMarketplace() {
  const { address, isConnected } = useAccount()
  const { totalSupply } = useStreamingRoyaltyNFT()
  const { sellNFT, isPending: isSelling, isConfirmed: isSaleConfirmed, hash: saleHash, contractAddress } = useRoyaltyRouter()
  const { nftContract, metaContract } = useRoyaltyRouterInfo()
  
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null)
  const [salePrice, setSalePrice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showSaleVerification, setShowSaleVerification] = useState(false)

  // Load NFTs - simplified for demo
  useEffect(() => {
    const loadNFTs = async () => {
      if (!totalSupply) return
      
      setIsLoading(true)
      const nftData: NFTData[] = []
      
      try {
        // For demo purposes, create mock NFTs based on total supply
        for (let i = 1; i <= Number(totalSupply || 0); i++) {
            nftData.push({
              tokenId: BigInt(i),
              owner: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock owner
              tokenURI: `https://api.somnia.streams/nft/${i}`,
              price: (Math.random() * 2 + 0.1).toFixed(2) // Mock price
            })
        }
        setNfts(nftData)
      } catch (error) {
        console.error('Error loading NFTs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNFTs()
  }, [totalSupply])

  // Show verification popup when sale is confirmed
  useEffect(() => {
    if (isSaleConfirmed && saleHash) {
      setShowSaleVerification(true)
    }
  }, [isSaleConfirmed, saleHash])

  const handleSellNFT = async (nft: NFTData) => {
    if (!address || !salePrice) return
    
    try {
      await sellNFT(nft.tokenId, nft.owner as `0x${string}`, address as `0x${string}`, salePrice)
      setSelectedNFT(null)
      setSalePrice('')
    } catch (error) {
      console.error('Sell error:', error)
    }
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
                  <p className="text-lg font-semibold text-lime-400">{totalSupply?.toString() || '0'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Users className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Active Listings</p>
                  <p className="text-lg font-semibold text-cyan-400">{nfts.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <DollarSign className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Avg. Price</p>
                  <p className="text-lg font-semibold text-orange-400">
                    {nfts.length > 0 ? (nfts.reduce((sum, nft) => sum + parseFloat(nft.price || '0'), 0) / nfts.length).toFixed(2) : '0.00'} ETH
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
            {nftContract && metaContract && (
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
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* NFT Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
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
        ) : nfts.length === 0 ? (
          <Card className="col-span-full bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-12 w-12 text-lime-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
              <p className="text-[#f5eada]/60">No NFTs have been minted yet. Be the first to mint one!</p>
            </CardContent>
          </Card>
        ) : (
          nfts.map((nft, index) => (
            <motion.div
              key={nft.tokenId.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl hover:shadow-lime-500/20 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-lime-500/20 to-cyan-500/20 rounded-lg mb-4 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-lime-400/60" />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">Somnia NFT #{nft.tokenId.toString()}</h3>
                      <p className="text-sm text-[#f5eada]/60">Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#f5eada]/60">Price</p>
                        <p className="text-lg font-semibold text-lime-400">{nft.price} ETH</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-lime-500/10 border-lime-500/30 text-lime-400"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse mr-1" />
                        Listed
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => setSelectedNFT(nft)}
                      className="w-full bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600 transition-all duration-300"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Sale Modal */}
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
              <div>
                <label className="block text-sm text-[#f5eada]/60 mb-2">Sale Price (ETH)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40"
                  placeholder="0.1"
                />
              </div>
              
              {/* Royalty Information */}
              {salePrice && (
                <div className="p-3 rounded-lg bg-black/20 border border-lime-500/10">
                  <p className="text-sm text-[#f5eada]/60 mb-2">Transaction Breakdown</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#f5eada]/80">Sale Price:</span>
                      <span className="text-lime-400">{salePrice} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#f5eada]/80">Royalty (10%):</span>
                      <span className="text-cyan-400">{(parseFloat(salePrice) * 0.1).toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between border-t border-lime-500/20 pt-1">
                      <span className="text-[#f5eada]/80">Seller Receives:</span>
                      <span className="text-orange-400">{(parseFloat(salePrice) * 0.9).toFixed(4)} ETH</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setSelectedNFT(null)}
                  variant="outline"
                  className="flex-1 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSellNFT(selectedNFT)}
                  disabled={isSelling || !salePrice}
                  className="flex-1 bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"
                >
                  {isSelling ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sale Transaction Verification Popup */}
      {saleHash && (
        <TransactionVerification
          isOpen={showSaleVerification}
          onClose={() => setShowSaleVerification(false)}
          transactionHash={saleHash}
          transactionType="sell"
          contractAddress={contractAddress}
        />
      )}
    </div>
  )
}
