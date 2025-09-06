"use client"

import Link from "next/link"
import { Button } from "../components/ui/button"
import { AnimatedBackground } from "../components/animated-background"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh bg-gradient-to-br from-[#0b0b0d] via-[#1a0f1f] to-[#0f0a15] text-[#f5eada]">
      <AnimatedBackground />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="font-semibold">Somnia in Streams</div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button className="relative overflow-hidden bg-black/40 border-2 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50 shadow-lg hover:shadow-lime-500/20 transition-all duration-300 backdrop-blur-xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <span className="font-medium">Connect Wallet</span>
                <div className="w-1 h-1 rounded-full bg-[#f5eada]/40 group-hover:bg-[#f5eada]/60 transition-colors duration-300" />
              </div>
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <section className="flex flex-col items-start gap-6 py-10 md:py-16">
          <motion.h1
            className="max-w-2xl text-pretty text-4xl font-semibold leading-tight md:text-5xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Stream NFT royalties in real-time on Somnia in Streams
          </motion.h1>
          <motion.p
            className="max-w-xl text-base text-[#f5eada]/80"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            A futuristic, minimal dApp UI for creators, collaborators, and DAOs to mint, stream, and track royalty flows
            — powered by clean design and mock data for now.
          </motion.p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button className="relative overflow-hidden bg-black/40 border-2 border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50 shadow-lg hover:shadow-lime-500/20 transition-all duration-300 backdrop-blur-xl group">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  <span className="font-medium">Launch App</span>
                  <div className="w-1 h-1 rounded-full bg-[#f5eada]/40 group-hover:bg-[#f5eada]/60 transition-colors duration-300" />
                </div>
              </Button>
            </Link>
            <a href="#learn">
              <Button variant="outline" className="border-lime-500/30 text-[#f5eada] hover:bg-lime-500/10 hover:border-lime-500/50 bg-transparent backdrop-blur-xl transition-all duration-300">
                Learn More
              </Button>
            </a>
          </div>
        </section>

        <section id="learn" className="grid grid-cols-1 gap-4 pb-16 md:grid-cols-3">
          {[
            { title: "Mint", desc: "Create NFTs with flexible, multi-recipient royalty splits." },
            { title: "Stream", desc: "Simulated live royalty flows with animated charts and progress." },
            { title: "Track", desc: "Clean dashboards for balances, payouts, and history." },
          ].map((f) => (
            <motion.div
              key={f.title}
              className="rounded-lg border border-[#26262b] bg-black/30 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-black/20"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-2 text-lg font-medium text-[#f5eada]">{f.title}</h3>
              <p className="text-sm text-[#f5eada]/80">{f.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="border-t border-[#26262b] py-6 text-center text-xs text-[#f5eada]/60">
        © {new Date().getFullYear()} Somnia in Streams. UI only — mock data.
      </footer>
    </div>
  )
}
