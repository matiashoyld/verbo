import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileState, GoogleAIFileManager } from "@google/generative-ai/server";
import { createVideoAnalysisPrompt } from "~/lib/prompts/videoAnalysis";
import { VideoAnalysisResult } from "~/types/prompts";

// Check if we're running on the server
const isServer = typeof window === 'undefined';

/**
 * Analyzes a video recording of a candidate's response using Gemini AI
 * 
 * Note: For this MVP version, we're actually not sending the video to the API 
 * due to API limitations. Instead, we're generating an analysis based only on the question
 * and context. In a production version, proper video analysis would be implemented.
 * 
 * @param videoBlob The video recording to analyze
 * @param question The question the candidate is answering
 * @param context The context of the technical case (optional)
 * @param questionContext The context specific to the question (optional)
 * @param competencies The competencies to assess (optional)
 */
export async function analyzeVideoResponse(
  videoBlob: Blob,
  question: string,
  context: string | null,
  questionContext: string | null = null,
  competencies: Array<{
    id: string;
    name: string;
    description: string | null;
    rubric: Array<{
      level: number;
      description: string;
    }>;
  }> = []
): Promise<VideoAnalysisResult> {
  // Make sure this function only runs on the server
  if (!isServer) {
    throw new Error('analyzeVideoResponse can only be called from server-side code');
  }

  try {
    console.log(`Processing video for analysis, size: ${(videoBlob.size / 1024 / 1024).toFixed(2)}MB`);

    // Initialize the API clients
    const apiKey = process.env.GOOGLE_AI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);
    
    // Convert blob to buffer 
    const arrayBuffer = await videoBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log("Uploading video to Gemini API using FormData...");
    
    // Create FormData for direct upload
    const formData = new FormData();
    const metadata = { 
      file: { 
        mimeType: videoBlob.type || "video/webm", 
        displayName: `candidate_recording_${Date.now()}.webm` 
      } 
    };
    
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", new Blob([buffer], { type: videoBlob.type || "video/webm" }));
    
    // Direct API call to upload the file
    const uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=multipart&key=${apiKey}`,
      { method: "POST", body: formData }
    );
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status ${uploadResponse.status}: ${await uploadResponse.text()}`);
    }
    
    const uploadResult = await uploadResponse.json();
    const file = uploadResult.file;
    console.log(`Uploaded file as: ${file.name}`);
    
    // Wait for file processing
    console.log("Waiting for file processing...");
    let videoFile = await fileManager.getFile(file.name);
    
    // Poll for the file processing status
    while (videoFile.state === FileState.PROCESSING) {
      process.stdout.write(".");
      // Wait for 5 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000));
      // Check status again
      videoFile = await fileManager.getFile(file.name);
    }
    
    // Check if processing failed
    if (videoFile.state !== FileState.ACTIVE) {
      throw new Error(`File processing failed. State: ${videoFile.state}`);
    }
    
    console.log("\nFile processing complete. Starting analysis...");
    
    // Create a model instance with the appropriate model name
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-thinking-exp-01-21",
      generationConfig: {
        temperature: 0.2, // Lower temperature for more factual responses
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 65536,
      }
    });
    
    // Generate the analysis prompt
    const analysisPrompt = createVideoAnalysisPrompt(question, context, questionContext, competencies);
    
    // Log the prompt for debugging
    console.log("==== ANALYSIS PROMPT ====");
    console.log(analysisPrompt);
    console.log("========================");
    
    // Start a chat session
    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri,
              }
            }
          ]
        },
        {
          role: "user",
          parts: [
            { text: analysisPrompt }
          ]
        }
      ]
    });
    
    // Get the response
    const result = await chatSession.sendMessage("Based on the video recording and the question provided, please analyze the candidate's response using the format specified in the previous message.");
    const text = result.response.text();
    
    // Log the response for debugging
    console.log("==== RAW RESPONSE ====");
    console.log(text);
    console.log("=====================");
    
    // Clean up the uploaded file
    try {
      await fileManager.deleteFile(file.name);
      console.log(`Removed uploaded file: ${file.name}`);
    } catch (e) {
      console.warn(`Failed to remove uploaded file: ${file.name}`, e);
    }
    
    // Find and extract the JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract analysis results. Response format not recognized.");
    }
    
    const jsonString = jsonMatch[0];
    
    // Log the extracted JSON for debugging
    console.log("==== EXTRACTED JSON ====");
    console.log(jsonString);
    console.log("======================");
    
    // Parse the response
    const parsedResponse = JSON.parse(jsonString) as VideoAnalysisResult;
    
    // Ensure competency_assessments is always an array
    if (!parsedResponse.competency_assessments) {
      console.warn("competency_assessments missing in response, adding empty array");
      parsedResponse.competency_assessments = [];
    }
    
    console.log("Analysis completed successfully.");
    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing video:", error);
    
    // Return a graceful fallback if analysis fails
    return {
      overall_assessment: "Unable to analyze the video. The analysis service encountered an error.",
      strengths: ["Recording was processed successfully"],
      areas_for_improvement: ["Technical issue with the video analysis service"],
      competency_assessments: []
    };
  }
} 