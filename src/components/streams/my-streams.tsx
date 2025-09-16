"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus,
  TrendingUp,
  Crown
} from "lucide-react"
import { useRoyaltyRouter, useRoyaltyDistributions, useRoyaltyClaiming } from "@/hooks/use-contracts"
import { RoyaltyDistribution } from "@/types/nft"
import { CONTRACT_ADDRESSES, STREAMING_ROYALTY_NFT_ABI } from "@/lib/contracts"
import { createPublicClient, http, decodeEventLog } from "viem"
import { somniaTestnet } from "@/lib/wagmi"
import { useToast } from "@/hooks/use-toast"
import { shortenAddress } from "@/lib/utils"
import Image from "next/image"


// Public client for on-chain data fetching
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http('https://dream-rpc.somnia.network'),
})

interface MyStreamsProps {
  onMintNew?: () => void
}

export function MyStreams({ onMintNew }: MyStreamsProps) {
  const { address, isConnected } = useAccount()
  const { listNFT } = useRoyaltyRouter()
  const { toast } = useToast()
  const { royaltyDistributions } = useRoyaltyDistributions()
  const { withdrawRoyalties, getCreatorEarnings } = useRoyaltyClaiming()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "royalty">("newest")
  const [mounted, setMounted] = useState(false)
  
  // Selling state
  const [listingNFTs, setListingNFTs] = useState<Set<string>>(new Set())
  
  // Withdrawal state
  const [withdrawingNFTs, setWithdrawingNFTs] = useState<Set<string>>(new Set())
  const [creatorEarnings, setCreatorEarnings] = useState<Map<string, string>>(new Map())
  
  // On-chain data fetching
  const [ownedNFTs, setOwnedNFTs] = useState<Array<{ 
    tokenId: bigint; 
    owner: string; 
    tokenURI: string; 
    royaltyInfo?: [string, bigint];
    royaltyEarnings?: string; // Total STT earned from this NFT
    originalListingPrice?: string; // Original price when NFT was first listed
    isMintedByUser?: boolean; // Track if this NFT was minted by the current user
    // On-chain metadata
    name?: string;
    description?: string;
    imageUrl?: string;
    splitterAddress?: string;
  }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalRoyaltyEarnings, setTotalRoyaltyEarnings] = useState("0")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch owned NFTs and royalty earnings on-chain
  const fetchOwnedNFTsOnChain = useCallback(async () => {
    if (!address || !isConnected) {
      setOwnedNFTs([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // Get total supply to know how many NFTs exist
      const totalSupply = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
        abi: STREAMING_ROYALTY_NFT_ABI,
        functionName: 'nextId',
      })

      const ownedNFTsList: Array<{ 
        tokenId: bigint; 
        owner: string; 
        tokenURI: string; 
        royaltyInfo?: [string, bigint];
        royaltyEarnings?: string;
        originalListingPrice?: string;
        isMintedByUser?: boolean;
        // On-chain metadata
        name?: string;
        description?: string;
        imageUrl?: string;
        splitterAddress?: string;
      }> = []

      let totalEarnings = BigInt(0)

      // Check each token ID to see if user owns it (start from 1, not 0)
      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const tokenId = BigInt(i)
          
          // Get owner of this token
          const owner = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
            abi: STREAMING_ROYALTY_NFT_ABI,
            functionName: 'ownerOf',
            args: [tokenId],
          })

          // If user owns this NFT
          if (owner.toLowerCase() === address.toLowerCase()) {
            // Get basic NFT data
            const [tokenURI, royaltyInfo, splitterAddress] = await Promise.all([
              publicClient.readContract({
                address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
                abi: STREAMING_ROYALTY_NFT_ABI,
                functionName: 'tokenURI',
                args: [tokenId],
              }),
              publicClient.readContract({
                address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
                abi: STREAMING_ROYALTY_NFT_ABI,
                functionName: 'royaltyInfo',
                args: [tokenId, BigInt('1000000000000000000')], // 1 STT for calculation
              }),
              publicClient.readContract({
                address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
                abi: STREAMING_ROYALTY_NFT_ABI,
                functionName: 'tokenSplitters',
                args: [tokenId],
              })
            ])

            // Calculate royalty percentage from the returned amount
            const royaltyPercentage = (Number(royaltyInfo[1]) / Number(BigInt('1000000000000000000'))) * 100

            // Check if this NFT was minted by the current user
            let isMintedByUser = false
            try {
              // Get mint events for this token to check if current user was the minter
              const mintEvents = await publicClient.getLogs({
                address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
                event: {
                  type: 'event',
                  name: 'Transfer',
                  inputs: [
                    { name: 'from', type: 'address', indexed: true },
                    { name: 'to', type: 'address', indexed: true },
                    { name: 'tokenId', type: 'uint256', indexed: true }
                  ]
                },
                args: {
                  from: '0x0000000000000000000000000000000000000000', // Mint event (from zero address)
                  to: address,
                  tokenId: tokenId
                }
              })
              isMintedByUser = mintEvents.length > 0
            } catch {
              console.log('Could not check mint status for token:', tokenId.toString())
            }

            // Try to fetch metadata from IPFS, but don't fail if it's not accessible
            let name = `NFT #${tokenId.toString()}`
            let description = "Somnia Streaming NFT"
            let imageUrl = "https://via.placeholder.com/400x400/00ff88/000000?text=Streaming+NFT"
            
            try {
              if (tokenURI && tokenURI.startsWith('ipfs://')) {
                const ipfsUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                const response = await fetch(ipfsUrl)
                if (response.ok) {
                  const metadata = await response.json()
                  name = metadata.name || name
                  description = metadata.description || description
                  // Handle IPFS image URLs by converting them to gateway URLs
                  if (metadata.image) {
                    if (metadata.image.startsWith('ipfs://')) {
                      imageUrl = metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                    } else {
                      imageUrl = metadata.image
                    }
                  }
                }
              }
            } catch (metadataErr) {
              console.log(`Could not fetch metadata for token ${tokenId}, using defaults:`, metadataErr)
            }

            // Calculate royalty earnings and get original listing price from transaction history
            let royaltyEarnings = "0"
            let originalListingPrice = "0"
            try {
              // Get all SaleSettled events for this tokenId (limit block range to avoid RPC errors)
              const currentBlock = await publicClient.getBlockNumber()
              const fromBlock = currentBlock > BigInt(1000) ? currentBlock - BigInt(1000) : BigInt(0)
              
              const saleEvents = await publicClient.getLogs({
                address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
                event: {
                  type: 'event',
                  name: 'SaleSettled',
                  inputs: [
                    { name: 'tokenId', type: 'uint256', indexed: true },
                    { name: 'salePrice', type: 'uint256', indexed: false },
                    { name: 'royalty', type: 'uint256', indexed: false }
                  ]
                },
                args: {
                  tokenId: tokenId
                },
                fromBlock,
                toBlock: currentBlock
              })

              // Calculate total royalty earnings and get the most recent sale price
              let totalEarnings = BigInt(0)
              let latestSalePrice = BigInt(0)
              
              for (const event of saleEvents) {
                const decoded = decodeEventLog({
                  abi: [
                    {
                      type: 'event',
                      name: 'SaleSettled',
                      inputs: [
                        { name: 'tokenId', type: 'uint256', indexed: true },
                        { name: 'salePrice', type: 'uint256', indexed: false },
                        { name: 'royalty', type: 'uint256', indexed: false }
                      ]
                    }
                  ],
                  data: event.data,
                  topics: event.topics,
                })
                
                if (decoded.eventName === 'SaleSettled') {
                  totalEarnings += decoded.args.royalty as bigint
                  latestSalePrice = decoded.args.salePrice as bigint
                }
              }
              
              royaltyEarnings = totalEarnings.toString()
              // Convert the latest sale price to STT (assuming 18 decimals)
              originalListingPrice = (Number(latestSalePrice) / 1e18).toFixed(2)
            } catch (earningsErr) {
              console.log(`Could not calculate earnings for token ${tokenId}:`, earningsErr)
            }

            ownedNFTsList.push({
              tokenId,
              owner,
              tokenURI,
              royaltyInfo: [royaltyInfo[0], BigInt(Math.round(royaltyPercentage * 100))], // Store as basis points
              royaltyEarnings,
              originalListingPrice,
              isMintedByUser,
              name,
              description,
              imageUrl,
              splitterAddress
            })

            totalEarnings += BigInt(royaltyEarnings)
          }
        } catch (err) {
          // Token doesn't exist or other error, continue
          console.log(`Token ${i} not found or error:`, err)
        }
      }

      setOwnedNFTs(ownedNFTsList)
      setTotalRoyaltyEarnings(totalEarnings.toString())
    } catch (error) {
      console.error('Error fetching owned NFTs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchOwnedNFTsOnChain()
  }, [fetchOwnedNFTsOnChain])




  // Handle listing NFT for sale using original minting price
  const handleListNFT = async (tokenId: bigint, originalPrice: string) => {
    const tokenIdStr = tokenId.toString()
    
    try {
      // Add this NFT to the listing set
      setListingNFTs(prev => new Set(prev).add(tokenIdStr))
      
      await listNFT(tokenId, originalPrice)
      toast({
        title: "NFT Listed Successfully!",
        description: `NFT #${tokenIdStr} has been listed for ${originalPrice} STT with original royalty share`,
        duration: 5000,
      })
    } catch (error) {
      console.error('List NFT error:', error)
      toast({
        title: "Failed to List NFT",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      // Remove this NFT from the listing set
      setListingNFTs(prev => {
        const newSet = new Set(prev)
        newSet.delete(tokenIdStr)
        return newSet
      })
    }
  }

  // Fetch creator earnings for minted NFTs
  const fetchCreatorEarnings = useCallback(async () => {
    if (!address || !isConnected) return

    const earningsMap = new Map<string, string>()
    
    for (const nft of ownedNFTs) {
      if (nft.isMintedByUser && nft.splitterAddress) {
        try {
          const earnings = await getCreatorEarnings(nft.splitterAddress, address, nft.tokenId)
          earningsMap.set(nft.tokenId.toString(), earnings.toString())
        } catch (err) {
          console.error(`Error fetching earnings for NFT ${nft.tokenId}:`, err)
          earningsMap.set(nft.tokenId.toString(), '0')
        }
      }
    }
    
    setCreatorEarnings(earningsMap)
  }, [address, isConnected, ownedNFTs, getCreatorEarnings])

  // Handle withdrawal of creator earnings
  const handleWithdrawEarnings = async (tokenId: bigint, splitterAddress: string) => {
    const tokenIdStr = tokenId.toString()
    
    try {
      setWithdrawingNFTs(prev => new Set(prev).add(tokenIdStr))
      
      await withdrawRoyalties(splitterAddress, tokenId)
      
      toast({
        title: "Earnings Withdrawn Successfully!",
        description: `Royalty earnings for NFT #${tokenIdStr} have been transferred to your wallet`,
        duration: 5000,
      })
      
      // Refresh earnings data
      setTimeout(() => {
        fetchCreatorEarnings()
      }, 2000)
      
    } catch (error) {
      console.error('Withdraw earnings error:', error)
      toast({
        title: "Failed to Withdraw Earnings",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setWithdrawingNFTs(prev => {
        const newSet = new Set(prev)
        newSet.delete(tokenIdStr)
        return newSet
      })
    }
  }

  // Fetch creator earnings when ownedNFTs change
  useEffect(() => {
    fetchCreatorEarnings()
  }, [fetchCreatorEarnings])

  // Filter and sort NFTs
  const filteredNFTs = ownedNFTs
    .filter(nft => 
      nft.tokenId.toString().includes(searchTerm) ||
      (nft.name && nft.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nft.description && nft.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
          <div className="h-12 w-12 bg-lime-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <div className="h-6 w-6 bg-lime-400 rounded" />
          </div>
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
          <div className="p-8 text-center">
            <div className="h-12 w-12 bg-lime-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-lime-400" />
                </div>
                  <h2 className="text-2xl text-[#f5eada] font-semibold">My Streams</h2>
                  <p className="text-[#f5eada]/70">Your minted NFTs and royalty streams</p>
          </div>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-lime-500/10 border border-lime-500/20">
                <div className="h-5 w-5 bg-lime-400 rounded" />
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
                  <div className="h-6 w-6 bg-lime-400 rounded" />
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
                <div className="h-5 w-5 bg-lime-400 rounded" />
                <div>
                  <p className="text-sm text-[#f5eada]/60">Total NFTs</p>
                  <p className="text-lg font-semibold text-lime-400">{ownedNFTs.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
               
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
                  <p className="text-sm text-[#f5eada]/60">Total Royalty Earnings</p>
                  <p className="text-lg font-semibold text-orange-400">{parseFloat(totalRoyaltyEarnings).toFixed(2)} STT</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-8 max-w-7xl mx-auto">
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
              <div className="h-12 w-12 bg-lime-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="h-6 w-6 bg-lime-400 rounded" />
              </div>
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
          <div className={`grid gap-8 ${
            viewMode === "grid" 
              ? "grid-cols-1 lg:grid-cols-2 px-4 md:px-8 max-w-7xl mx-auto" 
              : "grid-cols-1 px-4 md:px-8"
          }`}>
            {filteredNFTs.map((nft) => (
              <div
                key={nft.tokenId.toString()}
              >
                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900/60 via-black/50 to-slate-800/40 border-2 border-lime-500/30 backdrop-blur-xl text-[#f5eada] transition-all duration-300 hover:border-lime-500/50 hover:shadow-[0_0_40px_-12px_rgba(163,230,53,0.35)] hover:from-slate-800/70 hover:via-black/60 hover:to-slate-700/50 w-full h-[580px] flex flex-col rounded-xl shadow-sm">
                  <div className="flex flex-col h-full p-0">
                    <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-slate-800/80 to-black/90 border-b border-lime-500/20">
                      <Image 
                        src={nft.imageUrl || "https://via.placeholder.com/400x400/00ff88/000000?text=Streaming+NFT"} 
                        alt={nft.name || `NFT #${nft.tokenId.toString()}`}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder image if image fails to load
                          e.currentTarget.src = "https://via.placeholder.com/400x400/00ff88/000000?text=Streaming+NFT"
                        }}
                      />
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
                          {nft.name || `NFT #${nft.tokenId.toString()}`}
                        </h3>
                        {nft.description && (
                          <p className="text-sm text-[#f5eada]/70 mb-2 line-clamp-2">
                            {nft.description}
                          </p>
                        )}
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
                          {nft.royaltyEarnings && parseFloat(nft.royaltyEarnings) > 0 && (
                            <div className="px-3 py-2 bg-yellow-500/15 border border-yellow-500/30 rounded-lg text-xs font-medium">
                              <span className="text-[#f5eada]/70">Earnings:</span>
                              <span className="text-yellow-400 ml-1 font-semibold">
                                {parseFloat(nft.royaltyEarnings).toFixed(2)} STT
                              </span>
                            </div>
                          )}
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

                        {/* Sell NFT Button */}
                        <Button
                          onClick={() => {
                            if (nft.originalListingPrice) {
                              handleListNFT(nft.tokenId, nft.originalListingPrice)
                            }
                          }}
                          disabled={listingNFTs.has(nft.tokenId.toString()) || !nft.originalListingPrice}
                          className="w-full bg-gradient-to-r from-cyan-500/25 to-blue-500/20 border-2 border-cyan-500/50 text-[#f5eada] py-3 text-lg font-semibold hover:from-cyan-500/35 hover:to-blue-500/30 hover:border-cyan-400/70 ring-1 ring-inset ring-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {listingNFTs.has(nft.tokenId.toString()) ? 'Listing...' : 'Sell NFT'}
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

      {/* My Minted NFTs Section */}
      {ownedNFTs.filter(nft => nft.isMintedByUser).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-black/40 border-2 border-purple-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
            <div className="px-6 py-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Plus className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl text-[#f5eada] font-semibold">My Minted NFTs</h2>
                  <p className="text-[#f5eada]/70">NFTs you created and their royalty earnings</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedNFTs
                  .filter(nft => nft.isMintedByUser)
                  .map((nft) => (
                    <div key={nft.tokenId.toString()} className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                            <Plus className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-purple-400">NFT #{nft.tokenId.toString()}</h4>
                            <p className="text-sm text-[#f5eada]/60">
                              Royalty Rate: {nft.royaltyInfo ? `${(Number(nft.royaltyInfo[1]) / 10000).toFixed(1)}%` : '0%'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#f5eada]/60">Total Earnings:</span>
                            <span className="font-bold text-purple-400">
                              {(parseFloat(nft.royaltyEarnings || '0') / 1e18).toFixed(2)} STT
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#f5eada]/60">Withdrawable:</span>
                            <span className="font-bold text-yellow-400">
                              {(parseFloat(creatorEarnings.get(nft.tokenId.toString()) || '0') / 1e18).toFixed(2)} STT
                            </span>
                          </div>
                          
                          {nft.originalListingPrice && parseFloat(nft.originalListingPrice) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[#f5eada]/60">Original Price:</span>
                              <span className="text-sm text-[#f5eada]">
                                {nft.originalListingPrice} STT
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#f5eada]/60">Status:</span>
                            <span className="text-sm text-lime-400">Minted by You</span>
                          </div>
                          
                          {/* Withdraw Button */}
                          {parseFloat(creatorEarnings.get(nft.tokenId.toString()) || '0') > 0 && nft.splitterAddress && (
                            <Button
                              onClick={() => handleWithdrawEarnings(nft.tokenId, nft.splitterAddress!)}
                              disabled={withdrawingNFTs.has(nft.tokenId.toString())}
                              className="w-full bg-gradient-to-r from-yellow-500/25 to-orange-500/20 border-2 border-yellow-500/50 text-[#f5eada] py-2 text-sm font-semibold hover:from-yellow-500/35 hover:to-orange-500/30 hover:border-yellow-400/70 ring-1 ring-inset ring-yellow-400/30 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {withdrawingNFTs.has(nft.tokenId.toString()) ? 'Withdrawing...' : 'Withdraw Earnings'}
                            </Button>
                          )}
                        </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Royalty Earnings Section */}
      {ownedNFTs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-black/40 border-2 border-yellow-500/30 backdrop-blur-xl text-[#f5eada] shadow-2xl rounded-xl">
            <div className="px-6 py-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Crown className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl text-[#f5eada] font-semibold">Royalty Earnings</h2>
                  <p className="text-[#f5eada]/70">Track your earnings from NFT sales and royalty distributions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="h-5 w-5 bg-yellow-400 rounded" />
                  <div>
                    <p className="text-sm text-[#f5eada]/60">Total Royalty Earnings</p>
                    <p className="text-lg font-semibold text-yellow-400">{(parseFloat(totalRoyaltyEarnings) / 1e18).toFixed(2)} STT</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="h-5 w-5 bg-green-400 rounded" />
                  <div>
                    <p className="text-sm text-[#f5eada]/60">NFTs with Royalties</p>
                    <p className="text-lg font-semibold text-green-400">
                      {ownedNFTs.filter(nft => nft.royaltyEarnings && parseFloat(nft.royaltyEarnings) > 0).length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="h-5 w-5 bg-blue-400 rounded" />
                  <div>
                    <p className="text-sm text-[#f5eada]/60">Avg. Royalty Rate</p>
                    <p className="text-lg font-semibold text-blue-400">
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
              </div>

              {/* Individual NFT Royalty Earnings */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#f5eada] mb-4">Per-NFT Royalty History</h3>
                {ownedNFTs
                  .filter(nft => nft.royaltyEarnings && parseFloat(nft.royaltyEarnings) > 0)
                  .map((nft) => (
                    <div key={nft.tokenId.toString()} className="bg-black/20 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                            <Crown className="h-6 w-6 text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-400">NFT #{nft.tokenId.toString()}</h4>
                            <p className="text-sm text-[#f5eada]/60">
                              Royalty Rate: {nft.royaltyInfo ? `${(Number(nft.royaltyInfo[1]) / 10000).toFixed(1)}%` : '0%'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-400">
                            {(parseFloat(nft.royaltyEarnings || '0') / 1e18).toFixed(2)} STT
                          </p>
                          <p className="text-xs text-[#f5eada]/60">Total Earned</p>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {ownedNFTs.filter(nft => nft.royaltyEarnings && parseFloat(nft.royaltyEarnings) > 0).length === 0 && (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 bg-yellow-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Crown className="h-6 w-6 text-yellow-400" />
                    </div>
                    <p className="text-[#f5eada]/60">No royalty earnings yet</p>
                    <p className="text-sm text-[#f5eada]/40">Royalties will appear here when your NFTs are sold</p>
                  </div>
                )}
              </div>

              {/* Detailed Royalty Distribution History */}
              {royaltyDistributions.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[#f5eada] mb-4">Recent Royalty Distributions</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {royaltyDistributions.slice(0, 10).map((distribution: RoyaltyDistribution, index: number) => (
                      <div key={index} className="bg-black/20 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                              <Crown className="h-4 w-4 text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-yellow-400">
                                Royalty Distribution
                              </p>
                              <p className="text-xs text-[#f5eada]/60">
                                Splitter: {shortenAddress(distribution.splitterAddress)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-yellow-400">
                              +{(parseFloat(distribution.amount) / 1e18).toFixed(2)} STT
                            </p>
                            <p className="text-xs text-[#f5eada]/60">
                              {new Date(distribution.timestamp * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  )
}
