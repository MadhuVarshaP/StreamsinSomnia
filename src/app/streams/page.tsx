"use client"

import { AppShell } from "../../components/app-shell"
import { MyStreams } from "../../components/streams/my-streams"
import { useRouter } from "next/navigation"

export default function StreamsPage() {
  const router = useRouter()

  const handleMintNew = () => {
    router.push('/mint')
  }

  return (
    <AppShell>
      <MyStreams 
        onMintNew={handleMintNew}
      />
    </AppShell>
  )
}
