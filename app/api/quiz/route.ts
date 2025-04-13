import { NextRequest, NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/ai-service";

// Get API key from environment variables
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { topics, difficulty, numQuestions = 10 } = body;

    // Validate request parameters
    if (!topics) {
      return NextResponse.json(
        { error: "Topics must be provided" },
        { status: 400 }
      );
    }

    // Handle both single string and array formats
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    
    // Validate that all topics are strings
    if (topicsArray.some(t => typeof t !== 'string')) {
      return NextResponse.json(
        { error: "All topics must be strings" },
        { status: 400 }
      );
    }

    if (!["easy", "medium", "complex"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be one of: easy, medium, complex" },
        { status: 400 }
      );
    }

    // Generate AI questions
    const questions = await generateQuizQuestions(
      GOOGLE_AI_API_KEY,
      topicsArray,
      difficulty,
      numQuestions
    );
    
    console.log(`Successfully generated ${questions.length} AI questions about ${topicsArray.join(', ')}`);

    // Return the questions
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error in quiz API:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz questions" },
      { status: 500 }
    );
  }
}