import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatEther } from "viem"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to shorten wallet addresses
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Utility function to format transaction amounts
// _decimals parameter kept for API compatibility but not used (viem's formatEther handles 18 decimals)
export function formatTransactionAmount(amount: string | bigint, _decimals = 18): string {
  try {
    // Handle empty or zero amounts
    if (!amount || amount === '0' || amount === BigInt(0)) {
      return '0.00'
    }

    // Convert to BigInt if it's a string
    const bigIntAmount = typeof amount === 'string' ? BigInt(amount) : amount
    
    // Use viem's formatEther for proper formatting (handles large numbers correctly)
    const formatted = formatEther(bigIntAmount)
    
    // Debug log to show the conversion
    console.log(`Amount formatting: ${amount} -> ${formatted}`)
    
    // Parse as float and format to 4 decimal places, but handle very large numbers
    const num = parseFloat(formatted)
    
    // If the number is very large, use toLocaleString for better formatting
    if (num >= 1000000) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    }
    
    return num.toFixed(2)
  } catch (error) {
    console.error('Error formatting transaction amount:', error)
    return '0.00'
  }
}

// Utility function to format date
export function formatTransactionDate(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


// Convert IPFS URL to HTTP URL for Next.js Image component
export function convertIPFSUrl(ipfsUrl: string): string {
  if (!ipfsUrl) return ipfsUrl
  
  // If it's already an HTTP URL, return as is
  if (ipfsUrl.startsWith('http')) {
    return ipfsUrl
  }
  
  // If it's an IPFS URL, convert to HTTP
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '')
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }
  
  // If it's just a hash, assume it's IPFS
  if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('baf')) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`
  }
  
  return ipfsUrl
}
