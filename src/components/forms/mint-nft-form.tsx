"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Upload, Plus, Trash2, Sparkles, Users, Image as ImageIcon } from "lucide-react"

type Split = { handle: string; percent: number }

export function MintNftForm() {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [splits, setSplits] = useState<Split[]>([
    { handle: "@Artist", percent: 70 },
    { handle: "@DAO", percent: 30 },
  ])
  const [image, setImage] = useState<File | null>(null)

  const addSplit = () => setSplits((s) => [...s, { handle: "", percent: 0 }])
  const removeSplit = (i: number) => setSplits((s) => s.filter((_, idx) => idx !== i))
  const updateSplit = (i: number, patch: Partial<Split>) =>
    setSplits((s) => s.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Mint NFT (placeholder)\n\n" + JSON.stringify({ name, desc, splits, image: image?.name }, null, 2))
  }

  const totalPercent = splits.reduce((a, b) => a + (Number(b.percent) || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="relative overflow-hidden border-2 border-lime-500/20 bg-gradient-to-br from-lime-500/10 via-cyan-500/5 to-orange-500/10 backdrop-blur-xl text-[#f5eada] shadow-2xl">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
        </div>

        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-lime-500/20">
              <Sparkles className="h-6 w-6 text-lime-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#f5eada]">Mint New NFT</CardTitle>
          </div>
          <p className="text-[#f5eada]/70">Create your NFT with flexible royalty splits and start earning from streams</p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="relative z-10 space-y-6">
            {/* NFT Basic Info */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid gap-3">
                <Label htmlFor="nft-name" className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  NFT Name
                </Label>
                <Input
                  id="nft-name"
                  placeholder="e.g., Track #12"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20"
                  required
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="nft-desc" className="text-sm font-medium text-[#f5eada]/90">Description</Label>
                <Textarea
                  id="nft-desc"
                  placeholder="Describe your NFT and its unique value..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20"
                  rows={4}
                />
              </div>
            </motion.div>

            {/* Image Upload */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="nft-image" className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Upload Image
              </Label>
              <div className="relative">
                <Input
                  id="nft-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                />
                <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#f5eada]/40" />
              </div>
              {image && (
                <motion.div 
                  className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-sm text-green-400">Selected: {image.name}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Royalty Splits */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[#f5eada]/90 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Royalty Splits
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="border-lime-500/30 text-[#f5eada] bg-lime-500/10 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-300"
                  onClick={addSplit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add recipient
                </Button>
              </div>
              
              <div className="space-y-3">
                {splits.map((s, i) => (
                  <motion.div 
                    key={i} 
                    className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_100px] p-4 rounded-lg bg-black/20 border border-lime-500/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Input
                      placeholder="@handle"
                      value={s.handle}
                      onChange={(e) => updateSplit(i, { handle: e.target.value })}
                      className="bg-black/40 border-lime-500/20 text-[#f5eada] placeholder:text-[#f5eada]/40 focus:border-lime-500/40 focus:ring-lime-500/20"
                      required
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      placeholder="%"
                      value={s.percent}
                      onChange={(e) => updateSplit(i, { percent: Number(e.target.value) })}
                      className="bg-black/40 border-lime-500/20 text-[#f5eada] focus:border-lime-500/40 focus:ring-lime-500/20"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                      onClick={() => removeSplit(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-lime-500/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-sm text-[#f5eada]/70">Total Percentage</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${totalPercent === 100 ? 'text-green-400' : totalPercent > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {totalPercent}%
                  </span>
                  {totalPercent === 100 && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
                </div>
              </motion.div>
            </motion.div>
          </CardContent>

          <CardFooter className="relative z-10 flex justify-end pt-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit"
                className="bg-gradient-to-r from-lime-500 to-cyan-500 text-white hover:from-lime-600 hover:to-cyan-600 shadow-lg hover:shadow-lime-500/25 transition-all duration-300 border-0 px-8 py-3"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Mint NFT
              </Button>
            </motion.div>
          </CardFooter>
        </form>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  )
}
