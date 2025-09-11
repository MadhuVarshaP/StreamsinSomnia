'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ShoppingCart, Users, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useNFTMetadata } from '@/hooks/use-contracts'
import pinataService from '@/lib/pinata'
import Image from 'next/image'

interface NFTCardProps {
  tokenId: bigint
  owner: string
  tokenURI: string
  isListed: boolean
  listingPrice?: string
  seller?: string
  onPurchase?: (tokenId: bigint, price: string) => void
}

export function NFTCard({ 
  tokenId, 
  owner, 
  tokenURI, 
  isListed, 
  listingPrice, 
  onPurchase 
}: NFTCardProps) {
  const { metadata, isLoading: isLoadingMetadata } = useNFTMetadata(tokenURI)
  const [imageError, setImageError] = useState(false)

  const handlePurchase = () => {
    if (onPurchase && listingPrice) {
      onPurchase(tokenId, listingPrice)
    }
  }

  const getImageUrl = () => {
    if (!metadata?.image) return null
    if (metadata.image.startsWith('ipfs://')) {
      return pinataService.getImageUrl(metadata.image)
    }
    return metadata.image
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] hover:border-lime-500/50 transition-all duration-300">
        <CardContent className="p-6">
          {/* NFT Image */}
          <div className="relative mb-6">
            <div className="aspect-video bg-black/60 rounded-xl flex items-center justify-center border border-lime-500/20 overflow-hidden">
              {isLoadingMetadata ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
                </div>
              ) : getImageUrl() && !imageError ? (
                <Image 
                  src={getImageUrl()!} 
                  alt={metadata?.name || `NFT #${tokenId.toString()}`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                  width={100}
                  height={100}
                />
              ) : (
                <ImageIcon className="h-20 w-20 text-lime-400/60" />
              )}
            </div>
            
        
            {/* <div className="absolute -top-2 -right-2 bg-lime-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              #{tokenId.toString()}
            </div>
            
            
            {isListed && (
              <div className="absolute -top-2 -left-2 bg-cyan-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                LISTED
              </div>
            )} */}
          </div>
          
          <div className="space-y-4">
            {/* Title and Owner */}
            <div>
              <h3 className="font-bold text-xl mb-2 text-lime-400">
                {isLoadingMetadata ? (
                  <div className="h-6 bg-lime-500/20 rounded animate-pulse" />
                ) : (
                  metadata?.name || `Somnia Stream #${tokenId.toString()}`
                )}
              </h3>
              <div className="flex items-center gap-2 text-[#f5eada]/60 text-sm">
                <Users className="h-4 w-4" />
                <span>Owner: {owner.slice(0, 6)}...{owner.slice(-4)}</span>
              </div>
            </div>
            
            {/* Description */}
            {metadata?.description && (
              <p className="text-[#f5eada]/70 text-sm line-clamp-2">
                {metadata.description}
              </p>
            )}
            
            {/* Attributes */}
            {metadata?.attributes && metadata.attributes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-[#f5eada]/60 font-medium">Attributes</p>
                <div className="flex flex-wrap gap-2">
                  {metadata.attributes.slice(0, 2).map((attr, index) => (
                    <div key={index} className="px-2 py-1 bg-lime-500/10 border border-lime-500/20 rounded text-xs">
                      <span className="text-[#f5eada]/60">{attr.trait_type}:</span>
                      <span className="text-lime-400 ml-1">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price and Status */}
            <div className="space-y-3">
              {isListed ? (
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-xs text-[#f5eada]/60 mb-1">Listed Price</p>
                  <p className="text-2xl font-bold text-cyan-400">{listingPrice} ETH</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-black/20 border border-lime-500/20">
                  <p className="text-xs text-[#f5eada]/60 mb-1">Status</p>
                  <p className="text-lg font-bold text-lime-400">Not Listed</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              {isListed ? (
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-cyan-500/20 border-2 border-cyan-500/40 text-[#f5eada] py-3 text-lg font-semibold hover:bg-cyan-500/30"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Purchase NFT
                </Button>
              ) : (
                <div className="text-center py-3">
                  <p className="text-[#f5eada]/60 text-sm">This NFT is not listed for sale</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
