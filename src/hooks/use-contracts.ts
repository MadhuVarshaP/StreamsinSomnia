'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { 
  CONTRACT_ADDRESSES, 
  STREAMING_ROYALTY_NFT_ABI, 
  ROYALTY_SPLITTER_ABI, 
  ROYALTY_ROUTER_ABI,
  ERC2981_ABI 
} from '@/lib/contracts'

// Hook for NFT contract interactions
export function useStreamingRoyaltyNFT() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read contract data
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
    abi: STREAMING_ROYALTY_NFT_ABI,
    functionName: 'totalSupply',
  })

  const { data: nextId } = useReadContract({
    address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
    abi: STREAMING_ROYALTY_NFT_ABI,
    functionName: 'nextId',
  })

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
    abi: STREAMING_ROYALTY_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Mint NFT function
  const mintNFT = async (
    to: string,
    tokenURI: string,
    splitter: string,
    royaltyBps: number
  ) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
        abi: STREAMING_ROYALTY_NFT_ABI,
        functionName: 'mint',
        args: [to, tokenURI, splitter, royaltyBps],
      })
    } catch (err) {
      console.error('Mint error:', err)
      throw err
    }
  }

  // Get token URI
  const useTokenURI = (tokenId: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
      abi: STREAMING_ROYALTY_NFT_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
    })
  }

  // Get owner of token
  const useTokenOwner = (tokenId: bigint) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
      abi: STREAMING_ROYALTY_NFT_ABI,
      functionName: 'ownerOf',
      args: [tokenId],
    })
  }

  return {
    // Data
    totalSupply,
    nextId,
    balance,
    
    // Functions
    mintNFT,
    useTokenURI,
    useTokenOwner,
    
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Hook for Royalty Splitter interactions
export function useRoyaltySplitter() {
  const { data: totalBps } = useReadContract({
    address: CONTRACT_ADDRESSES.ROYALTY_SPLITTER,
    abi: ROYALTY_SPLITTER_ABI,
    functionName: 'TOTAL_BPS',
  })

  const { data: shares } = useReadContract({
    address: CONTRACT_ADDRESSES.ROYALTY_SPLITTER,
    abi: ROYALTY_SPLITTER_ABI,
    functionName: 'getShares',
  })

  return {
    totalBps,
    shares,
  }
}

// Hook for Royalty Router (Marketplace) interactions
export function useRoyaltyRouter() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Sell NFT function
  const sellNFT = async (tokenId: bigint, seller: string, buyer: string, price: string) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
        abi: ROYALTY_ROUTER_ABI,
        functionName: 'sell',
        args: [tokenId, seller, buyer],
        value: parseEther(price),
      })
    } catch (err) {
      console.error('Sell error:', err)
      throw err
    }
  }

  return {
    sellNFT,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

// Hook for getting royalty information
export function useRoyaltyInfo(tokenId: bigint, salePrice: string) {
  const { data: royaltyInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
    abi: ERC2981_ABI,
    functionName: 'royaltyInfo',
    args: [tokenId, parseEther(salePrice)],
  })

  return {
    receiver: royaltyInfo?.[0],
    royaltyAmount: royaltyInfo?.[1] ? formatEther(royaltyInfo[1]) : '0',
  }
}
