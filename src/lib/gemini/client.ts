import { GoogleGenerativeAI } from "@google/generative-ai";

// Log the environment we're in - useful for debugging production vs development
const isProduction = process.env.NODE_ENV === 'production';
console.log(`[GEMINI CLIENT] Environment: ${isProduction ? 'Production' : 'Development'}`);

// Initialize the Google Generative AI with API key
const apiKey = process.env.GOOGLE_AI_API_KEY || "";
if (!apiKey) {
  console.error("[GEMINI CLIENT] Missing API key for Google Generative AI");
}

let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("[GEMINI CLIENT] Successfully initialized Google Generative AI client");
} catch (error) {
  console.error("[GEMINI CLIENT] Failed to initialize Google Generative AI client:", error);
  throw new Error(`Failed to initialize Gemini client: ${error instanceof Error ? error.message : String(error)}`);
}

// Create a model instance with the appropriate model name
const modelName = "gemini-2.0-flash-thinking-exp-01-21";
console.log(`[GEMINI CLIENT] Using model: ${modelName}`);

// Set up the generation config - optimized for Vercel serverless environments
const generationConfig = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
  // Don't set responseMimeType as it's not supported by gemini-2.0-flash-thinking-exp-01-21
};

// Create and export the model with config optimized for serverless environments
export const model = genAI.getGenerativeModel({ 
  model: modelName,
  generationConfig,
}); 