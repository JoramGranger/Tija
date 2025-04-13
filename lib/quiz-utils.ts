import { QuizQuestion } from "./ai-service";

// Function to fetch questions from our API
export async function fetchQuizQuestions(
  topics: string[],  // Keep as array since that's how it's currently being used
  difficulty: string,
  numQuestions: number = 10
): Promise<QuizQuestion[]> {
  try {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topics,  // Send as 'topics' (plural) to match the updated API
        difficulty,
        numQuestions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch quiz questions");
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    // Fallback to mock questions if the API fails
    return generateMockQuestions(topics, difficulty);
  }
}

// Keep the mock question generator as a fallback
export function generateMockQuestions(
  topics: string[],
  difficulty: string
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Generate 10 mock questions
  for (let i = 0; i < 10; i++) {
    const topic = topics[i % topics.length];
    
    const question: QuizQuestion = {
      question: `Mock question ${i + 1} about ${topic}?`,
      options: [
        `Answer option A for question ${i + 1}`,
        `Answer option B for question ${i + 1}`,
        `Answer option C for question ${i + 1}`,
        `Answer option D for question ${i + 1}`,
      ],
      correctAnswer: `Answer option ${["A", "B", "C", "D"][i % 4]} for question ${i + 1}`,
      topic,
    };
    
    questions.push(question);
  }
  
  return questions;
}