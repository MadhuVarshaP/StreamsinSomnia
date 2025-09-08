"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Music, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus,
  TrendingUp,
  Crown
} from "lucide-react"
import { useNFTsByOwner } from "@/hooks/use-contracts"
import { NFTDisplay } from "@/components/nft/nft-display"
import { NFTData } from "@/types/nft"

interface MyStreamsProps {
  onMintNew?: () => void
  onSellNFT?: (nft: NFTData) => void
  onViewDetails?: (nft: NFTData) => void
}

export function MyStreams({ onMintNew, onSellNFT, onViewDetails }: MyStreamsProps) {
  const { address, isConnected } = useAccount()
  const { ownedNFTs, isLoading } = useNFTsByOwner(address)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "royalty">("newest")

  // Filter and sort NFTs
  const filteredNFTs = ownedNFTs
    .filter(nft => 
      nft.tokenId.toString().includes(searchTerm) ||
      nft.tokenURI.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return Number(b.tokenId) - Number(a.tokenId)
        case "oldest":
          return Number(a.tokenId) - Number(b.tokenId)
        case "royalty":
          const aRoyalty = a.royaltyInfo ? Number(a.royaltyInfo[1]) : 0
          const bRoyalty = b.royaltyInfo ? Number(b.royaltyInfo[1]) : 0
          return bRoyalty - aRoyalty
        default:
          return 0
      }
    })

  if (!isConnected) {
    return (
      <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
        <CardContent className="p-8 text-center">
          <Music className="h-12 w-12 text-lime-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[#f5eada]/60">Connect your wallet to view your minted NFTs</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Music className="h-6 w-6 text-lime-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-[#f5eada]">My Streams</CardTitle>
                  <p className="text-[#f5eada]/70">Your minted NFTs and royalty streams</p>
                </div>
              </div>
              <Button
                onClick={onMintNew}
                className="bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600 shadow-lg hover:shadow-lime-500/25 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Mint New NFT
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                <Music className="h-5 w-5 text-lime-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Total NFTs</p>
                  <p className="text-lg font-semibold text-lime-400">{ownedNFTs.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Crown className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Avg. Royalty</p>
                  <p className="text-lg font-semibold text-cyan-400">
                    {ownedNFTs.length > 0 
                      ? (ownedNFTs.reduce((sum, nft) => {
                          const royalty = nft.royaltyInfo ? Number(nft.royaltyInfo[1]) / 100 : 0
                          return sum + royalty
                        }, 0) / ownedNFTs.length).toFixed(1)
                      : "0"
                    }%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Active Streams</p>
                  <p className="text-lg font-semibold text-orange-400">{ownedNFTs.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#f5eada]/40" />
                <Input
                  placeholder="Search by token ID or metadata..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#f5eada]/60" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "royalty")}
                  className="bg-black/40 border border-lime-500/20 text-[#f5eada] rounded-md px-3 py-2 text-sm focus:border-lime-500/40 focus:ring-lime-500/20"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="royalty">Highest Royalty</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" 
                    ? "bg-lime-500 text-white" 
                    : "border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10"
                  }
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" 
                    ? "bg-lime-500 text-white" 
                    : "border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10"
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* NFTs Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-full h-48 bg-lime-500/20 rounded-lg mb-4" />
                    <div className="h-4 bg-lime-500/20 rounded mb-2" />
                    <div className="h-4 bg-lime-500/20 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNFTs.length === 0 ? (
          <Card className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardContent className="p-8 text-center">
              <Music className="h-12 w-12 text-lime-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {ownedNFTs.length === 0 ? "No NFTs Minted Yet" : "No NFTs Found"}
              </h3>
              <p className="text-[#f5eada]/60 mb-4">
                {ownedNFTs.length === 0 
                  ? "You haven't minted any NFTs yet. Start creating your first royalty streaming NFT!"
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {ownedNFTs.length === 0 && onMintNew && (
                <Button
                  onClick={onMintNew}
                  className="bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Mint Your First NFT
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredNFTs.map((nft, index) => (
              <motion.div
                key={nft.tokenId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <NFTDisplay
                  nft={nft}
                  showOwner={false}
                  isOwned={true}
                  onViewDetails={onViewDetails}
                  onSell={onSellNFT}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
