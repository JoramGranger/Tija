import type { Metadata } from "next"
import LandingPage from "@/components/landing-page"

export const metadata: Metadata = {
  title: "Trivia Quest",
  description: "A fun and interactive trivia game with multiple modes",
}

export default function Home() {
  return <LandingPage />
}

