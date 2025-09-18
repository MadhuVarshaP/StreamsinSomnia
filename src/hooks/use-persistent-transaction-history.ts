import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { TransactionHistory } from "@/types/nft";
import { createPublicClient, http } from "viem";
import {
  CONTRACT_ADDRESSES,
  STREAMING_ROYALTY_NFT_ABI,
  STT_TOKEN_ABI,
  ROYALTY_ROUTER_ABI,
} from "@/lib/contracts";

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

// Define proper event argument types
interface MintEventArgs {
  tokenId: bigint;
  owner: string;
  splitter: string;
  royaltyBps: bigint;
}

interface PurchaseEventArgs {
  tokenId: bigint;
  buyer: string;
  seller: string;
  salePrice: bigint;
  royalty: bigint;
}

interface RoyaltyEventArgs {
  recipient: string;
  tokenId: bigint;
  amount: bigint;
}

interface TransferEventArgs {
  from: string;
  to: string;
  value: bigint;
}

// Local storage key for persistent data
const STORAGE_KEY = "somnia_transaction_history";

// Interface for stored data
interface StoredTransactionData {
  [address: string]: {
    transactions: TransactionHistory[];
    lastFetched: number;
    lastBlock: string;
  };
}

// Helper function to get block timestamp
const getBlockTimestamp = async (blockNumber: bigint) => {
  try {
    const block = await publicClient.getBlock({ blockNumber });
    return Number(block.timestamp);
  } catch {
    return Date.now() / 1000;
  }
};

// Helper function to create transaction record
const createTransaction = async (
  hash: string,
  type:
    | "NFT_MINT"
    | "NFT_BOUGHT"
    | "NFT_SALE"
    | "ROYALTY_PAYMENT"
    | "STT_TRANSFER",
  blockNumber: bigint,
  from: string,
  to: string,
  tokenId?: string,
  amount?: string,
  token?: "ETH" | "NFT" | "STT",
  royaltyAmount?: string,
  splitterAddress?: string
): Promise<TransactionHistory> => {
  const receipt = await publicClient.getTransactionReceipt({
    hash: hash as `0x${string}`,
  });
  const timestamp = await getBlockTimestamp(blockNumber);

  return {
    id: hash,
    type: type as TransactionHistory["type"],
    hash,
    timestamp,
    from,
    to,
    tokenId: tokenId || "",
    amount: amount || "0",
    token: token || "ETH",
    status: receipt.status === "success" ? "SUCCESS" : "FAILED",
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: "0",
    royaltyAmount,
    splitterAddress,
  };
};

// Load data from localStorage
const loadStoredData = (): StoredTransactionData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save data to localStorage
const saveStoredData = (data: StoredTransactionData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save transaction data:", error);
  }
};

// Enhanced transaction history hook with persistent storage
export function usePersistentTransactionHistory() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allAddressesData, setAllAddressesData] =
    useState<StoredTransactionData>({});

  // Load stored data on mount
  useEffect(() => {
    const stored = loadStoredData();
    setAllAddressesData(stored);

    if (address && stored[address]) {
      setTransactions(stored[address].transactions || []);
    }
  }, []);

  // Update transactions when address changes
  useEffect(() => {
    if (address && allAddressesData[address]) {
      setTransactions(allAddressesData[address].transactions || []);
    } else {
      setTransactions([]);
    }
  }, [address, allAddressesData]);

  const fetchComprehensiveTransactionHistory = useCallback(
    async (targetAddress: string) => {
      if (!targetAddress) return;

      setIsLoading(true);
      setError(null);

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const maxBlocks = BigInt(1000); // Respect RPC limit
        const fromBlock =
          currentBlock > maxBlocks ? currentBlock - maxBlocks : BigInt(0);

        console.log(
          `Fetching comprehensive transaction history for ${targetAddress} from block ${fromBlock} to ${currentBlock}`
        );

        const allTransactions: TransactionHistory[] = [];

        // 1. NFT Minting Events
        try {
          const mintEvents = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.STREAMING_ROYALTY_NFT,
            event: {
              type: "event",
              name: "NFTMinted",
              inputs: [
                { name: "tokenId", type: "uint256", indexed: true },
                { name: "owner", type: "address", indexed: true },
                { name: "splitter", type: "address", indexed: false },
                { name: "royaltyBps", type: "uint96", indexed: false },
              ],
            },
            args: { owner: targetAddress as `0x${string}` },
            fromBlock,
            toBlock: currentBlock,
          });

          for (const event of mintEvents) {
            const args = event.args as MintEventArgs;
            const tx = await createTransaction(
              event.transactionHash,
              "NFT_MINT",
              event.blockNumber!,
              "0x0000000000000000000000000000000000000000",
              args.owner,
              args.tokenId.toString(),
              "0",
              "NFT",
              undefined,
              args.splitter
            );
            allTransactions.push(tx);
          }
        } catch (err) {
          console.error("Error fetching mint events:", err);
        }

        // 2. NFT Purchase Events (as buyer)
        try {
          const purchaseEvents = await publicClient.getLogs({
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
            args: { buyer: targetAddress as `0x${string}` },
            fromBlock,
            toBlock: currentBlock,
          });

          for (const event of purchaseEvents) {
            const args = event.args as PurchaseEventArgs;
            const tx = await createTransaction(
              event.transactionHash,
              "NFT_BOUGHT",
              event.blockNumber!,
              args.seller,
              args.buyer,
              args.tokenId.toString(),
              args.salePrice.toString(),
              "STT",
              args.royalty.toString()
            );
            allTransactions.push(tx);
          }
        } catch (err) {
          console.error("Error fetching purchase events:", err);
        }

        // 3. NFT Sale Events (as seller)
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
            args: { seller: targetAddress as `0x${string}` },
            fromBlock,
            toBlock: currentBlock,
          });

          for (const event of saleEvents) {
            const args = event.args as PurchaseEventArgs;
            const tx = await createTransaction(
              event.transactionHash,
              "NFT_SALE",
              event.blockNumber!,
              args.seller,
              args.buyer,
              args.tokenId.toString(),
              args.salePrice.toString(),
              "STT",
              args.royalty.toString()
            );
            allTransactions.push(tx);
          }
        } catch (err) {
          console.error("Error fetching sale events:", err);
        }

        // 4. Royalty Distribution Events
        try {
          const royaltyEvents = await publicClient.getLogs({
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
            const args = event.args as RoyaltyEventArgs;
            const tx = await createTransaction(
              event.transactionHash,
              "ROYALTY_PAYMENT",
              event.blockNumber!,
              event.address,
              args.recipient,
              args.tokenId.toString(),
              args.amount.toString(),
              "STT"
            );
            allTransactions.push(tx);
          }
        } catch (err) {
          console.error("Error fetching royalty events:", err);
        }

        // 5. STT Token Transfers (received)
        try {
          const sttReceived = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.STT_TOKEN,
            event: {
              type: "event",
              name: "Transfer",
              inputs: [
                { name: "from", type: "address", indexed: true },
                { name: "to", type: "address", indexed: true },
                { name: "value", type: "uint256", indexed: false },
              ],
            },
            args: { to: targetAddress as `0x${string}` },
            fromBlock,
            toBlock: currentBlock,
          });

          for (const event of sttReceived) {
            const args = event.args as TransferEventArgs;
            const tx = await createTransaction(
              event.transactionHash,
              "STT_TRANSFER",
              event.blockNumber!,
              args.from,
              args.to,
              "",
              args.value.toString(),
              "STT"
            );
            allTransactions.push(tx);
          }
        } catch (err) {
          console.error("Error fetching STT transfer events:", err);
        }

        // Remove duplicates and sort by timestamp
        const uniqueTransactions = allTransactions.filter(
          (tx, index, self) =>
            index ===
            self.findIndex((t) => t.hash === tx.hash && t.type === tx.type)
        );

        uniqueTransactions.sort((a, b) => b.timestamp - a.timestamp);

        // Update stored data
        const updatedData = {
          ...allAddressesData,
          [targetAddress]: {
            transactions: uniqueTransactions,
            lastFetched: Date.now(),
            lastBlock: currentBlock.toString(),
          },
        };

        setAllAddressesData(updatedData);
        saveStoredData(updatedData);

        if (targetAddress === address) {
          setTransactions(uniqueTransactions);
        }

        console.log(
          `Found ${uniqueTransactions.length} unique transactions for ${targetAddress}`
        );
      } catch (err) {
        console.error("Error fetching transaction history:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch transaction history"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [address, allAddressesData]
  );

  // Fetch data for current address
  const fetchCurrentAddressHistory = useCallback(() => {
    if (address) {
      fetchComprehensiveTransactionHistory(address);
    }
  }, [address, fetchComprehensiveTransactionHistory]);

  // Listen for real-time updates
  useEffect(() => {
    const handleNFTMinted = () => {
      console.log("NFT minted event detected, refreshing transaction history");
      setTimeout(() => fetchCurrentAddressHistory(), 2000);
    };

    const handleNFTPurchased = () => {
      console.log(
        "NFT purchased event detected, refreshing transaction history"
      );
      setTimeout(() => fetchCurrentAddressHistory(), 2000);
    };

    window.addEventListener("nftMinted", handleNFTMinted);
    window.addEventListener("nftPurchased", handleNFTPurchased);

    return () => {
      window.removeEventListener("nftMinted", handleNFTMinted);
      window.removeEventListener("nftPurchased", handleNFTPurchased);
    };
  }, [fetchCurrentAddressHistory]);

  // Auto-fetch when address changes
  useEffect(() => {
    if (isConnected && address) {
      // Check if we need to fetch new data (older than 5 minutes or no data)
      const stored = allAddressesData[address];
      const shouldFetch =
        !stored || Date.now() - stored.lastFetched > 5 * 60 * 1000; // 5 minutes

      if (shouldFetch) {
        fetchCurrentAddressHistory();
      }
    }
  }, [address, isConnected, fetchCurrentAddressHistory, allAddressesData]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchCurrentAddressHistory,
    allAddressesData,
    fetchAddressHistory: fetchComprehensiveTransactionHistory,
  };
}
