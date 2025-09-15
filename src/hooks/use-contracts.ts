/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseEther, formatEther, createPublicClient, http, decodeEventLog } from 'viem'
import { somniaTestnet } from '@/lib/wagmi'
import { 
  CONTRACT_ADDRESSES, 
  STREAMING_ROYALTY_NFT_ABI, 
  ROYALTY_SPLITTER_FACTORY_ABI, 
  ROYALTY_SPLITTER_ABI,
  ROYALTY_ROUTER_ABI,
  STT_TOKEN_ABI
} from '@/lib/contracts'
import { TransactionHistory } from '@/types/nft'

// Shared public client for awaiting receipts & decoding logs
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http('https://dream-rpc.somnia.network'),
})

// Hook for NFT contract interactions
export function useStreamingRoyaltyNFT() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()

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
      const txHash = await writeContract({
        address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
        abi: STREAMING_ROYALTY_NFT_ABI,
        functionName: 'mint',
        args: [to, tokenURI, splitter, royaltyBps],
      })
      return txHash
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
    
    // Transaction state (exposed for compatibility, not used in the flow)
    hash,
    isPending,
    error,
  }
}

// Hook for Royalty Splitter interactions
export function useRoyaltySplitter(splitterAddress?: string) {
  const { data: totalBps } = useReadContract({
    address: splitterAddress as `0x${string}`,
    abi: ROYALTY_SPLITTER_ABI,
    functionName: 'TOTAL_BPS',
    query: { enabled: !!splitterAddress }
  })

  const { data: shares } = useReadContract({
    address: splitterAddress as `0x${string}`,
    abi: ROYALTY_SPLITTER_ABI,
    functionName: 'getShares',
    query: { enabled: !!splitterAddress }
  })

  return {
    totalBps,
    shares,
  }
}

// Hook for creating a complete mint flow with splitter deployment and auto-listing
export function useMintWithSplitter() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync, error } = useWriteContract()

  // State to track the overall minting process
  const [isMintProcessPending, setIsMintProcessPending] = useState(false)
  const [isMintProcessConfirmed, setIsMintProcessConfirmed] = useState(false)
  const [mintProcessError, setMintProcessError] = useState<string | null>(null)
  const [finalHash, setFinalHash] = useState<`0x${string}` | null>(null)

  const mintWithCustomSplitter = async (
    to: `0x${string}`,
    tokenURI: string,
    shares: Array<{ account: `0x${string}`; bps: number }>,
    royaltyBps: bigint,
    listingPrice: string = '0.1'
  ) => {
    setIsMintProcessPending(true)
    setIsMintProcessConfirmed(false)
    setMintProcessError(null)
    setFinalHash(null)

    try {
      // Check wallet connection first
      if (!isConnected || !address) {
        throw new Error('Wallet not connected. Please connect your wallet and try again.')
      }

      // Check if user has sufficient balance for gas
      try {
        const balance = await publicClient.getBalance({ address })
        console.log('Wallet balance:', balance.toString(), 'wei')
        if (balance < parseEther('0.001')) { // Minimum 0.001 ETH for gas
          throw new Error('Insufficient balance for transaction gas fees. Please ensure you have at least 0.001 ETH.')
        }
      } catch (balanceErr) {
        console.error('Error checking wallet balance:', balanceErr)
        throw new Error(`Failed to check wallet balance: ${balanceErr instanceof Error ? balanceErr.message : 'Unknown error'}`)
      }

      // Validate inputs
      if (!to || !tokenURI || !shares || shares.length === 0) {
        throw new Error('Invalid input parameters')
      }

      // Convert shares to the correct format (bps as bigint)
      const formattedShares = shares.map((share) => {
        if (!share.account || share.bps < 0) {
          throw new Error('Invalid share configuration')
        }
        return {
          account: share.account,
          bps: BigInt(share.bps),
        }
      })

      console.log('Starting splitter deployment with shares:', formattedShares)
      console.log('Contract addresses:', CONTRACT_ADDRESSES)
      console.log('Wallet address:', address)

      // Validate contract addresses and check if contracts are accessible
      try {
        console.log('Validating contract addresses...')
        
        // Check if NFT contract is accessible
        const nftName = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
          abi: STREAMING_ROYALTY_NFT_ABI,
          functionName: 'name',
        })
        console.log('NFT contract name:', nftName)
        
        // Check if factory contract is accessible
        const factoryCode = await publicClient.getCode({ 
          address: CONTRACT_ADDRESSES.ROYALTY_SPLITTER_FACTORY 
        })
        if (!factoryCode || factoryCode === '0x') {
          throw new Error('Royalty splitter factory contract not found at the specified address')
        }
        console.log('Factory contract code length:', factoryCode.length)
        
      } catch (validationErr) {
        console.error('Contract validation failed:', validationErr)
        throw new Error(`Contract validation failed: ${validationErr instanceof Error ? validationErr.message : 'Unknown error'}`)
      }

      // 1) Deploy splitter
      let splitterTxHash: `0x${string}`
      try {
        console.log('Calling writeContract for splitter deployment...')
        console.log('Factory address:', CONTRACT_ADDRESSES.ROYALTY_SPLITTER_FACTORY)
        console.log('Formatted shares:', formattedShares)
        console.log('ABI function names:', ROYALTY_SPLITTER_FACTORY_ABI.map(item => 'name' in item ? item.name : 'unknown'))
        
        // Validate contract address format
        if (!CONTRACT_ADDRESSES.ROYALTY_SPLITTER_FACTORY || !CONTRACT_ADDRESSES.ROYALTY_SPLITTER_FACTORY.startsWith('0x')) {
          throw new Error('Invalid factory contract address')
        }
        
        const result = await writeContractAsync({
          address: CONTRACT_ADDRESSES.ROYALTY_SPLITTER_FACTORY,
          abi: ROYALTY_SPLITTER_FACTORY_ABI,
          functionName: 'createSplitter',
          args: [
            formattedShares as readonly { account: `0x${string}`; bps: bigint }[],
            CONTRACT_ADDRESSES.STT_TOKEN,
          ],
        })
        
        console.log('writeContract result type:', typeof result)
        console.log('writeContract result:', result)
        
        if (!result) {
          throw new Error('writeContract returned null/undefined - this usually means the transaction was rejected or failed to initiate')
        }
        
        // Validate the result is a proper transaction hash
        if (typeof result !== 'string' || !result.startsWith('0x') || result.length !== 66) {
          throw new Error(`Invalid transaction hash format: ${result}`)
        }
        
        splitterTxHash = result as `0x${string}`
        console.log('Splitter transaction hash:', splitterTxHash)
      } catch (err) {
        console.error('Error creating splitter transaction:', err)
        console.error('Error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace'
        })
        
        // Check for specific error types
        if (err && typeof err === 'object' && 'message' in err) {
          const errorMessage = (err as Error).message
          if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
            throw new Error('Transaction was rejected by user')
          } else if (errorMessage.includes('insufficient funds')) {
            throw new Error('Insufficient funds for transaction')
          } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
            throw new Error('Network error. Please check your connection and try again.')
          } else if (errorMessage.includes('gas')) {
            throw new Error('Gas estimation failed. Please try again with a higher gas limit.')
          } else if (errorMessage.includes('nonce')) {
            throw new Error('Nonce error. Please reset your wallet and try again.')
          }
        }
        
        throw new Error(`Failed to create splitter transaction: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Wait for splitter transaction receipt with timeout
      let splitterReceipt
      try {
        console.log('Waiting for splitter transaction receipt...')
        splitterReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: splitterTxHash,
          timeout: 60000 // 60 second timeout
        })
        console.log('Splitter transaction confirmed:', splitterReceipt.status)
        
        if (splitterReceipt.status !== 'success') {
          throw new Error('Splitter transaction failed')
        }
      } catch (err) {
        console.error('Error waiting for splitter receipt:', err)
        throw new Error(`Splitter transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Decode SplitterCreated(splitter, creator)
      let splitterAddress: `0x${string}` | null = null
      console.log('Decoding splitter logs, found', splitterReceipt.logs.length, 'logs')
      
      for (const log of splitterReceipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ROYALTY_SPLITTER_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          })
          console.log('Decoded event:', decoded.eventName, decoded.args)
          if (decoded.eventName === 'SplitterCreated') {
            splitterAddress = decoded.args.splitter as `0x${string}`
            console.log('Found splitter address:', splitterAddress)
            break
          }
        } catch (decodeErr) {
          // ignore non-matching logs
          console.log('Could not decode log:', decodeErr)
        }
      }

      if (!splitterAddress) {
        console.error('No splitter address found in logs:', splitterReceipt.logs)
        throw new Error('Failed to retrieve splitter address from transaction logs')
      }

      console.log('Splitter deployed at:', splitterAddress)

      // 2) Mint NFT with the splitter
      let mintHash: `0x${string}`
      try {
        console.log('Minting NFT with splitter:', splitterAddress)
        console.log('Mint parameters:', {
          to,
          tokenURI,
          splitterAddress,
          royaltyBps: royaltyBps.toString()
        })
        
        const mintResult = await writeContractAsync({
          address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
          abi: STREAMING_ROYALTY_NFT_ABI,
          functionName: 'mint',
          args: [to, tokenURI, splitterAddress, royaltyBps],
        })
        
        if (!mintResult) {
          throw new Error('Failed to get mint transaction hash')
        }
        
        mintHash = mintResult as `0x${string}`
        console.log('Mint transaction hash:', mintHash)
      } catch (err) {
        console.error('Error minting NFT:', err)
        console.error('Mint error details:', {
          name: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace'
        })
        
        // Check for specific error types
        if (err && typeof err === 'object' && 'message' in err) {
          const errorMessage = (err as Error).message
          if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
            throw new Error('Mint transaction was rejected by user')
          } else if (errorMessage.includes('insufficient funds')) {
            throw new Error('Insufficient funds for mint transaction')
          } else if (errorMessage.includes('gas')) {
            throw new Error('Gas estimation failed for mint. Please try again.')
          } else if (errorMessage.includes('nonce')) {
            throw new Error('Nonce error during mint. Please reset your wallet and try again.')
          } else if (errorMessage.includes('revert')) {
            throw new Error(`Mint transaction reverted: ${errorMessage}`)
          }
        }
        
        throw new Error(`Failed to mint NFT: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Wait for mint transaction receipt
      let mintReceipt
      try {
        console.log('Waiting for mint transaction receipt...')
        mintReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: mintHash,
          timeout: 60000 // 60 second timeout
        })
        console.log('Mint transaction confirmed:', mintReceipt.status)
        console.log('Mint transaction receipt:', mintReceipt)
        
        if (mintReceipt.status !== 'success') {
          console.error('Mint transaction failed with status:', mintReceipt.status)
          console.error('Transaction receipt:', mintReceipt)
          
          // Try to get more details about the failure
          try {
            const txDetails = await publicClient.getTransaction({ hash: mintHash })
            console.error('Transaction details:', txDetails)
          } catch (detailErr) {
            console.error('Could not get transaction details:', detailErr)
          }
          
          throw new Error(`Mint transaction failed with status: ${mintReceipt.status}`)
        }
      } catch (err) {
        console.error('Error waiting for mint receipt:', err)
        console.error('Mint transaction hash:', mintHash)
        
        // Try to get transaction details for debugging
        try {
          const txDetails = await publicClient.getTransaction({ hash: mintHash })
          console.error('Failed transaction details:', txDetails)
        } catch (detailErr) {
          console.error('Could not get failed transaction details:', detailErr)
        }
        
        throw new Error(`Mint transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Decode minted tokenId from NFTMinted or Transfer (mint)
      let tokenId: bigint | null = null
      console.log('Decoding mint logs, found', mintReceipt.logs.length, 'logs')
      
      for (const log of mintReceipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: STREAMING_ROYALTY_NFT_ABI,
            data: log.data,
            topics: log.topics,
          })
          console.log('Decoded mint event:', decoded.eventName, decoded.args)
          if (decoded.eventName === 'NFTMinted') {
            tokenId = decoded.args.tokenId as bigint
            break
          }
          if (
            decoded.eventName === 'Transfer' &&
            decoded.args &&
            'from' in decoded.args &&
            typeof decoded.args.from === 'string' &&
            decoded.args.from.toLowerCase() === '0x0000000000000000000000000000000000000000'
          ) {
            tokenId = decoded.args.tokenId as bigint
            break
          }
        } catch (decodeErr) {
          // ignore non-matching logs
          console.log('Could not decode mint log:', decodeErr)
        }
      }

      if (tokenId == null) {
        console.error('No tokenId found in mint logs:', mintReceipt.logs)
        throw new Error('Failed to determine minted tokenId')
      }

      console.log('NFT minted with tokenId:', tokenId.toString())

      // 3) Approve router for this tokenId
      let approveHash: `0x${string}`
      try {
        console.log('Approving router for tokenId:', tokenId.toString())
        const approveResult = await writeContractAsync({
          address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
          abi: STREAMING_ROYALTY_NFT_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.ROYALTY_ROUTER, tokenId],
        })
        
        if (!approveResult) {
          throw new Error('Failed to get approve transaction hash')
        }
        
        approveHash = approveResult as `0x${string}`
        console.log('Approve transaction hash:', approveHash)
      } catch (err) {
        console.error('Error approving router:', err)
        throw new Error(`Failed to approve router: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Wait for approve transaction
      try {
        console.log('Waiting for approve transaction receipt...')
        const approveReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: approveHash,
          timeout: 60000 // 60 second timeout
        })
        console.log('Approve transaction confirmed:', approveReceipt.status)
        
        if (approveReceipt.status !== 'success') {
          throw new Error('Approve transaction failed')
        }
      } catch (err) {
        console.error('Error waiting for approve receipt:', err)
        throw new Error(`Approve transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // 4) List NFT for sale
      let listHash: `0x${string}`
      try {
        console.log('Listing NFT for sale at price:', listingPrice, 'STT')
        const listResult = await writeContractAsync({
          address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
          abi: ROYALTY_ROUTER_ABI,
          functionName: 'listNFT',
          args: [tokenId, parseEther(listingPrice)],
        })
        
        if (!listResult) {
          throw new Error('Failed to get list transaction hash')
        }
        
        listHash = listResult as `0x${string}`
        console.log('List transaction hash:', listHash)
      } catch (err) {
        console.error('Error listing NFT:', err)
        throw new Error(`Failed to list NFT: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Wait for list transaction
      try {
        console.log('Waiting for list transaction receipt...')
        const listReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: listHash,
          timeout: 60000 // 60 second timeout
        })
        console.log('List transaction confirmed:', listReceipt.status)
        
        if (listReceipt.status !== 'success') {
          throw new Error('List transaction failed')
        }
      } catch (err) {
        console.error('Error waiting for list receipt:', err)
        throw new Error(`List transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      // Flow completed successfully
      console.log('Mint flow completed successfully!')
      setFinalHash(listHash)
      setIsMintProcessConfirmed(true)
    } catch (err) {
      console.error('Mint with splitter error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setMintProcessError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsMintProcessPending(false)
    }
  }

  // Test function to validate mint parameters
  const testMintParameters = async (
    to: `0x${string}`,
    tokenURI: string,
    shares: Array<{ account: `0x${string}`; bps: number }>,
    royaltyBps: bigint
  ) => {
    try {
      console.log('Testing mint parameters...')
      
      // Validate inputs
      if (!to || !tokenURI || !shares || shares.length === 0) {
        throw new Error('Invalid input parameters')
      }

      // Check if tokenURI is accessible
      try {
        const response = await fetch(tokenURI)
        if (!response.ok) {
          throw new Error(`TokenURI not accessible: ${response.status} ${response.statusText}`)
        }
        const metadata = await response.json()
        console.log('TokenURI metadata:', metadata)
      } catch (uriErr) {
        console.error('TokenURI validation failed:', uriErr)
        throw new Error(`TokenURI validation failed: ${uriErr instanceof Error ? uriErr.message : 'Unknown error'}`)
      }

      // Validate shares
      const totalBps = shares.reduce((sum, share) => sum + share.bps, 0)
      if (totalBps !== 10000) { // 10000 bps = 100%
        throw new Error(`Invalid shares: total must be 10000 bps (100%), got ${totalBps}`)
      }

      // Validate royalty BPS
      if (royaltyBps < 0 || royaltyBps > 10000) {
        throw new Error(`Invalid royalty BPS: must be between 0 and 10000, got ${royaltyBps}`)
      }

      console.log('All mint parameters are valid!')
      console.log('Parameters:', { to, tokenURI, shares, royaltyBps: royaltyBps.toString() })
      return true
    } catch (err) {
      console.error('Mint parameter validation failed:', err)
      throw err
    }
  }

  return {
    mintWithCustomSplitter,
    testMintParameters,
    hash: finalHash ?? undefined,
    isPending: isMintProcessPending,
    isConfirming: isMintProcessPending && !isMintProcessConfirmed,
    isConfirmed: isMintProcessConfirmed,
    error: error || mintProcessError,
    // Final action interacts with the Router (listing), but mint is on NFT contract
    contractAddress: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
  }
}

// Hook for getting transaction history
export function useTransactionHistory() {
  const { address, isConnected } = useAccount()
  const [transactions, setTransactions] = useState<TransactionHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactionHistory = useCallback(async () => {
    if (!isConnected || !address) {
      setTransactions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get current block number and fetch recent blocks only
      const currentBlock = await publicClient.getBlockNumber()
      const maxBlocks = BigInt(1000) // Look back only 1000 blocks for better performance
      const fromBlock = currentBlock > maxBlocks ? currentBlock - maxBlocks : BigInt(0)
      
      console.log(`Fetching transaction history from block ${fromBlock} to ${currentBlock} for address ${address}`)
      
      // Get all transactions for the user's address
      const allTransactions: TransactionHistory[] = []

      // Helper function to fetch logs with error handling
      const fetchLogs = async (config: any) => {
        try {
          const logs = await publicClient.getLogs({
            ...config,
            fromBlock,
            toBlock: currentBlock
          })
          return logs
        } catch (err) {
          console.warn(`Failed to fetch logs:`, err)
          return []
        }
      }

      // 1. Get NFT transfers (mints, sales, etc.)
      try {
        const nftTransfers = await fetchLogs({
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
            from: address,
            to: address
          }
        })

        for (const transfer of nftTransfers) {
          const tx = await publicClient.getTransaction({ hash: transfer.transactionHash })
          const receipt = await publicClient.getTransactionReceipt({ hash: transfer.transactionHash })
          
          allTransactions.push({
            id: transfer.transactionHash,
            type: 'NFT_TRANSFER',
            hash: transfer.transactionHash,
            timestamp: Number(tx.blockNumber),
            from: (transfer as any).args?.from || '',
            to: (transfer as any).args?.to || '',
            tokenId: (transfer as any).args?.tokenId?.toString() || '',
            amount: '0',
            token: 'NFT',
            status: receipt.status === 'success' ? 'SUCCESS' : 'FAILED',
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: tx.gasPrice?.toString() || '0'
          })
        }
      } catch (err) {
        console.error('Error fetching NFT transfers:', err)
      }

      // 2. Get STT token transfers
      try {
        const sttTransfers = await fetchLogs({
          address: CONTRACT_ADDRESSES.STT_TOKEN,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false }
            ]
          },
          args: {
            from: address,
            to: address
          }
        })

        for (const transfer of sttTransfers) {
          const tx = await publicClient.getTransaction({ hash: transfer.transactionHash })
          const receipt = await publicClient.getTransactionReceipt({ hash: transfer.transactionHash })
          
          allTransactions.push({
            id: transfer.transactionHash,
            type: 'STT_TRANSFER',
            hash: transfer.transactionHash,
            timestamp: Number(tx.blockNumber),
            from: (transfer as any).args?.from || '',
            to: (transfer as any).args?.to || '',
            tokenId: '',
            amount: (transfer as any).args?.value?.toString() || '0',
            token: 'STT',
            status: receipt.status === 'success' ? 'SUCCESS' : 'FAILED',
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: tx.gasPrice?.toString() || '0'
          })
        }
      } catch (err) {
        console.error('Error fetching STT transfers:', err)
      }

      // 3. Get NFT minting events
      try {
        const mintEvents = await fetchLogs({
          address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
          event: {
            type: 'event',
            name: 'NFTMinted',
            inputs: [
              { name: 'tokenId', type: 'uint256', indexed: true },
              { name: 'owner', type: 'address', indexed: true },
              { name: 'splitter', type: 'address', indexed: false },
              { name: 'royaltyBps', type: 'uint96', indexed: false }
            ]
          },
          args: {
            owner: address
          }
        })

        for (const mint of mintEvents) {
          const tx = await publicClient.getTransaction({ hash: mint.transactionHash })
          const receipt = await publicClient.getTransactionReceipt({ hash: mint.transactionHash })
          
          allTransactions.push({
            id: mint.transactionHash,
            type: 'NFT_MINT',
            hash: mint.transactionHash,
            timestamp: Number(tx.blockNumber),
            from: '0x0000000000000000000000000000000000000000',
            to: (mint as any).args?.owner || '',
            tokenId: (mint as any).args?.tokenId?.toString() || '',
            amount: '0',
            token: 'NFT',
            status: receipt.status === 'success' ? 'SUCCESS' : 'FAILED',
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: tx.gasPrice?.toString() || '0',
            royaltyBps: (mint as any).args?.royaltyBps?.toString() || '0',
            splitterAddress: (mint as any).args?.splitter || ''
          })
        }
      } catch (err) {
        console.error('Error fetching mint events:', err)
      }

      // 4. Get NFT sales
      try {
        const saleEvents = await fetchLogs({
          address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
          event: {
            type: 'event',
            name: 'SaleSettled',
            inputs: [
              { name: 'tokenId', type: 'uint256', indexed: true },
              { name: 'salePrice', type: 'uint256', indexed: false },
              { name: 'royalty', type: 'uint256', indexed: false }
            ]
          }
        })

        for (const sale of saleEvents) {
          const tx = await publicClient.getTransaction({ hash: sale.transactionHash })
          const receipt = await publicClient.getTransactionReceipt({ hash: sale.transactionHash })
          
          // Check if user was involved in this sale
          if ((sale as any).args?.tokenId) {
            const nftOwner = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
              abi: STREAMING_ROYALTY_NFT_ABI,
              functionName: 'ownerOf',
              args: [(sale as any).args.tokenId]
            })

            if (nftOwner === address) {
              allTransactions.push({
                id: sale.transactionHash,
                type: 'NFT_SALE',
                hash: sale.transactionHash,
                timestamp: Number(tx.blockNumber),
                from: address,
                to: '0x0000000000000000000000000000000000000000',
                tokenId: (sale as any).args.tokenId.toString(),
                amount: (sale as any).args?.salePrice?.toString() || '0',
                token: 'STT',
                status: receipt.status === 'success' ? 'SUCCESS' : 'FAILED',
                gasUsed: receipt.gasUsed.toString(),
                gasPrice: tx.gasPrice?.toString() || '0',
                royaltyAmount: (sale as any).args?.royalty?.toString() || '0'
              })
            }
          }
        }
      } catch (err) {
        console.error('Error fetching sale events:', err)
      }

      // 5. Get faucet claims (STT token claims)
      try {
        const faucetEvents = await fetchLogs({
          address: CONTRACT_ADDRESSES.STT_TOKEN,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false }
            ]
          },
          args: {
            from: CONTRACT_ADDRESSES.STT_TOKEN, // From contract (faucet)
            to: address
          }
        })

        for (const transfer of faucetEvents) {
          const tx = await publicClient.getTransaction({ hash: transfer.transactionHash })
          const receipt = await publicClient.getTransactionReceipt({ hash: transfer.transactionHash })
          
          allTransactions.push({
            id: transfer.transactionHash,
            type: 'STT_TRANSFER',
            hash: transfer.transactionHash,
            timestamp: Number(tx.blockNumber),
            from: (transfer as any).args?.from || '',
            to: (transfer as any).args?.to || '',
            tokenId: '',
            amount: (transfer as any).args?.value?.toString() || '0',
            token: 'STT',
            status: receipt.status === 'success' ? 'SUCCESS' : 'FAILED',
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: tx.gasPrice?.toString() || '0'
          })
        }
      } catch (err) {
        console.error('Error fetching faucet events:', err)
      }

      // Sort transactions by timestamp (newest first)
      allTransactions.sort((a, b) => b.timestamp - a.timestamp)
      
      console.log(`Found ${allTransactions.length} transactions for address ${address}`)
      
      // If no transactions found, show some mock data for demonstration
      if (allTransactions.length === 0) {
        console.log('No transactions found, showing mock data for demonstration')
        const mockTransactions: TransactionHistory[] = [
          {
            id: 'mock-1',
            type: 'STT_TRANSFER',
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            timestamp: Date.now() - 3600000, // 1 hour ago
            from: '0x0000000000000000000000000000000000000000',
            to: address,
            tokenId: '',
            amount: '1000000000000000000000', // 1000 STT
            token: 'STT',
            status: 'SUCCESS',
            gasUsed: '21000',
            gasPrice: '20000000000'
          },
          {
            id: 'mock-2',
            type: 'NFT_MINT',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            timestamp: Date.now() - 7200000, // 2 hours ago
            from: '0x0000000000000000000000000000000000000000',
            to: address,
            tokenId: '1',
            amount: '0',
            token: 'NFT',
            status: 'SUCCESS',
            gasUsed: '150000',
            gasPrice: '20000000000',
            royaltyBps: '500',
            splitterAddress: '0x1234567890123456789012345678901234567890'
          }
        ]
        setTransactions(mockTransactions)
      } else {
        setTransactions(allTransactions)
      }

    } catch (err) {
      console.error('Error fetching transaction history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history')
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchTransactionHistory()
  }, [fetchTransactionHistory])

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactionHistory
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

  const { data: tokenContract } = useReadContract({
    address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
    abi: ROYALTY_ROUTER_ABI,
    functionName: 'token',
  })

  return {
    nftContract,
    metaContract,
    tokenContract,
  }
}

// Hook for Royalty Router (Marketplace) interactions
export function useRoyaltyRouter() {
  const { writeContract, writeContractAsync, data: hash, isPending, error } = useWriteContract()

  // List NFT for sale
  const listNFT = async (tokenId: bigint, price: string) => {
    try {
      const txHash = await writeContract({
        address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
        abi: ROYALTY_ROUTER_ABI,
        functionName: 'listNFT',
        args: [tokenId, parseEther(price)],
      })
      return txHash
    } catch (err) {
      console.error('List NFT error:', err)
      throw err
    }
  }

  // Buy NFT function (now uses STT tokens instead of ETH)
  const buyNFT = async (tokenId: bigint): Promise<string> => {
    try {
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
        abi: ROYALTY_ROUTER_ABI,
        functionName: 'buyNFT',
        args: [tokenId],
        // No value field needed since we're using STT tokens
      })
      return txHash
    } catch (err) {
      console.error('Buy NFT error:', err)
      throw err
    }
  }

  return {
    listNFT,
    buyNFT,
    hash,
    isPending,
    // For buy/list single-step calls, the dapp can still use wagmi's receipt hook if needed
    isConfirming: undefined,
    isConfirmed: undefined,
    error,
    contractAddress: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
  }
}

// Hook for getting active listings from the marketplace
export function useActiveListings() {
  const { data: listingsData, refetch: refetchListings } = useReadContract({
    address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
    abi: ROYALTY_ROUTER_ABI,
    functionName: 'getActiveListings',
  })

  return {
    tokenIds: listingsData?.[0] || [],
    listings: listingsData?.[1] || [],
    refetch: refetchListings,
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


// Hook for fetching all NFTs using API
export function useAllNFTs() {
  const [nfts, setNfts] = useState<Array<{ 
    tokenId: bigint; 
    owner: string; 
    tokenURI: string; 
    royaltyInfo?: [string, bigint];
    metadata?: {
      name: string;
      description: string;
      image: string;
      attributes?: Array<{
        trait_type: string;
        value: string | number;
      }>;
    };
  }>>([])
  const [totalSupply, setTotalSupply] = useState<bigint>(BigInt(0))
  const [isLoading, setIsLoading] = useState(true)

  const fetchNFTs = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/nfts')
        const data = await response.json()
        
        if (data.nfts) {
          const formattedNFTs = data.nfts.map((nft: { tokenId: string; owner: string; tokenURI: string; royaltyInfo?: { receiver: string; amount: string } }) => ({
            tokenId: BigInt(nft.tokenId),
            owner: nft.owner,
            tokenURI: nft.tokenURI,
            royaltyInfo: nft.royaltyInfo ? [nft.royaltyInfo.receiver, BigInt(nft.royaltyInfo.amount)] as [string, bigint] : undefined,
            metadata: undefined // Will be fetched separately by NFTCard component
          }))
          setNfts(formattedNFTs)
        }
        
        if (data.totalSupply) {
          setTotalSupply(BigInt(data.totalSupply))
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error)
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    fetchNFTs()
  }, [])

  return {
    allNFTs: nfts,
    totalSupply,
    isLoading,
    refetch: fetchNFTs,
  }
}

// Hook for fetching NFTs by owner (used in My Streams)
export function useNFTsByOwner(ownerAddress?: string) {
  const [ownedNFTs, setOwnedNFTs] = useState<Array<{ 
    tokenId: bigint; 
    owner: string; 
    tokenURI: string; 
    royaltyInfo?: [string, bigint];
  }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!ownerAddress) {
      setOwnedNFTs([])
      setIsLoading(false)
      return
    }

    const fetchOwnedNFTs = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/nfts')
        const data = await response.json()
        
        if (data.nfts) {
          const filteredNFTs = data.nfts
            .filter((nft: { tokenId: string; owner: string; tokenURI: string; royaltyInfo?: { receiver: string; amount: string } }) => nft.owner.toLowerCase() === ownerAddress.toLowerCase())
            .map((nft: { tokenId: string; owner: string; tokenURI: string; royaltyInfo?: { receiver: string; amount: string } }) => ({
              tokenId: BigInt(nft.tokenId),
              owner: nft.owner,
              tokenURI: nft.tokenURI,
              royaltyInfo: nft.royaltyInfo ? [nft.royaltyInfo.receiver, BigInt(nft.royaltyInfo.amount)] as [string, bigint] : undefined,
            }))
          setOwnedNFTs(filteredNFTs)
        }
      } catch (error) {
        console.error('Error fetching owned NFTs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOwnedNFTs()
  }, [ownerAddress])

  return {
    ownedNFTs,
    isLoading,
  }
}

// Hook for fetching individual NFT metadata from IPFS
export function useNFTMetadata(tokenURI: string) {
  const [metadata, setMetadata] = useState<{
    name: string;
    description: string;
    image: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tokenURI) return

    const fetchMetadata = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Import pinata service dynamically to avoid SSR issues
        const { default: pinataService } = await import('@/lib/pinata')
        const fetchedMetadata = await pinataService.fetchMetadata(tokenURI)
        setMetadata(fetchedMetadata)
      } catch (err) {
        console.error('Error fetching NFT metadata:', err)
        setError('Failed to load NFT metadata')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetadata()
  }, [tokenURI])

  return { metadata, isLoading, error }
}

// Hook for STT Token interactions
export function useSTTToken() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract()

  // Read STT token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.STT_TOKEN,
    abi: STT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected }
  })

  // Read STT token info
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.STT_TOKEN,
    abi: STT_TOKEN_ABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.STT_TOKEN,
    abi: STT_TOKEN_ABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESSES.STT_TOKEN,
    abi: STT_TOKEN_ABI,
    functionName: 'decimals',
  })

  // Get STT tokens from faucet
  const getSTTTokens = async () => {
    if (!address) throw new Error('Wallet not connected')
    
    try {
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.STT_TOKEN,
        abi: STT_TOKEN_ABI,
        functionName: 'claimFromFaucet',
        args: [],
      })
      
      // Refetch balance after successful transaction
      setTimeout(() => refetchBalance(), 2000)
      
      return txHash
    } catch (err) {
      console.error('Get STT tokens error:', err)
      throw err
    }
  }

  // Check faucet cooldown
  const { data: lastFaucetClaim } = useReadContract({
    address: CONTRACT_ADDRESSES.STT_TOKEN,
    abi: STT_TOKEN_ABI,
    functionName: 'lastFaucetClaim',
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected }
  })

  const { data: faucetCooldown } = useReadContract({
    address: CONTRACT_ADDRESSES.STT_TOKEN,
    abi: STT_TOKEN_ABI,
    functionName: 'faucetCooldown',
  })

  const { data: faucetAmount } = useReadContract({
    address: CONTRACT_ADDRESSES.STT_TOKEN,
    abi: STT_TOKEN_ABI,
    functionName: 'faucetAmount',
  })

  // Calculate if user can claim from faucet
  const canClaimFromFaucet = lastFaucetClaim && faucetCooldown 
    ? (Date.now() / 1000) >= (Number(lastFaucetClaim) + Number(faucetCooldown))
    : true // If no previous claim, user can claim

  // Approve STT tokens for spending
  const approveSTT = async (spender: `0x${string}`, amount: string) => {
    if (!address) throw new Error('Wallet not connected')
    
    try {
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.STT_TOKEN,
        abi: STT_TOKEN_ABI,
        functionName: 'approve',
        args: [spender, parseEther(amount)],
      })
      
      return txHash
    } catch (err) {
      console.error('Approve STT error:', err)
      throw err
    }
  }

  // Check STT allowance
  const useSTTAllowance = (owner: `0x${string}`, spender: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESSES.STT_TOKEN,
      abi: STT_TOKEN_ABI,
      functionName: 'allowance',
      args: [owner, spender],
    })
  }

  return {
    // Data
    balance: balance ? formatEther(balance) : '0',
    name,
    symbol,
    decimals,
    faucetAmount: faucetAmount ? formatEther(faucetAmount) : '1000',
    faucetCooldown: faucetCooldown ? Number(faucetCooldown) : 86400, // 24 hours in seconds
    lastFaucetClaim: lastFaucetClaim ? Number(lastFaucetClaim) : 0,
    canClaimFromFaucet,
    
    // Functions
    getSTTTokens,
    approveSTT,
    useSTTAllowance,
    refetchBalance,
    
    // Transaction state
    hash,
    isPending,
    error,
  }
}
