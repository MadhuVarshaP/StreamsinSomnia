/* eslint-disable @typescript-eslint/no-explicit-any */
// Pinata IPFS service for NFT metadata and image storage
export interface PinataConfig {
  pinataApiKey: string
  pinataSecretApiKey: string
  pinataGroupId?: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
  animation_url?: string
}

export interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

class PinataService {
  private apiKey: string
  private secretKey: string
  private groupId?: string
  private baseUrl = 'https://api.pinata.cloud'

  constructor(config: PinataConfig) {
    this.apiKey = config.pinataApiKey
    this.secretKey = config.pinataSecretApiKey
    this.groupId = config.pinataGroupId
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.secretKey,
    }
  }

  private getFileHeaders() {
    return {
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.secretKey,
    }
  }

  // Upload JSON metadata to IPFS
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      const requestBody: any = {
        pinataContent: metadata,
        pinataMetadata: {
          name: `nft-metadata-${Date.now()}`,
          keyvalues: this.groupId ? { groupId: this.groupId } : undefined,
        },
      }

      // Add group ID if provided
      if (this.groupId) {
        requestBody.pinataOptions = {
          cidVersion: 0,
        }
        requestBody.pinataMetadata.groupId = this.groupId
      }

      const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`)
      }

      const result: PinataResponse = await response.json()
      return `ipfs://${result.IpfsHash}`
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error)
      throw error
    }
  }

  // Upload file (image) to IPFS
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const metadata: any = {
        name: `nft-image-${Date.now()}`,
        keyvalues: this.groupId ? { groupId: this.groupId } : undefined,
      }

      // Add group ID if provided
      if (this.groupId) {
        metadata.groupId = this.groupId
      }

      formData.append('pinataMetadata', JSON.stringify(metadata))

      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: this.getFileHeaders(),
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`)
      }

      const result: PinataResponse = await response.json()
      return `ipfs://${result.IpfsHash}`
    } catch (error) {
      console.error('Error uploading file to Pinata:', error)
      throw error
    }
  }

  // Fetch metadata from IPFS
  async fetchMetadata(ipfsHash: string): Promise<NFTMetadata> {
    try {
      // Remove ipfs:// prefix if present
      const hash = ipfsHash.replace('ipfs://', '')
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching metadata from IPFS:', error)
      throw error
    }
  }

  // Get IPFS gateway URL for images
  getImageUrl(ipfsHash: string): string {
    const hash = ipfsHash.replace('ipfs://', '')
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  }
}

// Create a singleton instance
// You'll need to set these environment variables in your .env.local file
const pinataService = new PinataService({
  pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
  pinataSecretApiKey: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
  pinataGroupId: process.env.NEXT_PUBLIC_PINATA_GROUP_ID || '',
})

export default pinataService
