import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { createPublicClient, http, formatEther } from "viem";
import { CONTRACT_ADDRESSES, ROYALTY_SPLITTER_ABI } from "@/lib/contracts";

// Create public client
const publicClient = createPublicClient({
  chain: {
    id: 50312,
    name: "Somnia Testnet",
    nativeCurrency: {
      decimals: 18,
      name: "Somnia",
      symbol: "SOM",
    },
    rpcUrls: {
      default: {
        http: ["https://dream-rpc.somnia.network"],
      },
      public: {
        http: ["https://dream-rpc.somnia.network"],
      },
    },
    blockExplorers: {
      default: {
        name: "Shannon Explorer",
        url: "https://shannon-explorer.somnia.network",
      },
    },
    testnet: true,
  },
  transport: http("https://dream-rpc.somnia.network", {
    timeout: 30000,
    retryCount: 3,
  }),
});

export interface RoyaltyDistributionDetail {
  id: string;
  tokenId: string;
  nftName: string;
  splitterAddress: string;
  recipientAddress: string;
  recipientName: string;
  amount: string;
  amountFormatted: string;
  percentage: number;
  timestamp: number;
  transactionHash: string;
  salePrice?: string;
  totalRoyalty?: string;
  blockNumber: bigint;
}

export interface RoyaltySummary {
  totalEarnings: string;
  totalDistributions: number;
  averageRoyalty: string;
  topNFT: {
    tokenId: string;
    name: string;
    earnings: string;
  };
  recentDistributions: RoyaltyDistributionDetail[];
}

// Local storage key for persistent royalty data
const ROYALTY_STORAGE_KEY = "somnia_royalty_data";

// Interface for stored royalty data
interface StoredRoyaltyData {
  [address: string]: {
    distributions: RoyaltyDistributionDetail[];
    summary: RoyaltySummary | null;
    lastFetched: number;
    lastBlock: string;
  };
}

// Helper function to get all splitter contracts
async function getAllSplitterContracts(): Promise<string[]> {
  try {
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock =
      currentBlock > BigInt(1000) ? currentBlock - BigInt(1000) : BigInt(0);

    const splitterCreationEvents = await publicClient.getLogs({
      address: CONTRACT_ADDRESSES.ROYALTY_SPLITTER_FACTORY,
      event: {
        type: "event",
        name: "SplitterCreated",
        inputs: [
          { name: "splitter", type: "address", indexed: true },
          { name: "creator", type: "address", indexed: true },
        ],
      },
      fromBlock,
      toBlock: currentBlock,
    });

    return splitterCreationEvents
      .map((event) => event.args.splitter)
      .filter((addr): addr is `0x${string}` => Boolean(addr));
  } catch (error) {
    console.error("Error fetching splitter contracts:", error);
    return [];
  }
}

// Helper function to get NFT name from tokenId
async function getNFTName(tokenId: string): Promise<string> {
  try {
    const tokenURI = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
      abi: [
        {
          name: "tokenURI",
          type: "function",
          inputs: [{ name: "tokenId", type: "uint256" }],
          outputs: [{ name: "", type: "string" }],
          stateMutability: "view",
        },
      ],
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    if (tokenURI) {
      const response = await fetch(
        tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      );
      const metadata = await response.json();
      return metadata.name || `NFT #${tokenId}`;
    }
    return `NFT #${tokenId}`;
  } catch {
    return `NFT #${tokenId}`;
  }
}

// Helper function to get recipient name
function getRecipientName(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Load data from localStorage
const loadStoredRoyaltyData = (): StoredRoyaltyData => {
  try {
    const stored = localStorage.getItem(ROYALTY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save data to localStorage
const saveStoredRoyaltyData = (data: StoredRoyaltyData) => {
  try {
    localStorage.setItem(ROYALTY_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save royalty data:", error);
  }
};

export function usePersistentRoyaltyTracking() {
  const { address, isConnected } = useAccount();
  const [distributions, setDistributions] = useState<
    RoyaltyDistributionDetail[]
  >([]);
  const [summary, setSummary] = useState<RoyaltySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allAddressesData, setAllAddressesData] = useState<StoredRoyaltyData>(
    {}
  );

  // Load stored data on mount
  useEffect(() => {
    const stored = loadStoredRoyaltyData();
    setAllAddressesData(stored);

    if (address && stored[address]) {
      setDistributions(stored[address].distributions || []);
      setSummary(stored[address].summary || null);
    }
  }, []);

  // Update data when address changes
  useEffect(() => {
    if (address && allAddressesData[address]) {
      setDistributions(allAddressesData[address].distributions || []);
      setSummary(allAddressesData[address].summary || null);
    } else {
      setDistributions([]);
      setSummary(null);
    }
  }, [address, allAddressesData]);

  const fetchComprehensiveRoyaltyData = useCallback(
    async (targetAddress: string) => {
      if (!targetAddress) return;

      setIsLoading(true);
      setError(null);

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const maxBlocks = BigInt(1000);
        const fromBlock =
          currentBlock > maxBlocks ? currentBlock - maxBlocks : BigInt(0);

        console.log(
          `Fetching comprehensive royalty data for ${targetAddress} from block ${fromBlock} to ${currentBlock}`
        );

        // Get all splitter contracts
        const splitterContracts = await getAllSplitterContracts();
        console.log(`Found ${splitterContracts.length} splitter contracts`);

        const allDistributions: RoyaltyDistributionDetail[] = [];

        // Fetch royalty distributions from all splitter contracts
        for (const splitterAddress of splitterContracts) {
          try {
            const royaltyEvents = await publicClient.getLogs({
              address: splitterAddress as `0x${string}`,
              event: {
                type: "event",
                name: "RoyaltyDistributed",
                inputs: [
                  { name: "recipient", type: "address", indexed: true },
                  { name: "tokenId", type: "uint256", indexed: true },
                  { name: "amount", type: "uint256", indexed: false },
                ],
              },
              args: { recipient: targetAddress as `0x${string}` },
              fromBlock,
              toBlock: currentBlock,
            });

            for (const event of royaltyEvents) {
              const args = event.args as {
                recipient: string;
                tokenId: bigint;
                amount: bigint;
              };

              const tokenId = args.tokenId.toString();
              const amount = args.amount.toString();
              const recipientAddress = args.recipient;

              // Get block timestamp
              const block = await publicClient.getBlock({
                blockNumber: event.blockNumber!,
              });
              const timestamp = Number(block.timestamp);

              // Get NFT name
              const nftName = await getNFTName(tokenId);

              // Get splitter shares to calculate percentage
              let percentage = 0;
              try {
                const shares = await publicClient.readContract({
                  address: splitterAddress as `0x${string}`,
                  abi: ROYALTY_SPLITTER_ABI,
                  functionName: "getShares",
                  args: [],
                });

                const userShare = (
                  shares as Array<{ account: string; bps: bigint }>
                ).find(
                  (share) =>
                    share.account.toLowerCase() ===
                    recipientAddress.toLowerCase()
                );
                percentage = userShare ? Number(userShare.bps) / 100 : 0;
              } catch (err) {
                console.log("Could not fetch splitter shares:", err);
              }

              // Try to get related sale transaction
              let salePrice = "0";
              let totalRoyalty = "0";

              try {
                const saleEvents = await publicClient.getLogs({
                  address: CONTRACT_ADDRESSES.ROYALTY_ROUTER,
                  event: {
                    type: "event",
                    name: "NFTBought",
                    inputs: [
                      { name: "tokenId", type: "uint256", indexed: true },
                      { name: "buyer", type: "address", indexed: true },
                      { name: "seller", type: "address", indexed: true },
                      { name: "salePrice", type: "uint256", indexed: false },
                      { name: "royalty", type: "uint256", indexed: false },
                    ],
                  },
                  args: { tokenId: BigInt(tokenId) },
                  fromBlock: event.blockNumber!,
                  toBlock: event.blockNumber!,
                });

                if (saleEvents.length > 0) {
                  const saleArgs = saleEvents[0].args as {
                    salePrice: bigint;
                    royalty: bigint;
                  };
                  salePrice = saleArgs.salePrice.toString();
                  totalRoyalty = saleArgs.royalty.toString();
                }
              } catch (err) {
                console.log("Could not fetch related sale data:", err);
              }

              allDistributions.push({
                id: `${event.transactionHash}-${tokenId}-${recipientAddress}`,
                tokenId,
                nftName,
                splitterAddress,
                recipientAddress,
                recipientName: getRecipientName(recipientAddress),
                amount,
                amountFormatted: formatEther(BigInt(amount)),
                percentage,
                timestamp,
                transactionHash: event.transactionHash,
                salePrice,
                totalRoyalty,
                blockNumber: event.blockNumber!,
              });
            }
          } catch (err) {
            console.log(
              `Error fetching from splitter ${splitterAddress}:`,
              err
            );
          }
        }

        // Sort by timestamp (newest first)
        allDistributions.sort((a, b) => b.timestamp - a.timestamp);

        // Calculate summary statistics
        const totalEarnings = allDistributions.reduce(
          (sum, dist) => sum + parseFloat(formatEther(BigInt(dist.amount))),
          0
        );

        const nftEarnings = new Map<
          string,
          { name: string; earnings: number }
        >();
        allDistributions.forEach((dist) => {
          const earnings = parseFloat(formatEther(BigInt(dist.amount)));
          const existing = nftEarnings.get(dist.tokenId) || {
            name: dist.nftName,
            earnings: 0,
          };
          nftEarnings.set(dist.tokenId, {
            name: existing.name,
            earnings: existing.earnings + earnings,
          });
        });

        const topNFT = Array.from(nftEarnings.entries()).reduce(
          (max, [tokenId, data]) =>
            data.earnings > max.earnings ? { tokenId, ...data } : max,
          { tokenId: "0", name: "None", earnings: 0 }
        );

        const summary: RoyaltySummary = {
          totalEarnings: totalEarnings.toFixed(4),
          totalDistributions: allDistributions.length,
          averageRoyalty:
            allDistributions.length > 0
              ? (totalEarnings / allDistributions.length).toFixed(4)
              : "0",
          topNFT: {
            tokenId: topNFT.tokenId,
            name: topNFT.name,
            earnings: topNFT.earnings.toFixed(4),
          },
          recentDistributions: allDistributions.slice(0, 10),
        };

        // Update stored data
        const updatedData = {
          ...allAddressesData,
          [targetAddress]: {
            distributions: allDistributions,
            summary,
            lastFetched: Date.now(),
            lastBlock: currentBlock.toString(),
          },
        };

        setAllAddressesData(updatedData);
        saveStoredRoyaltyData(updatedData);

        if (targetAddress === address) {
          setDistributions(allDistributions);
          setSummary(summary);
        }

        console.log(
          `Found ${allDistributions.length} royalty distributions for ${targetAddress}`
        );
      } catch (err) {
        console.error("Error fetching royalty distributions:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch royalty distributions"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [address, allAddressesData]
  );

  // Fetch data for current address
  const fetchCurrentAddressData = useCallback(() => {
    if (address) {
      fetchComprehensiveRoyaltyData(address);
    }
  }, [address, fetchComprehensiveRoyaltyData]);

  // Listen for real-time updates
  useEffect(() => {
    const handleNFTPurchased = () => {
      console.log("NFT purchased event detected, refreshing royalty data");
      setTimeout(() => fetchCurrentAddressData(), 3000);
    };

    window.addEventListener("nftPurchased", handleNFTPurchased);

    return () => {
      window.removeEventListener("nftPurchased", handleNFTPurchased);
    };
  }, [fetchCurrentAddressData]);

  // Auto-fetch when address changes
  useEffect(() => {
    if (isConnected && address) {
      // Check if we need to fetch new data (older than 5 minutes or no data)
      const stored = allAddressesData[address];
      const shouldFetch =
        !stored || Date.now() - stored.lastFetched > 5 * 60 * 1000; // 5 minutes

      if (shouldFetch) {
        fetchCurrentAddressData();
      }
    }
  }, [address, isConnected, fetchCurrentAddressData, allAddressesData]);

  return {
    distributions,
    summary,
    isLoading,
    error,
    refetch: fetchCurrentAddressData,
    allAddressesData,
    fetchAddressData: fetchComprehensiveRoyaltyData,
  };
}
