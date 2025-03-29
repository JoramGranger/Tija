"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSound } from "@/hooks/use-sound"
import { ThemeToggle } from "@/components/theme-toggle"
import { GameBackground } from "./game-background"

export default function SingleTopicForm() {
  const router = useRouter()
  const { playButtonClick } = useSound()
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic) return

    setIsSubmitting(true)
    if (isMounted) playButtonClick()

    // In a real app, we would validate and process the form data
    setTimeout(() => {
      router.push(`/quiz?topic=${encodeURIComponent(topic)}&difficulty=${difficulty}&mode=single`)
    }, 600)
  }

  const handleBack = () => {
    if (isMounted) playButtonClick()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col p-4 relative overflow-hidden">
      <GameBackground />

      <div className="flex justify-between items-center mb-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="bg-card/30 backdrop-blur-sm hover:bg-card/50"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Button>

        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center relative z-10"
      >
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary">Choose Your Topic</h1>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6 bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-lg"
            animate={isSubmitting ? { x: "100vw" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="space-y-2">
              <Label htmlFor="topic">What topic interests you?</Label>
              <Input
                id="topic"
                placeholder="e.g., Science, History, Movies..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label>Select Difficulty</Label>
              <div className="grid grid-cols-3 gap-3">
                {["easy", "medium", "complex"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`
                      relative flex items-center justify-center h-14 rounded-xl border-2 transition-all
                      ${
                        difficulty === level
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-muted bg-background text-muted-foreground hover:bg-muted/10"
                      }
                    `}
                  >
                    <span className="capitalize">{level}</span>
                    {difficulty === level && (
                      <motion.div
                        layoutId="activeDifficulty"
                        className="absolute bottom-1 h-1 w-5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Generate Questions
            </Button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}

