"use client"

import { AppShell } from "../../components/app-shell"
import { useMemo, useState } from "react"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { motion } from "framer-motion"
import { Search, History, TrendingUp, DollarSign, Users, Calendar, ExternalLink, Copy, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { useTransactionHistory } from "../../hooks/use-contracts"
import { shortenAddress, formatTransactionAmount, formatTransactionDate } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../hooks/use-toast"

export default function HistoryPage() {
  const [q, setQ] = useState("")
  const [filterType, setFilterType] = useState<string>("ALL")
  const { transactions, isLoading, error, refetch } = useTransactionHistory()
  const { toast } = useToast()

  const filtered = useMemo(() => {
    let filteredTransactions = transactions

    // Filter by search query
    if (q.trim()) {
      const searchTerm = q.trim().toLowerCase()
      filteredTransactions = filteredTransactions.filter((tx) => 
        tx.hash.toLowerCase().includes(searchTerm) ||
        tx.tokenId?.toLowerCase().includes(searchTerm) ||
        tx.type.toLowerCase().includes(searchTerm) ||
        shortenAddress(tx.from).toLowerCase().includes(searchTerm) ||
        shortenAddress(tx.to).toLowerCase().includes(searchTerm)
      )
    }

    // Filter by transaction type
    if (filterType !== "ALL") {
      filteredTransactions = filteredTransactions.filter((tx) => tx.type === filterType)
    }

    return filteredTransactions
  }, [transactions, q, filterType])

  const totalAmount = filtered.reduce((sum, tx) => {
    if (tx.token === 'STT' && tx.amount !== '0') {
      return sum + parseFloat(formatTransactionAmount(tx.amount, 18))
    }
    return sum
  }, 0)

  const mintCount = filtered.filter(tx => tx.type === 'NFT_MINT').length
  const saleCount = filtered.filter(tx => tx.type === 'NFT_SALE').length

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
      duration: 2000,
    })
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'NFT_MINT': return 'NFT Mint'
      case 'NFT_TRANSFER': return 'NFT Transfer'
      case 'NFT_SALE': return 'NFT Sale'
      case 'STT_TRANSFER': return 'STT Transfer'
      case 'ROYALTY_PAYMENT': return 'Royalty Payment'
      case 'CONTRACT_INTERACTION': return 'Contract Interaction'
      default: return type
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'NFT_MINT': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'NFT_TRANSFER': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'NFT_SALE': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'STT_TRANSFER': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'ROYALTY_PAYMENT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'CONTRACT_INTERACTION': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-400" />
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

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
                <History className="h-6 w-6 text-lime-400" />
              </div>
              <h1 className="text-3xl font-bold text-[#f5eada]">Distribution History</h1>
            </div>
            <p className="text-[#f5eada]/80 text-lg max-w-2xl">
              Track all your royalty distributions, streaming payments, and NFT sales across Somnia in Streams.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
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
                  <p className="text-sm text-[#f5eada]/70">Total STT Volume</p>
                  <p className="text-2xl font-bold text-[#f5eada]">{totalAmount.toFixed(2)} STT</p>
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
                  <p className="text-sm text-[#f5eada]/70">NFT Mints</p>
                  <p className="text-2xl font-bold text-[#f5eada]">{mintCount}</p>
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
                  <p className="text-sm text-[#f5eada]/70">NFT Sales</p>
                  <p className="text-2xl font-bold text-[#f5eada]">{saleCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-lime-500/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <Users className="h-5 w-5 text-lime-400" />
                </div>
                <div>
                  <p className="text-sm text-[#f5eada]/70">Total Transactions</p>
                  <p className="text-2xl font-bold text-[#f5eada]">{filtered.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
            </div>

            <CardHeader className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lime-500/20">
                  <History className="h-5 w-5 text-lime-400" />
                </div>
                <CardTitle className="text-xl font-bold text-[#f5eada]">Transaction History</CardTitle>
              </div>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="flex gap-2">
                  <Button
                    variant={filterType === "ALL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("ALL")}
                    className="text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterType === "NFT_MINT" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("NFT_MINT")}
                    className="text-xs"
                  >
                    Mints
                  </Button>
                  <Button
                    variant={filterType === "NFT_SALE" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("NFT_SALE")}
                    className="text-xs"
                  >
                    Sales
                  </Button>
                  <Button
                    variant={filterType === "STT_TRANSFER" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("STT_TRANSFER")}
                    className="text-xs"
                  >
                    Transfers
                  </Button>
                  <Button
                    variant={filterType === "ROYALTY_PAYMENT" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType("ROYALTY_PAYMENT")}
                    className="text-xs"
                  >
                    Royalties
                  </Button>
                </div>
                <div className="relative w-full md:w-80">
                  <Input
                    placeholder="Search transactions..."
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
                    <p className="text-sm text-[#f5eada]/60">Loading transaction history...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <XCircle className="h-8 w-8 text-red-400" />
                    <p className="text-sm text-[#f5eada]/60">Error loading transactions</p>
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
                        <th className="py-3 pr-4 font-medium">Type</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                        <th className="py-3 pr-4 font-medium">Token ID</th>
                        <th className="py-3 pr-4 font-medium">Amount</th>
                        <th className="py-3 pr-4 font-medium">From/To</th>
                        <th className="py-3 pr-4 font-medium">Date</th>
                        <th className="py-3 pr-4 font-medium">Hash</th>
                        <th className="py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((tx, index) => (
                        <motion.tr 
                          key={tx.id} 
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="py-3 pr-4">
                            <Badge className={`rounded-full px-3 py-1 text-xs font-medium border ${getTransactionTypeColor(tx.type)}`}>
                              {getTransactionTypeLabel(tx.type)}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(tx.status)}
                              <span className="text-xs">{tx.status}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada]/90 font-medium">
                            {tx.tokenId ? `#${tx.tokenId}` : '-'}
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada] font-medium">
                            {tx.amount !== '0' ? (
                              <div>
                                <div>{formatTransactionAmount(tx.amount, 18)} {tx.token}</div>
                                {tx.royaltyAmount && (
                                  <div className="text-xs text-yellow-400">
                                    Royalty: {formatTransactionAmount(tx.royaltyAmount, 18)} STT
                                  </div>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada]/90">
                            <div className="text-xs">
                              <div>From: {shortenAddress(tx.from)}</div>
                              <div>To: {shortenAddress(tx.to)}</div>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada]/90">
                            {formatTransactionDate(tx.timestamp)}
                          </td>
                          <td className="py-3 pr-4 text-[#f5eada]/90 text-xs">
                            {shortenAddress(tx.hash, 6)}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(tx.hash)}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(`https://explorer.somnia.network/tx/${tx.hash}`, '_blank')}
                                className="h-8 w-8 p-0"
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
                        <p className="text-sm text-[#f5eada]/60">No transactions found</p>
                        <p className="text-xs text-[#f5eada]/40">Try adjusting your search terms or filters</p>
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
  )
}
