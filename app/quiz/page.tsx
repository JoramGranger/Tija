import { Suspense } from "react"
import type { Metadata } from "next"
import QuizGame from "@/components/quiz-game"

export const metadata: Metadata = {
  title: "Quiz | Tija",
  description: "Test your knowledge with fun trivia questions",
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizGame />
    </Suspense>
  )
}

// Simple loading component
function QuizLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">Loading your quiz...</p>
    </div>
  )
}