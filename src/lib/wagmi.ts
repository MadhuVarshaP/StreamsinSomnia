import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Define Somnia testnet
export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia',
    symbol: 'SOM',
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

export const config = createConfig({
  chains: [somniaTestnet, mainnet, sepolia, polygon, arbitrum, optimism],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId,
    }),
  ],
  transports: {
    [somniaTestnet.id]: http('https://dream-rpc.somnia.network', {
      timeout: 30000,
      retryCount: 3,
    }),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
