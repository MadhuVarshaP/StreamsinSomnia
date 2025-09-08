'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { 
  CONTRACT_ADDRESSES, 
  STREAMING_ROYALTY_NFT_ABI, 
  ROYALTY_SPLITTER_ABI, 
  ROYALTY_ROUTER_ABI
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
    functionName: 'nextId',
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
    to: `0x${string}`,
    tokenURI: string,
    splitter: `0x${string}`,
    royaltyBps: bigint
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
export function useRoyaltySplitter(splitterAddress?: string) {
  const { data: totalBps } = useReadContract({
    address: splitterAddress as `0x${string}` || CONTRACT_ADDRESSES.ROYALTY_SPLITTER,
    abi: ROYALTY_SPLITTER_ABI,
    functionName: 'TOTAL_BPS',
    query: { enabled: !!splitterAddress || !!CONTRACT_ADDRESSES.ROYALTY_SPLITTER }
  })

  const { data: shares } = useReadContract({
    address: splitterAddress as `0x${string}` || CONTRACT_ADDRESSES.ROYALTY_SPLITTER,
    abi: ROYALTY_SPLITTER_ABI,
    functionName: 'getShares',
    query: { enabled: !!splitterAddress || !!CONTRACT_ADDRESSES.ROYALTY_SPLITTER }
  })

  return {
    totalBps,
    shares,
  }
}

// Hook for creating a complete mint flow with splitter deployment
export function useMintWithSplitter() {
  const { mintNFT, isPending: isMinting, isConfirming: isMintConfirming, isConfirmed: isMintConfirmed, hash: mintHash } = useStreamingRoyaltyNFT()
  const { isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: mintHash,
  })

  const mintWithCustomSplitter = async (
    to: `0x${string}`,
    tokenURI: string,
    shares: Array<{ account: `0x${string}`; bps: number }>,
    royaltyBps: bigint
  ) => {
    try {
      // For now, we'll use the existing deployed splitter
      // In a full implementation, you would deploy a new splitter here
      const splitterAddress = CONTRACT_ADDRESSES.ROYALTY_SPLITTER as `0x${string}`
      
      // Mint the NFT with the splitter
      await mintNFT(to, tokenURI, splitterAddress, royaltyBps)
      
    } catch (err) {
      console.error('Mint with splitter error:', err)
      throw err
    }
  }

  return {
    mintWithCustomSplitter,
    hash: mintHash,
    isPending: isPending || isMinting,
    isConfirming: isConfirming || isMintConfirming,
    isConfirmed: isConfirmed || isMintConfirmed,
    error,
    contractAddress: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
  }
}

// Hook for getting royalty router information
export function useRoyaltyRouterInfo() {
  const { data: nftContract } = useReadContract({
    address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
    abi: ROYALTY_ROUTER_ABI,
    functionName: 'nft',
  })

  const { data: metaContract } = useReadContract({
    address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
    abi: ROYALTY_ROUTER_ABI,
    functionName: 'meta',
  })

  return {
    nftContract,
    metaContract,
  }
}

// Hook for Royalty Router (Marketplace) interactions
export function useRoyaltyRouter() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Sell NFT function
  const sellNFT = async (tokenId: bigint, seller: `0x${string}`, buyer: `0x${string}`, price: string) => {
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
    contractAddress: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
  }
}

// Hook for getting royalty information
export function useRoyaltyInfo(tokenId: bigint, salePrice: string) {
  const { data: royaltyInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
    abi: STREAMING_ROYALTY_NFT_ABI,
    functionName: 'royaltyInfo',
    args: [tokenId, parseEther(salePrice)],
  })

  return {
    receiver: royaltyInfo?.[0],
    royaltyAmount: royaltyInfo?.[1] ? formatEther(royaltyInfo[1]) : '0',
  }
}

// Hook for fetching NFTs by owner (simplified version)
export function useNFTsByOwner() {
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
    abi: STREAMING_ROYALTY_NFT_ABI,
    functionName: 'nextId',
  })

  // For now, return empty array - in a real implementation, you would use events or a different approach
  // to avoid the rules of hooks violation
  return {
    ownedNFTs: [] as Array<{ tokenId: bigint; owner: string; tokenURI: string; royaltyInfo?: [string, bigint] }>,
    totalSupply,
    isLoading: false,
  }
}

// Hook for fetching all NFTs (simplified version)
export function useAllNFTs() {
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
    abi: STREAMING_ROYALTY_NFT_ABI,
    functionName: 'nextId',
  })

  // For now, return empty array - in a real implementation, you would use events or a different approach
  // to avoid the rules of hooks violation
  return {
    allNFTs: [] as Array<{ tokenId: bigint; owner: string; tokenURI: string; royaltyInfo?: [string, bigint] }>,
    totalSupply,
    isLoading: false,
  }
}
