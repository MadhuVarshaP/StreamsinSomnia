export interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  royaltyInfo?: [string, bigint]
}

export interface TransactionHistory {
  id: string
  type: 'NFT_MINT' | 'NFT_TRANSFER' | 'NFT_SALE' | 'STT_TRANSFER' | 'ROYALTY_PAYMENT'
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
}
