import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Create a model instance with the appropriate model name
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" }); 