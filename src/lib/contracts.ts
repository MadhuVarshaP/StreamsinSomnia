// Contract addresses on Somnia Testnet (Chain ID: 50312)
export const CONTRACT_ADDRESSES = {
  STREAMING_ROYALTY_NFT: "0x9E8833952841Cdb5c238B239a3633b9B33106B2E",
  ROYALTY_SPLITTER: "0xa5820d0DC4F9B79c7336A0661e0F96aBeF8c7bd8", 
  ROYALTY_ROUTER: "0x2B6334F2d9e27e61aE6985B43E7b7C089E91ef85",
} as const

// Contract ABIs
export const STREAMING_ROYALTY_NFT_ABI = [
  // ERC721 functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // Custom functions
  "function nextId() view returns (uint256)",
  "function mint(address to, string memory tokenURI_, address splitter, uint96 royaltyBps) external returns (uint256 tokenId)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
] as const

export const ROYALTY_SPLITTER_ABI = [
  "function shares(uint256) view returns (address account, uint96 bps)",
  "function TOTAL_BPS() view returns (uint96)",
  "function getShares() view returns (tuple(address account, uint96 bps)[])",
  "receive() external payable",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
] as const

export const ROYALTY_ROUTER_ABI = [
  "function nft() view returns (address)",
  "function meta() view returns (address)",
  "function sell(uint256 tokenId, address seller, address buyer) external payable",
  
  // Events
  "event SaleSettled(uint256 indexed tokenId, uint256 salePrice, uint256 royalty)",
] as const

// ERC2981 Royalty Standard ABI
export const ERC2981_ABI = [
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
] as const
