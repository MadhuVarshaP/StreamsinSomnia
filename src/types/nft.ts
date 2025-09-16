export interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  royaltyInfo?: [string, bigint]
}

export interface TransactionHistory {
  id: string
  type: 'NFT_MINT' | 'NFT_TRANSFER' | 'NFT_SALE' | 'NFT_LISTED' | 'NFT_BOUGHT' | 'STT_TRANSFER' | 'ROYALTY_PAYMENT' | 'WITHDRAWAL'
  hash: string
  timestamp: number
  from: string
  to: string
  tokenId?: string
  amount: string
  token: 'NFT' | 'STT' | 'ETH'
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  gasUsed: string
  gasPrice: string
  royaltyBps?: string
  splitterAddress?: string
  royaltyAmount?: string
  buyer?: string
  seller?: string
}

export interface RoyaltyDistribution {
  tokenId: string
  splitterAddress: string
  amount: string
  timestamp: number
  transactionHash: string
}
