// Mock data for the Somnia in Streams Streaming Royalties dApp

export type WalletBalance = {
  label: string
  amount: number
  unit: string
}

export type Payout = {
  id: string
  date: string
  nftId: string
  event: "Sale" | "Stream"
  amount: number
  recipient: string
}

export type StreamRecipient = {
  handle: string
  percent: number
}

export type StreamItem = {
  id: string
  nftTitle: string
  nftId: string
  thumbnail: string
  recipients: StreamRecipient[]
  perSecondAmount: number // mock streaming amount per second
}

export const walletBalances: WalletBalance[] = [
  { label: "Creator", amount: 1243.88, unit: "USDC" },
  { label: "DAO", amount: 5678.12, unit: "USDC" },
  { label: "Collaborator", amount: 932.27, unit: "USDC" },
]

export const recentPayouts: Payout[] = [
  { id: "1", date: "2025-08-25", nftId: "#1024", event: "Stream", amount: 42.1, recipient: "@Artist" },
  { id: "2", date: "2025-08-25", nftId: "#0982", event: "Sale", amount: 210.0, recipient: "@DAO" },
  { id: "3", date: "2025-08-24", nftId: "#0881", event: "Stream", amount: 18.55, recipient: "@Collab" },
  { id: "4", date: "2025-08-23", nftId: "#0765", event: "Stream", amount: 33.6, recipient: "@Artist" },
]

export const streams: StreamItem[] = [
  {
    id: "s-1",
    nftTitle: "Track #12",
    nftId: "#012",
    thumbnail: "/nft-track-thumbnail.png",
    recipients: [
      { handle: "@Artist", percent: 40 },
      { handle: "@DAO", percent: 60 },
    ],
    perSecondAmount: 0.015,
  },
  {
    id: "s-2",
    nftTitle: "Live Set — Aurora",
    nftId: "#044",
    thumbnail: "/nft-live-set-thumbnail.png",
    recipients: [
      { handle: "@Artist", percent: 70 },
      { handle: "@Collab", percent: 30 },
    ],
    perSecondAmount: 0.011,
  },
  {
    id: "s-3",
    nftTitle: "Cinematic Loop",
    nftId: "#077",
    thumbnail: "/nft-cinematic-loop-thumbnail.png",
    recipients: [
      { handle: "@Collective", percent: 55 },
      { handle: "@Composer", percent: 45 },
    ],
    perSecondAmount: 0.02,
  },
]

export const historyRows: Payout[] = [
  { id: "h-1", date: "2025-08-21", nftId: "#012", event: "Stream", amount: 12.34, recipient: "@Artist, @DAO" },
  { id: "h-2", date: "2025-08-20", nftId: "#044", event: "Sale", amount: 420.0, recipient: "@Artist, @Collab" },
  { id: "h-3", date: "2025-08-19", nftId: "#077", event: "Stream", amount: 7.77, recipient: "@Collective, @Composer" },
  { id: "h-4", date: "2025-08-18", nftId: "#012", event: "Stream", amount: 15.92, recipient: "@Artist, @DAO" },
]
