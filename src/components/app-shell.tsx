"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { WalletConnect } from "./wallet/wallet-connect";
import { NetworkSwitcher } from "./wallet/network-switcher";
import { NetworkGuard } from "./wallet/network-guard";
import { STTTokenBalance } from "./wallet/stt-token-balance";
import { Menu } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/mint", label: "Mint NFT" },
  { href: "/streams", label: "My Streams" },
  // { href: "/royalty-dashboard", label: "Royalty Dashboard" },
  { href: "/history", label: "History" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-lime-500/20 bg-transparent backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="h-5 w-5 text-[#f5eada] hover:text-lime-400 transition-colors" />
            </button>
            <Link href="/dashboard" className="group flex items-center gap-2">
              <span className="font-bold tracking-wide text-lg bg-[#f5eada] bg-clip-text text-transparent">
                Somnia in Streams
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <STTTokenBalance />
            <NetworkSwitcher />
            <WalletConnect />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside
          className={cn(
            "border-r border-lime-500/20 bg-transparent p-6 backdrop-blur-sm",
            "fixed inset-y-0 left-0 z-20 w-64 -translate-x-full transform transition md:static md:translate-x-0",
            open && "translate-x-0"
          )}
        >
          <nav className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative rounded-xl px-4 py-3 text-sm text-[#f5eada]/80 hover:bg-gradient-to-r hover:from-lime-500/10 hover:to-cyan-500/10 hover:text-[#f5eada] transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/10"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-lime-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="font-medium">{l.label}</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lime-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </nav>

          {/* Decorative element */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-lime-500/10 to-cyan-500/10 border border-lime-500/20">
            <div className="text-xs text-[#f5eada]/60 mb-2">Live Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-[#f5eada]/80">
                All systems operational
              </span>
            </div>
          </div>
        </aside>

        <main className="relative z-10 min-h-[calc(100dvh-56px)] p-4 md:p-6">
          <NetworkGuard>{children}</NetworkGuard>
        </main>
      </div>
    </div>
  );
}
