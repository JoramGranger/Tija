"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useSound } from "@/hooks/use-sound"
import { GameBackground } from "./game-background"

export default function LandingPage() {
  const router = useRouter()
  const { playButtonClick } = useSound()
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleModeSelect = (mode: "single" | "multiple") => {
    setIsAnimating(true)
    if (isMounted) playButtonClick()

    setTimeout(() => {
      router.push(`/${mode}-topic`)
    }, 500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      <GameBackground />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center mb-8 relative z-10"
      >
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-primary">Tija</h1>
        <p className="text-muted-foreground">Test your knowledge with fun trivia questions!</p>
      </motion.div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={isAnimating ? { x: "-100vw" } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button
            onClick={() => handleModeSelect("single")}
            className="w-full h-24 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
          >
            Single Topic
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={isAnimating ? { x: "100vw" } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button
            onClick={() => handleModeSelect("multiple")}
            className="w-full h-24 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
          >
            Multiple Topics
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

