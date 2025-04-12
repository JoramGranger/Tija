import { GoogleGenAI } from "@google/genai";
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Define our quiz question type
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
}

/**
 * Generate quiz questions using Google's Generative AI SDK
 */
export async function generateQuizQuestions(
  apiKey: string,
  topic: string,
  difficulty: string,
  numQuestions: number = 10
): Promise<QuizQuestion[]> {
  try {
    // Initialize the Google Generative AI with your API key
    const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });
    
    const prompt = `Generate ${numQuestions} trivia questions about ${topic} with ${difficulty} difficulty. 
    
    For each question:
    1. Create a question
    2. Provide exactly 4 possible answers with one being correct
    3. Clearly mark the correct answer
    4. Mention the topic it relates to
    
    Return the content in JSON format with this structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The correct option text exactly as in options",
        "topic": "${topic}"
      },
      ...more questions
    ]
    
    Make sure that:
    - Questions are challenging but fair for ${difficulty} difficulty
    - The correct answer is always included in the options array
    - Options are plausible but only one is correct
    - Question text ends with a question mark
    - No options contain the words "correct" or "incorrect"`;

    // Generate content using the SDK
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 40,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI response text is undefined");
    }
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from AI response");
    }
    
    const jsonText = jsonMatch[0];
    const questions = JSON.parse(jsonText) as QuizQuestion[];
    
    // Validate questions
    return questions.map(q => validateQuestion(q)).filter(Boolean) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

/**
 * Validate a question to ensure it has the required format
 */
function validateQuestion(question: QuizQuestion): QuizQuestion | null {
  // Check if question has required fields
  if (!question.question || !question.options || !question.correctAnswer || !question.topic) {
    console.warn("Invalid question format", question);
    return null;
  }
  
  // Check if options array has at least 2 options
  if (!Array.isArray(question.options) || question.options.length < 2) {
    console.warn("Question has insufficient options", question);
    return null;
  }
  
  // Check if correct answer is in options
  if (!question.options.includes(question.correctAnswer)) {
    console.warn("Correct answer not found in options", question);
    return null;
  }
  
  return question;
}