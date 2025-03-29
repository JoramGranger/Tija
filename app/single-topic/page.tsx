import type { Metadata } from "next"
import SingleTopicForm from "@/components/single-topic-form"

export const metadata: Metadata = {
  title: "Single Topic | Tija",
  description: "Choose a single topic for your trivia questions",
}

export default function SingleTopicPage() {
  return <SingleTopicForm />
}

