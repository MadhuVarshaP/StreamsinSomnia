"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Upload, Plus, Trash2, Sparkles, Users, Image as ImageIcon, CheckCircle, DollarSign } from "lucide-react"
import { useStreamingRoyaltyNFT, useMintWithSplitter } from "@/hooks/use-contracts"
import { toast } from "sonner"
import { shortenAddress } from "@/lib/utils"
import { TransactionVerification } from "@/components/ui/transaction-verification"
import pinataService from "@/lib/pinata"

type Split = { address: string; percent: number }

export function MintNftForm() {
  const { address, isConnected } = useAccount()
  const { } = useStreamingRoyaltyNFT()
  const { mintWithCustomSplitter, isPending: isMintPending, isConfirming: isMintConfirming, isConfirmed: isMintConfirmed, hash: transactionHash, contractAddress } = useMintWithSplitter()
  
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [splits, setSplits] = useState<Split[]>([
    { address: "", percent: 70 },
    { address: "", percent: 30 },
  ])
  const [image, setImage] = useState<File | null>(null)
  const [royaltyBps, setRoyaltyBps] = useState(1000) // 10% default
  const [listingPrice, setListingPrice] = useState("0.1") // Default listing price
  const [showVerification, setShowVerification] = useState(false)
  const [mounted, setMounted] = useState(false)

  const addSplit = () => setSplits((s) => [...s, { address: "", percent: 0 }])
  const removeSplit = (i: number) => setSplits((s) => s.filter((_, idx) => idx !== i))
  const updateSplit = (i: number, patch: Partial<Split>) =>
    setSplits((s) => s.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))

  // Validate Ethereum address
  const isValidAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr)
  }

  // Show verification popup when transaction is confirmed
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isMintConfirmed && transactionHash) {
      // Only show popup after the entire flow (splitter + mint + approve + list) has confirmed
      setShowVerification(true)
    }
  }, [isMintConfirmed, transactionHash])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first")
      return
    }

    if (totalPercent !== 100) {
      toast.error("Total percentage must equal 100%")
      return
    }

    if (!name || !desc) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate all addresses
    const invalidAddresses = splits.filter(split => !isValidAddress(split.address))
    if (invalidAddresses.length > 0) {
      toast.error("Please enter valid Ethereum addresses for all recipients")
      return
    }


    try {
      toast.loading("Uploading NFT metadata to IPFS...", { id: "mint" })
      
      // Upload image to IPFS if provided
      let imageUrl = ""
      if (image) {
        try {
          imageUrl = await pinataService.uploadFile(image)
          console.log("Image uploaded to IPFS:", imageUrl)
        } catch (err) {
          console.error("Error uploading image:", err)
          throw new Error("Failed to upload image to IPFS")
        }
      }
      
      // Create NFT metadata
      const metadata = {
        name: name,
        description: desc,
        image: imageUrl || "https://via.placeholder.com/400x400/00ff88/000000?text=No+Image",
        attributes: [
          {
            trait_type: "Royalty Rate",
            value: `${royaltyBps / 100}%`
          },
          {
            trait_type: "Split Recipients",
            value: splits.filter(s => isValidAddress(s.address)).length
          }
        ],
        external_url: "https://streamsinsomnia.com",
        animation_url: undefined
      }
      
      // Upload metadata to IPFS
      let tokenURI: string
      try {
        tokenURI = await pinataService.uploadMetadata(metadata)
        console.log("Metadata uploaded to IPFS:", tokenURI)
      } catch (err) {
        console.error("Error uploading metadata:", err)
        throw new Error("Failed to upload metadata to IPFS")
      }
      
      // Convert splits to the format expected by the contract
      const formattedSplits = splits
        .filter(split => isValidAddress(split.address))
        .map(split => ({
          account: split.address as `0x${string}`,
          bps: split.percent * 100 // Convert percentage to basis points
        }))
      
      console.log("Starting mint process with:", {
        to: address,
        tokenURI,
        formattedSplits,
        royaltyBps: BigInt(royaltyBps),
        listingPrice
      })
      
      toast.loading("Deploying custom royalty splitter...", { id: "mint" })
      
      // Use the new mint flow with custom splitter
      await mintWithCustomSplitter(
        address as `0x${string}`, 
        tokenURI, 
        formattedSplits, 
        BigInt(royaltyBps),
        listingPrice
      )
      
      toast.success("NFT minted successfully and listed for sale!", { id: "mint" })
      
      // Trigger refresh in other components
      window.dispatchEvent(new CustomEvent('nftMinted'))
      
      // Reset form
      setName("")
      setDesc("")
      setSplits([{ address: "", percent: 70 }, { address: "", percent: 30 }])
      setImage(null)
      setListingPrice("0.1")
      
    } catch (err) {
      console.error("Mint error:", err)
      
      // Provide more specific error messages based on the error
      let errorMessage = "Failed to mint NFT. Please try again."
      
      if (err instanceof Error) {
        if (err.message.includes("IPFS")) {
          errorMessage = "Failed to upload to IPFS. Please check your internet connection and try again."
        } else if (err.message.includes("splitter")) {
          errorMessage = "Failed to deploy royalty splitter. Please check your wallet and try again."
        } else if (err.message.includes("mint")) {
          errorMessage = "Failed to mint NFT. Please ensure you have enough funds and try again."
        } else if (err.message.includes("approve")) {
          errorMessage = "Failed to approve NFT for listing. Please try again."
        } else if (err.message.includes("list")) {
          errorMessage = "NFT minted but failed to list for sale. You can list it manually later."
        } else if (err.message.includes("User rejected")) {
          errorMessage = "Transaction was cancelled by user."
        } else if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to complete the transaction."
        } else {
          errorMessage = `Error: ${err.message}`
        }
      }
      
      toast.error(errorMessage, { id: "mint" })
    }
  }

  const totalPercent = splits.reduce((a, b) => a + (Number(b.percent) || 0), 0)

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
        </div>

        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-lime-500/20">
              <Sparkles className="h-6 w-6 text-lime-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#f5eada]">Mint New NFT</CardTitle>
          </div>
          <p className="text-[#f5eada]/70">Create your NFT with flexible royalty splits and start earning from streams</p>
      </CardHeader>

      <form onSubmit={handleSubmit}>
          <CardContent className="relative z-10 space-y-6">
            {/* NFT Basic Info */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
          <div className="grid gap-3">
                <Label htmlFor="nft-name" className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  NFT Name
                </Label>
            <Input
              id="nft-name"
              placeholder="e.g., Track #12"
              value={name}
              onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20"
              required
            />
          </div>
              
          <div className="grid gap-3">
                <Label htmlFor="nft-desc" className="text-sm font-medium text-[#f5eada]/90">Description</Label>
            <Textarea
              id="nft-desc"
                  placeholder="Describe your NFT and its unique value..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20"
              rows={4}
            />
          </div>
            </motion.div>

            {/* Image Upload */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="nft-image" className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Upload Image
              </Label>
              <div className="relative">
            <Input
              id="nft-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#f5eada]/40" />
              </div>
              {image && (
                <motion.div 
                  className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-sm text-green-400">Selected: {image.name}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Royalty Percentage */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Label className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Royalty Percentage
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={royaltyBps / 100}
                  onChange={(e) => setRoyaltyBps(Number(e.target.value) * 100)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                  placeholder="10"
                />
                <span className="text-sm text-[#f5eada]/60">%</span>
              </div>
              <p className="text-xs text-[#f5eada]/60">
                Royalty percentage for secondary sales (e.g., 10% = 1000 basis points)
              </p>
            </motion.div>

            {/* Listing Price */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26 }}
            >
              <Label htmlFor="listing-price" className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Initial Listing Price
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="listing-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                  placeholder="0.1"
                />
                <span className="text-sm text-[#f5eada]/60">STT</span>
              </div>
              <p className="text-xs text-[#f5eada]/60">
                NFT will be automatically listed for sale at this price
              </p>
            </motion.div>
            

            {/* Royalty Splits */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Custom Royalty Splits
                </Label>
              <Button
                type="button"
                variant="outline"
                  className="border-lime-500/30 text-[#f5eada] bg-lime-500/10 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-300"
                onClick={addSplit}
              >
                  <Plus className="h-4 w-4 mr-2" />
                Add recipient
              </Button>
            </div>
              
            <div className="space-y-3">
              {splits.map((s, i) => (
                  <motion.div 
                    key={i} 
                    className="space-y-2 p-4 rounded-lg bg-black/20 border border-lime-500/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="text-xs text-[#f5eada]/60 font-medium">Recipient {i + 1}</div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_100px]">
                    <div className="relative">
                  <Input
                        placeholder="0x..."
                        value={s.address ? shortenAddress(s.address, 4) : ""}
                        onChange={(e) => {
                          // If user is typing, allow them to type
                          // If they paste a full address, store it but show short form
                          const inputValue = e.target.value
                          if (inputValue.length > 10) {
                            // If it looks like a full address, store it but show short form
                            if (isValidAddress(inputValue)) {
                              updateSplit(i, { address: inputValue })
                            } else {
                              updateSplit(i, { address: inputValue })
                            }
                          } else {
                            updateSplit(i, { address: inputValue })
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault()
                          const pastedText = e.clipboardData.getData('text')
                          if (isValidAddress(pastedText)) {
                            updateSplit(i, { address: pastedText })
                          } else {
                            updateSplit(i, { address: pastedText })
                          }
                        }}
                        className={`bg-black/40 text-[#f5eada] placeholder:text-[#f5eada]/40 pr-20 ${
                          s.address && !isValidAddress(s.address)
                            ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
                            : 'border-lime-500/20 focus:border-lime-500/40 focus:ring-lime-500/20'
                        }`}
                    required
                  />
                      {s.address && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ">
                          {isValidAddress(s.address) ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-red-400">✗</span>
                          )}
                        </div>
                      )}
                    </div>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="1"
                    placeholder="%"
                    value={s.percent}
                    onChange={(e) => updateSplit(i, { percent: Number(e.target.value) })}
                      className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                    onClick={() => removeSplit(i)}
                  >
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                  </motion.div>
              ))}
            </div>
              
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-lime-500/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-sm text-[#f5eada]/70">Total Percentage</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${totalPercent === 100 ? 'text-green-400' : totalPercent > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {totalPercent}%
                  </span>
                  {totalPercent === 100 && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          </div>
              </motion.div>
            </motion.div>
        </CardContent>

          <CardFooter className="relative z-10 flex justify-end pt-6">
            <motion.div
              whileHover={{ scale: isMintPending || isMintConfirming ? 1 : 1.02 }}
              whileTap={{ scale: isMintPending || isMintConfirming ? 1 : 0.98 }}
            >
              <Button 
                type="submit"
                disabled={isMintPending || isMintConfirming || !isConnected || totalPercent !== 100 || splits.some(s => !isValidAddress(s.address))}
                className="bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600 shadow-lg hover:shadow-lime-500/25 transition-all duration-300 border-0 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMintPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Deploying Splitter...
                  </>
                ) : isMintConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Minting NFT...
                  </>
                ) : isMintConfirmed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    NFT Minted!
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Mint with Custom Splits
                  </>
                )}
              </Button>
            </motion.div>
        </CardFooter>
      </form>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </Card>

      {/* Transaction Verification Popup */}
      {transactionHash && (
        <TransactionVerification
          isOpen={showVerification}
          onClose={() => setShowVerification(false)}
          transactionHash={transactionHash}
          transactionType="mint"
          contractAddress={contractAddress}
        />
      )}
    </motion.div>
  )
}
