"use client"

import { AppShell } from "../../components/app-shell"
import { MyStreams } from "../../components/streams/my-streams"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function StreamsPage() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMintNew = () => {
    router.push('/mint')
  }

  // Listen for storage events to refresh when NFTs are minted
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshTrigger(prev => prev + 1)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom events
    window.addEventListener('nftMinted', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('nftMinted', handleStorageChange)
    }
  }, [])

  return (
    <AppShell>
      <MyStreams 
        onMintNew={handleMintNew}
        refreshTrigger={refreshTrigger}
      />
    </AppShell>
  )
}
