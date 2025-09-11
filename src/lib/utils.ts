import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
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
