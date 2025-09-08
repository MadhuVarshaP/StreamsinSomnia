"use client"

import { AppShell } from "../../components/app-shell"
import { MyStreams } from "../../components/streams/my-streams"
import { useRouter } from "next/navigation"
import { NFTData } from "../../types/nft"

export default function StreamsPage() {
  const router = useRouter()

  const handleMintNew = () => {
    router.push('/mint')
  }

  const handleSellNFT = (nft: NFTData) => {
    // Navigate to marketplace or open sell modal
    console.log('Sell NFT:', nft)
  }

  const handleViewDetails = (nft: NFTData) => {
    // Navigate to NFT details page or open modal
    console.log('View NFT details:', nft)
  }

  return (
    <AppShell>
      <MyStreams 
        onMintNew={handleMintNew}
        onSellNFT={handleSellNFT}
        onViewDetails={handleViewDetails}
      />
    </AppShell>
  )
}
