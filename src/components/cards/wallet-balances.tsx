"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { walletBalances } from "@/lib/mock-data"
import { motion } from "framer-motion"
import { TrendingUp, Wallet, Users, Building2 } from "lucide-react"

const getIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case "creator":
      return <TrendingUp className="h-5 w-5" />
    case "dao":
      return <Building2 className="h-5 w-5" />
    case "collaborator":
      return <Users className="h-5 w-5" />
    default:
      return <Wallet className="h-5 w-5" />
  }
}

const getGradient = (label: string) => {
  switch (label.toLowerCase()) {
    case "creator":
      return "from-lime-500/20 via-cyan-500/10 to-yellow-500/20"
    case "dao":
      return "from-cyan-500/20 via-magenta-500/10 to-orange-500/20"
    case "collaborator":
      return "from-magenta-500/20 via-lime-500/10 to-cyan-500/20"
    default:
      return "from-gray-500/20 via-slate-500/10 to-zinc-500/20"
  }
}

const getBorderColor = (label: string) => {
  switch (label.toLowerCase()) {
    case "creator":
      return "border-lime-500/30"
    case "dao":
      return "border-cyan-500/30"
    case "collaborator":
      return "border-magenta-500/30"
    default:
      return "border-gray-500/30"
  }
}

const getIconColor = (label: string) => {
  switch (label.toLowerCase()) {
    case "creator":
      return "text-lime-400"
    case "dao":
      return "text-cyan-400"
    case "collaborator":
      return "text-magenta-400"
    default:
      return "text-gray-400"
  }
}


export function WalletBalances() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {walletBalances.map((b, index) => (
        <motion.div
          key={b.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className="group"
        >
          <Card className={`
            relative overflow-hidden border-2 ${getBorderColor(b.label)} 
            bg-gradient-to-br ${getGradient(b.label)}
            backdrop-blur-xl text-[#f5eada] shadow-2xl
            hover:shadow-${b.label.toLowerCase() === 'creator' ? 'lime' : b.label.toLowerCase() === 'dao' ? 'cyan' : 'magenta'}-500/20 
            transition-all duration-300 group
            before:absolute before:inset-0 before:bg-gradient-to-br 
            before:from-white/5 before:to-transparent before:opacity-0 
            hover:before:opacity-100 before:transition-opacity before:duration-300
          `}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
            </div>
            
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-black/20 ${getIconColor(b.label)}`}>
                    {getIcon(b.label)}
                  </div>
                  {b.label}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-0">
              <div className="space-y-2">
                <motion.p 
                  className="text-3xl font-bold text-[#f5eada] tracking-tight"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                >
                  {b.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </motion.p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#f5eada]/70 bg-black/20 px-2 py-1 rounded-full">
                    {b.unit}
                  </span>
                  <motion.div 
                    className={`text-xs ${getIconColor(b.label)} font-medium`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    +2.4%
                  </motion.div>
                </div>
              </div>
              
              {/* Enhanced progress bar */}
              <div className="mt-4 h-1.5 bg-black/20 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${
                    b.label.toLowerCase() === 'creator' 
                      ? 'bg-gradient-to-r from-lime-400 to-lime-500' 
                      : b.label.toLowerCase() === 'dao'
                      ? 'bg-gradient-to-r from-cyan-400 to-cyan-500'
                      : 'bg-gradient-to-r from-magenta-400 to-magenta-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((b.amount / 1000) * 100, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.6, duration: 1 }}
                />
              </div>
            </CardContent>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
