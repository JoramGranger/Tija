"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSound } from "@/hooks/use-sound"
import { ThemeToggle } from "@/components/theme-toggle"
import { GameBackground } from "./game-background"

// Mock topics - in a real app, these would come from an API
const AVAILABLE_TOPICS = [
  { id: "1", name: "Science" },
  { id: "2", name: "History" },
  { id: "3", name: "Geography" },
  { id: "4", name: "Movies" },
  { id: "5", name: "Music" },
  { id: "6", name: "Sports" },
  { id: "7", name: "Technology" },
  { id: "8", name: "Art" },
  { id: "9", name: "Literature" },
  { id: "10", name: "Food & Drink" },
]

export default function MultipleTopicSelector() {
  const router = useRouter()
  const { playButtonClick, playSuccess } = useSound()
  const [topics, setTopics] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState("medium")
  const [isLoading, setIsLoading] = useState(false)
  const [showTopics, setShowTopics] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleFetchTopics = () => {
    setIsLoading(true)
    setTopics([]) // Reset selected topics when fetching again
    if (isMounted) playButtonClick()

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowTopics(true)
      if (isMounted) playSuccess()
    }, 1000)
  }

  const handleTopicToggle = (topicId: string) => {
    if (isMounted) playButtonClick()
    setTopics((prev) => (prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]))
  }

  const handleSubmit = () => {
    if (topics.length === 0) return

    setIsSubmitting(true)
    if (isMounted) playButtonClick()

    // In a real app, we would validate and process the selected topics
    setTimeout(() => {
      const selectedTopics = topics.map((id) => AVAILABLE_TOPICS.find((topic) => topic.id === id)?.name).join(",")

      router.push(`/quiz?topics=${encodeURIComponent(selectedTopics)}&difficulty=${difficulty}&mode=multiple`)
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
          <h1 className="text-3xl font-bold mb-2 text-center text-primary">Tija</h1>
          <p className="text-center text-muted-foreground mb-6">Select multiple topics for your quiz</p>

          <motion.div
            className="space-y-6 bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-lg"
            animate={isSubmitting ? { x: "100vw" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {!showTopics ? (
              <Button
                onClick={handleFetchTopics}
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Fetching Topics...
                  </>
                ) : (
                  "Fetch Topics"
                )}
              </Button>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Select Topics (Choose at least one)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFetchTopics}
                      disabled={isLoading}
                      className="flex items-center gap-1 bg-card/50"
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Fetch Again
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence>
                      {AVAILABLE_TOPICS.map((topic, index) => (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            type="button"
                            variant={topics.includes(topic.id) ? "default" : "outline"}
                            onClick={() => handleTopicToggle(topic.id)}
                            className={`w-full h-16 justify-start text-left relative ${
                              topics.includes(topic.id) ? "bg-primary text-primary-foreground" : ""
                            }`}
                          >
                            {topic.name}
                            {topics.includes(topic.id) && <Check className="h-4 w-4 absolute right-3" />}
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
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
                            layoutId="activeMultiDifficulty"
                            className="absolute bottom-1 h-1 w-5 bg-primary rounded-full"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={topics.length === 0}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  Start Quiz
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

