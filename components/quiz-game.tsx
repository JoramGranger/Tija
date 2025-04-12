"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Clock, Home, Pause, Play, X } from "lucide-react"
import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useSound } from "@/hooks/use-sound"
import { type QuizQuestion, fetchQuizQuestions } from "@/lib/quiz-utils"
import { useWindowSize } from "@/hooks/use-window-size"
import { ScoreDisplay } from "./score-display"
import { GameBackground } from "./game-background"
import { ThemeToggle } from "@/components/theme-toggle"

export default function QuizGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { width, height } = useWindowSize()
  const { playButtonClick, playCorrect, playIncorrect, playSuccess } = useSound()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get quiz parameters from URL
  const mode = searchParams.get("mode") || "single"
  const difficulty = searchParams.get("difficulty") || "medium"
  const topic = searchParams.get("topic") || ""
  const topicsParam = searchParams.get("topics") || ""
  const topics = topicsParam ? topicsParam.split(",") : []

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [quizComplete, setQuizComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize quiz - now using AI-generated questions
  useEffect(() => {
    const loadQuizQuestions = async () => {
      try {
        setIsLoading(true)
        
        // Determine which topics to use
        const topicsToUse = mode === "single" ? [topic] : topics
        
        // Fetch questions from the API
        const fetchedQuestions = await fetchQuizQuestions(
          topicsToUse, 
          difficulty,
          10 // Number of questions
        )
        
        if (fetchedQuestions.length === 0) {
          throw new Error("No questions could be generated. Please try a different topic.")
        }
        
        setQuestions(fetchedQuestions)
        setError(null)
      } catch (err) {
        console.error("Error loading questions:", err)
        setError(err instanceof Error ? err.message : "Failed to load questions")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadQuizQuestions()
  }, [mode, difficulty, topic, topics])

  // Timer logic
  useEffect(() => {
    if (!isTimerActive || isLoading || quizComplete || isPaused) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAnswer(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerActive, isLoading, quizComplete, isPaused])

  const handleAnswer = (answer: string | null) => {
    if (selectedAnswer !== null || isTransitioning || isPaused) return

    const currentQuestion = questions[currentQuestionIndex]
    const correct = answer === currentQuestion.correctAnswer

    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setIsTimerActive(false)

    if (correct) {
      if (isMounted) playCorrect()
      setScore((prev) => prev + 1)
      setStreak((prev) => prev + 1)
      setShowConfetti(true)
      setScoreAnimation(true)

      // Hide confetti after 2 seconds
      setTimeout(() => {
        setShowConfetti(false)
      }, 2000)

      // Reset score animation
      setTimeout(() => {
        setScoreAnimation(false)
      }, 1000)
    } else {
      if (isMounted) playIncorrect()
      setStreak(0)
    }

    // Move to next question after delay
    setTimeout(() => {
      setIsTransitioning(true)

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1)
          setSelectedAnswer(null)
          setIsCorrect(null)
          setTimeLeft(30)
          setIsTimerActive(true)
        } else {
          setQuizComplete(true)
          if (isMounted) playSuccess()
        }
        setIsTransitioning(false)
      }, 500)
    }, 1500)
  }

  const togglePause = () => {
    if (isMounted) playButtonClick()
    setIsPaused(!isPaused)
  }

  const handleRestart = () => {
    if (isMounted) playButtonClick()
    router.push("/")
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
        <GameBackground />
        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <Button 
            onClick={handleRestart}
            className="w-full h-12"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
        <GameBackground />
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Generating your AI quiz...</p>
        <p className="mt-2 text-sm text-muted-foreground">This may take a moment</p>
      </div>
    )
  }

  // Quiz completed state
  if (quizComplete) {
    return (
      <div className="flex min-h-screen flex-col p-4 relative overflow-hidden">
        <GameBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col items-center justify-center relative z-10"
        >
          <div className="w-full max-w-md text-center">
            <h1 className="text-3xl font-bold mb-2 text-primary">Quiz Complete!</h1>
            <p className="text-xl mb-6">
              Your score: {score} / {questions.length}
            </p>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
              <h2 className="text-2xl font-bold mb-4">Results</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <div className="relative h-8 mt-1">
                    <div className="absolute inset-0 bg-muted rounded-full"></div>
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((score / questions.length) * 100)}%` }}
                      transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-bold text-primary-foreground">
                        {Math.round((score / questions.length) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                  <div className="flex items-center justify-center mt-1">
                    <div className="flex">
                      {Array.from({ length: streak }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="w-8 h-8 mx-1 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold"
                        >
                          🔥
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRestart}
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
        <GameBackground />
        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-6">We couldn't generate questions for this topic. Please try a different topic.</p>
          <Button 
            onClick={handleRestart}
            className="w-full h-12"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="flex min-h-screen flex-col p-4 relative overflow-hidden">
      <GameBackground />

      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-xl p-6 shadow-lg w-full max-w-sm text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
              <p className="mb-6 text-muted-foreground">Take a breather! Your time is paused.</p>
              <div className="space-y-3">
                <Button onClick={togglePause} className="w-full h-12 bg-primary">
                  <Play className="mr-2 h-4 w-4" />
                  Resume Quiz
                </Button>
                <Button variant="outline" onClick={handleRestart} className="w-full h-12">
                  <X className="mr-2 h-4 w-4" />
                  Quit Quiz
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="bg-card/30 backdrop-blur-sm hover:bg-card/50"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Button>

        <div className="flex items-center space-x-2">
          <ThemeToggle />

          <div className="flex items-center bg-card/30 backdrop-blur-sm px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className={`font-mono ${timeLeft < 10 ? "text-red-500" : ""}`}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="mb-4 relative z-10">
        <div className="flex justify-between text-sm mb-1">
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
      </div>

      {streak >= 2 && (
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2 mb-4 flex items-center justify-center relative z-10 backdrop-blur-sm">
          <span className="text-amber-500 font-medium">🔥 {streak} Correct in a Row!</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={`flex-1 flex flex-col ${isTransitioning ? "opacity-0" : ""} relative z-10`}
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-2">{currentQuestion.question}</h2>
            <p className="text-sm text-muted-foreground">
              Topic: {currentQuestion.topic} • Difficulty: {difficulty}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => {
              let buttonVariant = "outline"
              let extraClasses = "bg-card/50 backdrop-blur-sm border-2"

              if (selectedAnswer !== null) {
                if (option === currentQuestion.correctAnswer) {
                  buttonVariant = "default"
                  extraClasses = "bg-green-500/90 hover:bg-green-500/90 text-white border-green-500"
                } else if (option === selectedAnswer) {
                  buttonVariant = "default"
                  extraClasses = "bg-red-500/90 hover:bg-red-500/90 text-white border-red-500"
                }
              }

              return (
                <motion.div
                  key={option}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                >
                  <Button
                    variant={buttonVariant as any}
                    className={`w-full h-14 text-left justify-start text-lg ${extraClasses}`}
                    onClick={() => {
                      if (selectedAnswer === null && !isPaused) {
                        if (isMounted) playButtonClick()
                        handleAnswer(option)
                      }
                    }}
                    disabled={selectedAnswer !== null || isPaused}
                  >
                    {option}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          <div className="space-y-3">
            <ScoreDisplay score={score} totalQuestions={questions.length} animate={scoreAnimation} />

            <Button
              variant="outline"
              onClick={togglePause}
              className="w-full h-12 bg-card/50 backdrop-blur-sm border-2 flex items-center justify-center gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="h-5 w-5" />
                  Resume Quiz
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5" />
                  Pause Quiz
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}