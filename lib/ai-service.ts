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
  topics: string | string[],  // Accept either a single string or an array of strings
  difficulty: string,
  numQuestions: number = 10
): Promise<QuizQuestion[]> {
  try {
    // Convert to array if it's a single string
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    // Use the first topic for generation or join them if needed
    const topicForPrompt = topicsArray.length === 1 
      ? topicsArray[0] 
      : topicsArray.join(", ");
    
    // Initialize the Google Generative AI with your API key
    const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });
    
    const prompt = `Generate ${numQuestions} trivia questions about ${topicForPrompt} with ${difficulty} difficulty. 
    
    For each question:
    1. Create a question
    2. Provide exactly 4 possible answers with one being correct
    3. Clearly mark the correct answer
    4. Mention the specific topic it relates to
    
    Return the content in JSON format with this structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The correct option text exactly as in options",
        "topic": "Specific topic from: ${topicsArray.join(", ")}"
      },
      ...more questions
    ]
    
    Make sure that:
    - IMPORTANT: Return ONLY valid JSON, no other text or explanations
    - Questions are challenging but fair for ${difficulty} difficulty
    - The correct answer is always included in the options array
    - Options are plausible but only one is correct
    - Question text ends with a question mark
    - No options contain the words "correct" or "incorrect"
    - Distribute questions evenly across all topics if multiple are provided`;

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
    
    // Improved JSON parsing logic
    let questions;
    
    try {
      // First try parsing the whole response directly
      questions = JSON.parse(text) as QuizQuestion[];
    } catch (e) {
      // If direct parsing fails, try extracting JSON with regex
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        console.error("Failed to extract JSON. Raw response:", text);
        throw new Error("Could not parse JSON from AI response");
      }
      
      try {
        questions = JSON.parse(jsonMatch[0]) as QuizQuestion[];
      } catch (e2) {
        console.error("Failed to parse extracted JSON:", jsonMatch[0]);
        throw new Error("Could not parse extracted JSON from AI response");
      }
    }
    
    // Ensure we have an array
    if (!Array.isArray(questions)) {
      console.error("Parsed result is not an array:", questions);
      throw new Error("AI response is not a valid question array");
    }
    
    // Validate questions
    const validatedQuestions = questions
      .map(q => validateQuestion(q, topicsArray))
      .filter(Boolean) as QuizQuestion[];
    
    if (validatedQuestions.length === 0) {
      throw new Error("No valid questions found in AI response");
    }
    
    return validatedQuestions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

/**
 * Validate a question to ensure it has the required format
 */
function validateQuestion(question: QuizQuestion, validTopics: string[]): QuizQuestion | null {
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
  
  // If multiple topics were provided, verify that the topic is valid
  if (validTopics.length > 1 && !validTopics.some(t => 
      question.topic.toLowerCase().includes(t.toLowerCase()))) {
    console.warn("Question topic doesn't match any of the requested topics", question);
    // Fix it by assigning one of the valid topics
    question.topic = validTopics[Math.floor(Math.random() * validTopics.length)];
  }
  
  return question;
}