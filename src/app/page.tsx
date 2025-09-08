"use client"

import Link from "next/link"
import { Button } from "../components/ui/button"
import { motion } from "framer-motion"
import { CombinedBackground } from "@/components/combined-background"
import { WalletConnect } from "@/components/wallet/wallet-connect"
import { NetworkSwitcher } from "@/components/wallet/network-switcher"

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh">
      <div className="absolute inset-0 z-0">
        <CombinedBackground />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-lime-500/20 bg-transparent backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            {/* <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
              <Menu className="h-5 w-5 text-[#f5eada] hover:text-lime-400 transition-colors" />
            </button> */}
            <Link href="/dashboard" className="group flex items-center gap-2">
             
              <span className="font-bold tracking-wide text-lg bg-[#f5eada] bg-clip-text text-transparent">
                Somnia in Streams
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <NetworkSwitcher />
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="flex flex-col items-start gap-8 py-12">
          {/* Animated Hero Heading */}
          <motion.h1
            className="max-w-3xl text-pretty text-5xl font-bold leading-tight md:text-6xl text-[#f5eada]"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Stream NFT royalties in real-time with <span className="text-lime-400">Somnia in Streams</span>
          </motion.h1>

          {/* Animated Subtext */}
          <motion.p
            className="max-w-xl text-lg text-[#f5eada]/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Empower creators, DAOs, and collaborators to mint NFTs, stream royalties live, and track payouts with a sleek dApp built for the future.
          </motion.p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Link href="/dashboard">
              <Button className="relative overflow-hidden bg-black/40 border-2 border-lime-500/40 text-[#f5eada] hover:bg-lime-500/20 hover:border-lime-500/60 shadow-lg hover:shadow-lime-500/30 transition-all duration-300 backdrop-blur-xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  <span className="font-medium">Launch App</span>
                </div>
              </Button>
            </Link>

            <a href="#learn">
              <Button variant="outline" className="border-lime-500/40 text-[#f5eada] hover:bg-lime-500/20 hover:border-lime-500/60 bg-transparent backdrop-blur-xl transition-all duration-300">
                Learn More
              </Button>
            </a>
          </div>
        </section>

        {/* Features */}
        <section id="learn" className="grid grid-cols-1 gap-6 md:grid-cols-3 pt-12 pb-16">
          {[
            { title: "Mint", desc: "Create NFTs with flexible royalty splits for multiple recipients." },
            { title: "Stream", desc: "Simulated live royalty flows displayed with animated charts." },
            { title: "Track", desc: "Monitor balances, payouts, and transaction history in one dashboard." },
          ].map((f, index) => (
            <motion.div
              key={f.title}
              className="rounded-lg border border-[#26262b] bg-black/40 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-black/30 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(102, 255, 102, 0.5)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="mb-3 text-xl font-semibold text-[#f5eada]">{f.title}</h3>
              <p className="text-sm text-[#f5eada]/80">{f.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333] py-6 text-center text-xs text-[#f5eada]/60">
        © {new Date().getFullYear()} Somnia in Streams. All rights reserved.
      </footer>
    </div>
  )
}
