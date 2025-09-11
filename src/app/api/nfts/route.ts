import { NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi, defineChain } from 'viem'

// Define Somnia testnet
const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia',
    symbol: 'SST',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
})

// Create a public client for reading blockchain data
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http('https://dream-rpc.somnia.network')
})

// Contract ABI for the functions we need
const NFT_ABI = parseAbi([
  'function nextId() view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address, uint256)',
])

const CONTRACT_ADDRESS = '0xc0b79C48bD4Db891F073499FBd51fC2FaAbD5D03' as `0x${string}`

export async function GET() {
  try {
    // Get total supply
    const totalSupply = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'nextId',
    })

    if (totalSupply === BigInt(0)) {
      return NextResponse.json({
        nfts: [],
        totalSupply: 0,
      })
    }

    // Fetch all NFTs (skip IDs that reverted to avoid 404s on burned/unminted)
    const nfts = [] as Array<{ tokenId: string; owner: string; tokenURI: string; royaltyInfo: { receiver: string; amount: string } }>
    for (let i = BigInt(1); i <= totalSupply; i++) {
      try {
        const [owner, tokenURI, royaltyInfo] = await Promise.all([
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'ownerOf',
            args: [i],
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'tokenURI',
            args: [i],
          }),
          publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'royaltyInfo',
            args: [i, BigInt('1000000000000000000')], // 1 ETH in wei
          }),
        ])

        nfts.push({
          tokenId: i.toString(),
          owner,
          tokenURI,
          royaltyInfo: {
            receiver: royaltyInfo[0],
            amount: royaltyInfo[1].toString(),
          },
        })
      } catch (error) {
        console.error(`Error fetching NFT ${i}:`, error)
        // Skip this NFT if there's an error
      }
    }

    return NextResponse.json({
      nfts,
      totalSupply: totalSupply.toString(),
    })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    )
  }
}
