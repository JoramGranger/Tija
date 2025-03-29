import type { Metadata } from "next"
import MultipleTopicSelector from "@/components/multiple-topic-selector"

export const metadata: Metadata = {
  title: "Multiple Topics | Tija",
  description: "Choose multiple topics for your trivia questions",
}

export default function MultipleTopicPage() {
  return <MultipleTopicSelector />
}

