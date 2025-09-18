"use client";

import { AppShell } from "../../components/app-shell";
import { useMemo, useState } from "react";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Crown,
  Star,
} from "lucide-react";
import { usePersistentRoyaltyTracking } from "@/hooks/use-persistent-royalty-tracking";
import {
  shortenAddress,
  formatTransactionAmount,
  formatTransactionDate,
} from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";

export default function RoyaltyDashboardPage() {
  const [q, setQ] = useState("");
  const [filterRecipient, setFilterRecipient] = useState<string>("ALL");
  const {
    distributions,
    summary,
    isLoading,
    error,
    refetch,
    allAddressesData,
  } = usePersistentRoyaltyTracking();
  const { toast } = useToast();

  const filtered = useMemo(() => {
    let filteredDistributions = distributions;

    // Filter by search query
    if (q.trim()) {
      const searchTerm = q.trim().toLowerCase();
      filteredDistributions = filteredDistributions.filter(
        (dist) =>
          dist.tokenId.toLowerCase().includes(searchTerm) ||
          dist.nftName.toLowerCase().includes(searchTerm) ||
          dist.recipientAddress.toLowerCase().includes(searchTerm) ||
          dist.recipientName.toLowerCase().includes(searchTerm) ||
          dist.transactionHash.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by recipient (if not ALL)
    if (filterRecipient !== "ALL") {
      filteredDistributions = filteredDistributions.filter(
        (dist) =>
          dist.recipientAddress.toLowerCase() === filterRecipient.toLowerCase()
      );
    }

    return filteredDistributions;
  }, [distributions, q, filterRecipient]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
      duration: 2000,
    });
  };

  const getUniqueRecipients = () => {
    const recipients = new Set(distributions.map((d) => d.recipientAddress));
    return Array.from(recipients)
      .map((address) => {
        const recipientDistributions = distributions.filter(
          (d) => d.recipientAddress === address
        );
        const totalAmount = recipientDistributions.reduce(
          (sum, d) => sum + parseFloat(d.amountFormatted),
          0
        );
        return {
          address,
          name:
            recipientDistributions[0]?.recipientName || shortenAddress(address),
          totalAmount,
          count: recipientDistributions.length,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const uniqueRecipients = getUniqueRecipients();

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 p-8 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)] animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <Crown className="h-6 w-6 text-lime-400" />
              </div>
              <h1 className="text-3xl font-bold text-[#f5eada]">
                Royalty Dashboard
              </h1>
            </div>
            <p className="text-[#f5eada]/80 text-lg max-w-2xl">
              Track all your royalty distributions and earnings. Data is
              persisted per address and updates in real-time.
            </p>
          </div>
        </motion.div>

        {/* Summary Stats */}
        {summary && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[#f5eada]/70">Total Earnings</p>
                    <p className="text-2xl font-bold text-[#f5eada]">
                      {summary.totalEarnings} STT
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[#f5eada]/70">
                      Total Distributions
                    </p>
                    <p className="text-2xl font-bold text-[#f5eada]">
                      {summary.totalDistributions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-red-500/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Calendar className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[#f5eada]/70">Average Royalty</p>
                    <p className="text-2xl font-bold text-[#f5eada]">
                      {summary.averageRoyalty} STT
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-lime-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-lime-500/20">
                    <Star className="h-5 w-5 text-lime-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[#f5eada]/70">
                      Top NFT Earnings
                    </p>
                    <p className="text-2xl font-bold text-[#f5eada]">
                      {summary.topNFT.earnings} STT
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Top NFT Card */}
        {summary && summary.topNFT.tokenId !== "0" && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-[#f5eada] flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-400" />
                  Top Earning NFT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-[#f5eada]/70">NFT</p>
                  <p className="font-mono text-[#f5eada]">
                    {summary.topNFT.name}
                  </p>
                  <p className="text-sm text-[#f5eada]/70">Total Earnings</p>
                  <p className="text-xl font-bold text-purple-400">
                    {summary.topNFT.earnings} STT
                  </p>
                  <p className="text-sm text-[#f5eada]/70">Token ID</p>
                  <p className="text-[#f5eada]">#{summary.topNFT.tokenId}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-[#f5eada] flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-[#f5eada]/70">
                    Recent Distributions
                  </p>
                  <p className="text-[#f5eada]">
                    {summary.recentDistributions.length}
                  </p>
                  {summary.recentDistributions.length > 0 && (
                    <>
                      <p className="text-sm text-[#f5eada]/70">Latest Amount</p>
                      <p className="text-xl font-bold text-yellow-400">
                        {summary.recentDistributions[0].amountFormatted} STT
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Royalty Distributions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            <CardHeader className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Crown className="h-5 w-5 text-lime-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#f5eada]">
                  Royalty Distributions
                </CardTitle>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterRecipient === "ALL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterRecipient("ALL")}
                    className="text-xs"
                  >
                    All Recipients
                  </Button>
                  {uniqueRecipients.slice(0, 5).map((recipient) => (
                    <Button
                      key={recipient.address}
                      variant={
                        filterRecipient === recipient.address
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setFilterRecipient(recipient.address)}
                      className="text-xs"
                    >
                      {recipient.name}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={refetch}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/40"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
                <div className="relative w-full md:w-80">
                  <Input
                    placeholder="Search distributions..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20 pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#f5eada]/40" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
                    <p className="text-sm text-[#f5eada]/60">
                      Loading royalty distributions...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <XCircle className="h-8 w-8 text-red-400" />
                    <p className="text-sm text-[#f5eada]/60">
                      Error loading distributions
                    </p>
                    <p className="text-xs text-[#f5eada]/40">{error}</p>
                    <Button onClick={refetch} size="sm" variant="outline">
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-[#f5eada]/70">
                      <tr className="border-b border-lime-500/20">
                        <th className="py-3 pr-4 font-medium">NFT</th>
                        <th className="py-3 pr-4 font-medium">Recipient</th>
                        <th className="py-3 pr-4 font-medium">Amount</th>
                        <th className="py-3 pr-4 font-medium">Percentage</th>
                        <th className="py-3 pr-4 font-medium">Sale Price</th>
                        <th className="py-3 pr-4 font-medium">Date</th>
                        <th className="py-3 pr-4 font-medium">Transaction</th>
                        <th className="py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((dist, index) => (
                        <motion.tr
                          key={dist.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="py-3 pr-4">
                            <div>
                              <div className="font-medium text-[#f5eada]">
                                {dist.nftName}
                              </div>
                              <div className="text-xs text-[#f5eada]/60">
                                Token ID: #{dist.tokenId}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div>
                              <div className="font-mono text-[#f5eada]">
                                {dist.recipientName}
                              </div>
                              <div className="text-xs text-[#f5eada]/60">
                                {shortenAddress(dist.recipientAddress)}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="text-[#f5eada] font-medium">
                              {dist.amountFormatted} STT
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              {dist.percentage.toFixed(2)}%
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada]/90">
                            {dist.salePrice && dist.salePrice !== "0" ? (
                              <div>
                                <div>
                                  {formatTransactionAmount(dist.salePrice, 18)}{" "}
                                  STT
                                </div>
                                {dist.totalRoyalty &&
                                  dist.totalRoyalty !== "0" && (
                                    <div className="text-xs text-yellow-400">
                                      Royalty:{" "}
                                      {formatTransactionAmount(
                                        dist.totalRoyalty,
                                        18
                                      )}{" "}
                                      STT
                                    </div>
                                  )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada]/90">
                            {formatTransactionDate(dist.timestamp)}
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada]/90 text-xs">
                            {shortenAddress(dist.transactionHash, 6)}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  copyToClipboard(dist.recipientAddress)
                                }
                                className="h-8 w-8 p-0"
                                title="Copy recipient address"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  window.open(
                                    `https://shannon-explorer.somnia.network/tx/${dist.transactionHash}`,
                                    "_blank"
                                  )
                                }
                                className="h-8 w-8 p-0"
                                title="View on explorer"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  {!filtered.length && !isLoading && (
                    <motion.div
                      className="py-12 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 rounded-full bg-lime-500/20">
                          <Search className="h-6 w-6 text-lime-400" />
                        </div>
                        <p className="text-sm text-[#f5eada]/60">
                          No royalty distributions found
                        </p>
                        <p className="text-xs text-[#f5eada]/40">
                          Try adjusting your search terms or filters
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
