'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { ShoppingCart, DollarSign, Users, TrendingUp, Image as ImageIcon, Tag } from 'lucide-react'
import { useRoyaltyRouter, useRoyaltyRouterInfo, useAllNFTs } from '@/hooks/use-contracts'
import { TransactionVerification } from '@/components/ui/transaction-verification'
import { ListNftForm } from './list-nft-form'

interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  price?: string
}

export function NFTMarketplace() {
  const { address, isConnected } = useAccount()
  const { sellNFT, isPending: isSelling, isConfirmed: isSaleConfirmed, hash: saleHash, contractAddress } = useRoyaltyRouter()
  const { nftContract } = useRoyaltyRouterInfo()
  const { allNFTs, totalSupply, isLoading } = useAllNFTs()
  
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null)
  const [salePrice, setSalePrice] = useState('')
  const [showSaleVerification, setShowSaleVerification] = useState(false)
  const [showListForm, setShowListForm] = useState(false)
  const [nftToList, setNftToList] = useState<NFTData | null>(null)

  // Add mock prices to on-chain NFT data
  const nftsWithPrices = allNFTs.map(nft => ({
    ...nft,
    price: (Math.random() * 2 + 0.1).toFixed(2) // Mock price for now
  }))

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

  const handleListForSale = (nft: NFTData) => {
    setNftToList(nft)
    setShowListForm(true)
  }

  const isOwner = (nft: NFTData) => {
    return address && address.toLowerCase() === nft.owner.toLowerCase()
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
                  <p className="text-lg font-semibold text-cyan-400">{nftsWithPrices.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <DollarSign className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Avg. Price</p>
                  <p className="text-lg font-semibold text-orange-400">
                    {nftsWithPrices.length > 0 ? (nftsWithPrices.reduce((sum, nft) => sum + parseFloat(nft.price || '0'), 0) / nftsWithPrices.length).toFixed(2) : '0.00'} ETH
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
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
        ) : nftsWithPrices.length === 0 ? (
          <Card className="col-span-full bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-12 w-12 text-lime-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
              <p className="text-[#f5eada]/60">No NFTs have been minted yet. Be the first to mint one!</p>
            </CardContent>
          </Card>
        ) : (
          nftsWithPrices.map((nft, index) => (
            <motion.div
              key={nft.tokenId.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada]">
                <CardContent className="p-8">
                  {/* NFT Image */}
                  <div className="relative mb-6">
                    <div className="aspect-video bg-black/60 rounded-xl flex items-center justify-center border border-lime-500/20 overflow-hidden">
                      {nft.tokenURI ? (
                        <img 
                          src={nft.tokenURI} 
                          alt={`NFT #${nft.tokenId.toString()}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                            if (nextElement) {
                              nextElement.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{ display: nft.tokenURI ? 'none' : 'flex' }}>
                        <ImageIcon className="h-20 w-20 text-lime-400/60" />
                      </div>
                    </div>
                    
                    {/* Token ID badge */}
                    <div className="absolute -top-2 -right-2 bg-lime-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      #{nft.tokenId.toString()}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Title and Owner */}
                    <div>
                      <h3 className="font-bold text-2xl mb-3 text-lime-400">
                        Somnia Stream #{nft.tokenId.toString()}
                      </h3>
                      <div className="flex items-center gap-2 text-[#f5eada]/60">
                        <Users className="h-5 w-5" />
                        <span>Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
                      </div>
                    </div>
                    
                    {/* Price and Royalty Info */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-black/20 border border-lime-500/20">
                        <p className="text-sm text-[#f5eada]/60 mb-2">Current Price</p>
                        <p className="text-3xl font-bold text-lime-400">{nft.price} ETH</p>
                      </div>
                      
                      {nft.royaltyInfo && (
                        <div className="p-4 rounded-xl bg-black/20 border border-cyan-500/20">
                          <p className="text-sm text-[#f5eada]/60 mb-2">Royalty Information</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#f5eada]/80">Receiver:</span>
                              <span className="text-cyan-400">{nft.royaltyInfo[0].slice(0, 6)}...{nft.royaltyInfo[0].slice(-4)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#f5eada]/80">Royalty (1 ETH):</span>
                              <span className="text-cyan-400">{nft.royaltyInfo[1] ? (Number(nft.royaltyInfo[1]) / 1e18).toFixed(4) : '0'} ETH</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {isOwner(nft) ? (
                        <Button
                          onClick={() => handleListForSale(nft)}
                          className="w-full bg-lime-500/20 border-2 border-lime-500/40 text-[#f5eada] py-4 text-lg font-semibold"
                        >
                          <Tag className="h-6 w-6 mr-3" />
                          List for Sale
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setSelectedNFT(nft)}
                          className="w-full bg-lime-500/20 border-2 border-lime-500/40 text-[#f5eada] py-4 text-lg font-semibold"
                        >
                          <ShoppingCart className="h-6 w-6 mr-3" />
                          Purchase NFT
                        </Button>
                      )}
                    </div>
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

      {/* List NFT Form Modal */}
      {showListForm && nftToList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <ListNftForm
            nft={nftToList}
            onClose={() => {
              setShowListForm(false)
              setNftToList(null)
            }}
            onSuccess={() => {
              // Refresh the NFT list or update UI
              setShowListForm(false)
              setNftToList(null)
            }}
          />
        </div>
      )}
    </div>
  )
}
