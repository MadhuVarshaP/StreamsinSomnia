export interface NFTData {
  tokenId: bigint
  owner: string
  tokenURI: string
  royaltyInfo?: [string, bigint]
}
