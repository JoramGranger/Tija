import type { Metadata } from "next"
import QuizGame from "@/components/quiz-game"

export const metadata: Metadata = {
  title: "Quiz | Tija",
  description: "Test your knowledge with fun trivia questions",
}

export default function QuizPage() {
  return <QuizGame />
}

