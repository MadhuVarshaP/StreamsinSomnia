"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { motion } from "framer-motion"
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
  Crown,
  DollarSign,
  Tag
} from "lucide-react"
import { useNFTsByOwner, useRoyaltyRouter } from "@/hooks/use-contracts"
import { useToast } from "@/hooks/use-toast"
import { shortenAddress } from "@/lib/utils"

interface MyStreamsProps {
  onMintNew?: () => void
}

export function MyStreams({ onMintNew }: MyStreamsProps) {
  const { address, isConnected } = useAccount()
  const { ownedNFTs, isLoading, refetch } = useNFTsByOwner(address)
  const { listNFT } = useRoyaltyRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "royalty">("newest")
  const [listingPrice, setListingPrice] = useState("")
  const [selectedNFTForListing, setSelectedNFTForListing] = useState<bigint | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle listing NFT for sale
  const handleListNFT = async (tokenId: bigint, price: string) => {
    try {
      await listNFT(tokenId, price)
      toast({
        title: "NFT Listed Successfully!",
        description: `NFT #${tokenId.toString()} has been listed for ${price} STT`,
        duration: 5000,
      })
      setSelectedNFTForListing(null)
      setListingPrice("")
      // Refresh the data to show updated listing status
      setTimeout(() => {
        refetch()
      }, 2000)
    } catch (error) {
      console.error('List NFT error:', error)
      toast({
        title: "Failed to List NFT",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    }
  }

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
      <div className="space-y-6">
        <div className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
          <div className="p-8 text-center">
            <Music className="h-12 w-12 text-lime-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-[#f5eada]/60">Connect your wallet to view your minted NFTs</p>
          </div>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Music className="h-6 w-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-2xl text-[#f5eada] font-semibold">My Streams</h2>
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
          </div>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                <Music className="h-5 w-5 text-lime-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Total NFTs</p>
                  <p className="text-lg font-semibold text-lime-400">0</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Crown className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Avg. Royalty</p>
                  <p className="text-lg font-semibold text-cyan-400">0%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Active Streams</p>
                  <p className="text-lg font-semibold text-orange-400">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <div className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Music className="h-6 w-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-2xl text-[#f5eada] font-semibold">My Streams</h2>
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
          </div>
          <div className="px-6 pb-6">
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
                          const royalty = nft.royaltyInfo ? Number(nft.royaltyInfo[1]) / 10000 : 0
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
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div>
        <div className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
          <div className="p-4">
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
          </div>
        </div>
      </div>

      {/* NFTs Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
                <div className="p-6">
                  <div className="animate-pulse">
                    <div className="w-full h-48 bg-lime-500/20 rounded-lg mb-4" />
                    <div className="h-4 bg-lime-500/20 rounded mb-2" />
                    <div className="h-4 bg-lime-500/20 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNFTs.length === 0 ? (
          <div className="bg-black/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
            <div className="p-8 text-center">
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
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3  px-4 md:px-8" 
              : "grid-cols-1 px-4 md:px-8"
          }`}>
            {filteredNFTs.map((nft) => (
              <div
                key={nft.tokenId.toString()}
              >
                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900/60 via-black/50 to-slate-800/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] transition-all duration-300 hover:border-lime-500/50 hover:shadow-[0_0_40px_-12px_rgba(163,230,53,0.35)] hover:from-slate-800/70 hover:via-black/60 hover:to-slate-700/50 w-full h-[580px] flex flex-col rounded-xl shadow-sm">
                  <div className="flex flex-col h-full p-0">
                    <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-slate-800/80 to-black/90 border-b border-lime-500/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="h-20 w-20 text-lime-400/60" />
                      </div>
                      <div className="absolute top-3 left-3 rounded-full border border-green-400/40 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-green-300 backdrop-blur-sm shadow-lg shadow-green-500/20">
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Owned
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col space-y-3 p-6">
                      <div>
                        <h3 className="font-bold text-xl mb-1 text-lime-400 tracking-wide">
                          NFT #{nft.tokenId.toString()}
                        </h3>
                        <div className="flex items-center gap-2 text-[#f5eada]/70 text-sm font-medium">
                          <Crown className="h-4 w-4 text-cyan-400" />
                          <span className="">Owner: {shortenAddress(nft.owner)}</span>
                        </div>
                      </div>

                      {nft.royaltyInfo && (
                        <div className="space-y-1">
                          <p className="text-xs text-[#f5eada]/70 font-semibold uppercase tracking-wide">Royalty Info</p>
                          <div className="px-3 py-2 bg-lime-500/15 border border-lime-500/30 rounded-lg text-xs font-medium">
                            <span className="text-[#f5eada]/70">Rate:</span>
                            <span className="text-lime-400 ml-1 font-semibold">
                              {(Number(nft.royaltyInfo[1]) / 10000).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="h-px bg-lime-500/10" />

                      <div className="space-y-3 mt-auto">
                        <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-700/30 to-slate-800/20 border border-lime-500/20 shadow-lg shadow-lime-500/5">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-lime-500/5 to-transparent" />
                          <div className="relative">
                            <p className="text-xs text-[#f5eada]/70 mb-1 font-semibold uppercase tracking-wide">Status</p>
                            <p className="text-lg font-bold text-lime-400">Not Listed</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => setSelectedNFTForListing(nft.tokenId)}
                          className="w-full bg-gradient-to-r from-cyan-500/25 to-blue-500/20 border-2 border-cyan-500/50 text-[#f5eada] py-3 text-lg font-semibold hover:from-cyan-500/35 hover:to-blue-500/30 hover:border-cyan-400/70 ring-1 ring-inset ring-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300"
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          Sell NFT
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List NFT Modal */}
      {selectedNFTForListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/80 border-2 border-lime-500/30 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md text-[#f5eada]">
            <h3 className="text-xl font-semibold mb-4">List NFT #{selectedNFTForListing.toString()}</h3>
            
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-black/20 border border-lime-500/10">
                <p className="text-sm text-[#f5eada]/60 mb-2">Set Listing Price</p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    placeholder="0.1"
                    className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                  />
                  <span className="text-sm text-[#f5eada]/60">STT</span>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300/80">
                  <strong>Note:</strong> Once listed, your NFT will be available for purchase on the marketplace. 
                  You can unlist it anytime by calling the contract directly.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setSelectedNFTForListing(null)
                  setListingPrice("")
                }}
                variant="outline"
                className="flex-1 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleListNFT(selectedNFTForListing, listingPrice)}
                disabled={!listingPrice || parseFloat(listingPrice) <= 0}
                className="flex-1 bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                List for Sale
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
