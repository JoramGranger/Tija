export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  topic: string
}

// Mock questions generator - in a real app, these would come from an API
export function generateMockQuestions(topics: string[], difficulty: string): QuizQuestion[] {
  const questions: QuizQuestion[] = []

  // Generate 2 questions per topic
  topics.forEach((topic) => {
    const topicQuestions = getMockQuestionsForTopic(topic, difficulty)
    questions.push(...topicQuestions)
  })

  // Limit to 10 questions max
  return questions.slice(0, 10)
}

function getMockQuestionsForTopic(topic: string, difficulty: string): QuizQuestion[] {
  // This is just mock data - in a real app, we would fetch from an API
  const mockQuestions: Record<string, QuizQuestion[]> = {
    Science: [
      {
        question: "What is the chemical symbol for gold?",
        options: ["Au", "Ag", "Fe", "Cu"],
        correctAnswer: "Au",
        topic: "Science",
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        topic: "Science",
      },
    ],
    History: [
      {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correctAnswer: "1945",
        topic: "History",
      },
      {
        question: "Who was the first President of the United States?",
        options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
        correctAnswer: "George Washington",
        topic: "History",
      },
    ],
    Geography: [
      {
        question: "What is the capital of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctAnswer: "Canberra",
        topic: "Geography",
      },
      {
        question: "Which is the longest river in the world?",
        options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
        correctAnswer: "Nile",
        topic: "Geography",
      },
    ],
    Movies: [
      {
        question: "Who directed the movie 'Inception'?",
        options: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Quentin Tarantino"],
        correctAnswer: "Christopher Nolan",
        topic: "Movies",
      },
      {
        question: "Which movie won the Best Picture Oscar in 2020?",
        options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
        correctAnswer: "Parasite",
        topic: "Movies",
      },
    ],
    Music: [
      {
        question: "Who is known as the 'King of Pop'?",
        options: ["Elvis Presley", "Michael Jackson", "Prince", "David Bowie"],
        correctAnswer: "Michael Jackson",
        topic: "Music",
      },
      {
        question: "Which band performed the song 'Bohemian Rhapsody'?",
        options: ["The Beatles", "Led Zeppelin", "Queen", "The Rolling Stones"],
        correctAnswer: "Queen",
        topic: "Music",
      },
    ],
  }

  // Default to Science if topic not found
  return mockQuestions[topic] || mockQuestions["Science"]
}

