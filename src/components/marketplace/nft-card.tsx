"use client"

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
      {/* Card container with unique gradient background */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900/60 via-black/50 to-slate-800/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] transition-all duration-300 hover:border-lime-500/50 hover:shadow-[0_0_40px_-12px_rgba(163,230,53,0.35)] hover:from-slate-800/70 hover:via-black/60 hover:to-slate-700/50">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.1),transparent_50%)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* soft top accent line */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
        
        {/* Subtle corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-lime-500/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-tr-full" />

        <CardContent className="p-6">
          {/* Media block flush to card edges (left, right, top) */}
          <div className="-mx-6 -mt-6 mb-6">
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-800/80 to-black/90 border-b border-lime-500/20">
              {isLoadingMetadata ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
                </div>
              ) : getImageUrl() && !imageError ? (
                <>
                  <Image 
                    src={getImageUrl()!}
                    alt={metadata?.name || `NFT #${tokenId.toString()}`}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                  {/* subtle bottom gradient to separate from content */}
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-20 w-20 text-lime-400/60" />
                </div>
              )}

              {/* Listed badge - enhanced with glow */}
              {isListed && (
                <div className="absolute left-3 top-3 rounded-full border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-sm shadow-lg shadow-cyan-500/20">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Listed
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Title and Owner */}
            <div>
              <h3 className="font-bold text-xl mb-2 text-lime-400">
                {isLoadingMetadata ? (
                  <div className="h-6 w-40 bg-lime-500/20 rounded animate-pulse" />
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

            {/* Divider */}
            <div className="h-px bg-lime-500/10" />

            {/* Price and Status */}
            <div className="space-y-3">
              {isListed ? (
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent" />
                  <div className="relative">
                    <p className="text-xs text-cyan-300/80 mb-1 font-medium">Listed Price</p>
                    <p className="text-2xl font-bold text-cyan-400 drop-shadow-sm">{listingPrice} STT</p>
                  </div>
                </div>
              ) : (
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-700/30 to-slate-800/20 border border-lime-500/20 shadow-lg shadow-lime-500/5">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-lime-500/5 to-transparent" />
                  <div className="relative">
                    <p className="text-xs text-[#f5eada]/60 mb-1 font-medium">Status</p>
                    <p className="text-lg font-bold text-lime-400">Not Listed</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isListed ? (
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-cyan-500/25 to-blue-500/20 border-2 border-cyan-500/50 text-[#f5eada] py-3 text-lg font-semibold hover:from-cyan-500/35 hover:to-blue-500/30 hover:border-cyan-400/70 ring-1 ring-inset ring-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Purchase NFT
                </Button>
              ) : (
                <div className="text-center py-4 px-3 rounded-lg bg-slate-800/30 border border-slate-600/30">
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