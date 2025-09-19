# Somnia in Streams

**Stream NFT royalties in real-time with flexible multi-recipient splits**

A decentralized application (dApp) that enables creators to mint NFTs with configurable royalty distributions, trade them on a marketplace, and track streaming royalties with real-time analytics.

## Demo
[https://streams-in-somnia.vercel.app/](https://streams-in-somnia.vercel.app/)

## Blockchain Network

This application is deployed on the **Somnia Testnet**, a specialized blockchain network designed for streaming and media applications.

### Network Details
- **Network Name**: Somnia Testnet
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network
- **Block Explorer**: [Shannon Explorer](https://shannon-explorer.somnia.network)
- **Native Currency**: STT
- **Decimals**: 18

### Contract Addresses
- **StreamingRoyaltyNFT**: `0x027EEF6A26895cb9449429eeF5427DFbd6bddCe8`
- **RoyaltyRouter**: `0xC309801662819Cfe3c47a9a0F3C8713be98a17EA`
- **RoyaltySplitterFactory**: `0x19F981df090d9B07792eE3059dbC654AC6d7fa45`
- **STT Token**: `0xA8281345C56DB6d8794d4E175fd6a2f3c45c9594`

### Supported Networks
The application also supports multiple networks for flexibility:
- Somnia Testnet (Primary)
- Ethereum Mainnet
- Ethereum Sepolia
- Polygon
- Arbitrum
- Optimism

## Features

### NFT Minting
- Create unique NFTs with custom metadata
- Upload images and metadata to IPFS
- Set flexible royalty rates (0-100%)
- Configure multiple recipient addresses with custom split percentages

### Marketplace
- Browse and purchase NFTs using STT tokens
- Automatic royalty distribution on sales
- Real-time listing management
- Integrated wallet connectivity

### Royalty Tracking
- Real-time streaming royalty visualization
- Live performance analytics
- Historical earnings tracking
- Multi-recipient payout management

### Earnings Management
- Withdraw accumulated royalties
- Track earnings per NFT
- View detailed transaction history
- Monitor splitter contract performance

## Architecture

<img width="4557" height="3918" alt="image" src="https://github.com/user-attachments/assets/63c34960-c647-497e-9268-62b837615a0c" />

### Smart Contracts
- **`StreamingRoyaltyNFT`**: ERC721 NFT contract with per-token royalty support
- **`RoyaltySplitter`**: Multi-recipient royalty distribution contract
- **`RoyaltyRouter`**: Marketplace contract handling buy/sell operations
- **`CustomToken`**: STT (Somnia Token) ERC20 contract for payments

### Frontend Stack
- **Next.js 15.5.2** with App Router
- **React 19** with TypeScript
- **Wagmi v2** for Web3 integration
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization

### Storage & Infrastructure
- **IPFS** (via Pinata) for decentralized metadata storage
- **WalletConnect** for wallet integration
- **Viem** for blockchain interactions

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- MetaMask or compatible Web3 wallet
- STT tokens for transactions

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MadhuVarshaP/StreamsinSomnia.git
   cd StreamsinSomnia
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
   NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Minting an NFT
1. Connect your wallet
2. Navigate to "Mint NFT"
3. Fill in NFT details (name, description, image)
4. Set royalty rate and configure recipient splits
5. Upload to IPFS and deploy to blockchain
6. List for sale on the marketplace

### Buying NFTs
1. Browse the marketplace
2. Select an NFT to purchase
3. Ensure sufficient STT token balance
4. Approve token spending and execute purchase
5. Royalties automatically distribute to recipients

### Tracking Earnings
1. View "My Streams" for owned NFTs
2. Check "Royalty Dashboard" for earnings analytics
3. Withdraw accumulated royalties
4. Monitor real-time performance charts

## Development

### Available Scripts
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── forms/          # Form components
│   ├── marketplace/    # NFT marketplace components
│   ├── royalty/        # Royalty tracking components
│   ├── streams/        # Streaming components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
└── types/              # TypeScript type definitions

contracts/              # Solidity smart contracts
├── StreamingRoyaltyNFT.sol
├── RoyaltySplitterFactory.sol
├── RoyaltySplitter.sol
├── RoyaltyRouter.sol
└── CustomToken.sol
```
