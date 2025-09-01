"use client"

import { AppShell } from "../../components/app-shell"
import { streams } from "../../lib/mock-data"
import { StreamCard } from "../../components/streams/stream-card"

export default function StreamsPage() {
  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {streams.map((s) => (
          <StreamCard key={s.id} stream={s} />
        ))}
      </div>
    </AppShell>
  )
}
