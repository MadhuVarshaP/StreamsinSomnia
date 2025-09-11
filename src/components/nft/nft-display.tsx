"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Image as ImageIcon, 
  Crown, 
  Users, 
  TrendingUp, 
  Copy,
  Eye,
  Heart
} from "lucide-react"
import { formatAddress, convertIPFSUrl } from "@/lib/utils"
import Image from "next/image"
import { toast } from "sonner"
import { NFTData } from "@/types/nft"

interface NFTDisplayProps {
  nft: NFTData
  showOwner?: boolean
  isOwned?: boolean
  onViewDetails?: (nft: NFTData) => void
  onSell?: (nft: NFTData) => void
}

export function NFTDisplay({ 
  nft, 
  showOwner = true, 
  isOwned = false, 
  onViewDetails,
  onSell 
}: NFTDisplayProps) {
  const [imageError, setImageError] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const royaltyPercentage = nft.royaltyInfo 
    ? (Number(nft.royaltyInfo[1]) / 10000 * 100).toFixed(1)
    : "0"

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied!`)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const getGradient = (tokenId: bigint) => {
    const gradients = [
      "from-lime-500/20 to-cyan-500/20",
      "from-cyan-500/20 to-orange-500/20", 
      "from-orange-500/20 to-yellow-500/20",
      "from-yellow-500/20 to-lime-500/20",
      "from-pink-500/20 to-purple-500/20",
      "from-purple-500/20 to-blue-500/20"
    ]
    return gradients[Number(tokenId) % gradients.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl hover:shadow-lime-500/20 transition-all duration-300 overflow-hidden">
        {/* NFT Image */}
        <div className="relative aspect-square overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(nft.tokenId)}`}>
            {!imageError ? (
              <Image
                src={convertIPFSUrl(nft.tokenURI)}
                alt={`Somnia NFT #${nft.tokenId.toString()}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-lime-400/60" />
              </div>
            )}
          </div>
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-black/60 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/20"
                onClick={() => onViewDetails?.(nft)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {isOwned && onSell && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"
                  onClick={() => onSell(nft)}
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Token ID Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/60 border-lime-500/30 text-lime-400">
              #{nft.tokenId.toString()}
            </Badge>
          </div>

          {/* Royalty Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/60 border-cyan-500/30 text-cyan-400">
              <Crown className="h-3 w-3 mr-1" />
              {royaltyPercentage}%
            </Badge>
          </div>

          {/* Like Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute bottom-3 right-3 bg-black/60 border-lime-500/30 text-[#f5eada] hover:bg-red-500/20 hover:border-red-500/30"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* NFT Title */}
            <div>
              <h3 className="font-semibold text-lg text-[#f5eada] group-hover:text-lime-400 transition-colors">
                Somnia Stream #{nft.tokenId.toString()}
              </h3>
              <p className="text-sm text-[#f5eada]/60">
                Royalty Streaming NFT
              </p>
            </div>

            {/* Owner Info */}
            {showOwner && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#f5eada]/60" />
                  <span className="text-sm text-[#f5eada]/60">Owner:</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-[#f5eada]/80 font-mono">
                    {formatAddress(nft.owner, 4)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto text-[#f5eada]/60 hover:text-[#f5eada]"
                    onClick={() => copyToClipboard(nft.owner, "Owner address")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Royalty Info */}
            {nft.royaltyInfo && (
              <div className="p-3 rounded-lg bg-black/20 border border-lime-500/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#f5eada]/60">Royalty Receiver:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-cyan-400 font-mono">
                      {formatAddress(nft.royaltyInfo[0], 4)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-1 h-auto text-cyan-400/60 hover:text-cyan-400"
                      onClick={() => copyToClipboard(nft.royaltyInfo![0], "Royalty receiver")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-[#f5eada]/60">Royalty Rate:</span>
                  <span className="text-lime-400 font-semibold">{royaltyPercentage}%</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50"
                onClick={() => onViewDetails?.(nft)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              {isOwned && onSell && (
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"
                  onClick={() => onSell(nft)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sell
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
