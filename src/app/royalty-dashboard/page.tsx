"use client"

import { useEffect } from "react"
import { AppShell } from "../../components/app-shell"
import { RecipientDashboardContent } from "@/components/royalty/recipient-dashboard-content"
import { useRecipientDashboard, useNFTEarnings } from "@/hooks/use-contracts"

export default function RoyaltyDashboardPage() {
  const { dashboard, isLoading, refetch } = useRecipientDashboard()
  const { nftEarnings, isLoading: isNFTEarningsLoading, refetch: refetchNFTEarnings } = useNFTEarnings()

  // Listen for NFT purchase events to refresh data
  useEffect(() => {
    const handleNFTPurchase = () => {
      console.log('NFT purchased, refreshing royalty data...')
      // Add delay to allow blockchain transaction to settle
      setTimeout(() => {
        refetch()
        refetchNFTEarnings()
      }, 3000)
    }

    window.addEventListener('nftPurchased', handleNFTPurchase)
    
    return () => {
      window.removeEventListener('nftPurchased', handleNFTPurchase)
    }
  }, [refetch, refetchNFTEarnings])

  return (
    <AppShell>
      <RecipientDashboardContent 
        dashboard={dashboard}
        nftEarnings={nftEarnings}
        isLoading={isLoading}
        isNFTEarningsLoading={isNFTEarningsLoading}
      />
    </AppShell>
  )
}
