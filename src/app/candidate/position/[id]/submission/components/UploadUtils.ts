import { useRouter } from "next/navigation";
import { VideoAnalysisResult } from "~/types/prompts";
import { processVideoBlob } from "./VideoOptimizer";

// Types for tRPC mutations
type GetUploadUrlMutation = (input: {
  questionId: string;
  positionId: string;
  contentType: string;
  extension: string;
}) => Promise<{
  signedUrl: string;
  filePath: string;
} | null>;

type SaveMetadataMutation = (input: {
  positionId: string;
  questionId: string;
  filePath: string;
  fileSize: number;
}) => Promise<{ success: boolean } | null>;

type SaveAnalysisMutation = (input: {
  positionId: string;
  questionId: string;
  overall_assessment: string;
  strengths: string[];
  areas_for_improvement: string[];
  competency_assessments?: Array<{
    competency_id: string;
    competency_name: string;
    level: number;
    rationale: string;
  }>;
}) => Promise<{ success: boolean } | null>;

// Add a new type for the analyzeVideo mutation
type AnalyzeVideoMutation = (input: {
  videoUrl: string;
  question: string;
  context: string | null;
  questionContext: string | null;
  positionId: string;
  questionId: string;
}) => Promise<VideoAnalysisResult | null>;

// Add a type for the recording data
type RecordingData = {
  id: string;
  questionId: string;
  recordingId?: string;
  url: string | null;
  filePath: string;
  fileSize: number | null;
  durationSeconds: number | null;
  createdAt: Date;
};

// Function to upload a recording to Supabase
export const uploadRecording = async (
  questionId: string,
  blob: Blob,
  positionId: string,
  getUploadUrlMutation: {
    mutateAsync: GetUploadUrlMutation;
  },
  saveMetadataMutation: {
    mutateAsync: SaveMetadataMutation;
  },
  questionRecordingIds: Record<string, string>,
): Promise<{ success: boolean; filePath?: string }> => {
  if (!blob || blob.size === 0) {
    console.warn(`No valid recording blob for question ${questionId}`);
    return { success: false };
  }

  try {
    // Use the appropriate recording ID for this question
    const recordingId = questionRecordingIds[questionId] || questionId;

    // Process the blob to optimize it before upload
    const optimizedBlob = await processVideoBlob(blob);
    
    // Log size reduction
    const compressionRatio = (1 - (optimizedBlob.size / blob.size)) * 100;
    console.log(`Recording size: ${(blob.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedBlob.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio.toFixed(1)}% reduction)`);

    // Get a signed upload URL
    const uploadUrlResult = await getUploadUrlMutation
      .mutateAsync({
        questionId: recordingId, // Use unique recording ID
        positionId: positionId,
        contentType: optimizedBlob.type || "video/webm",
        extension: "webm",
      })
      .catch((error) => {
        console.error(`Error getting signed URL for ${questionId}:`, error);
        return null;
      });

    if (!uploadUrlResult?.signedUrl) {
      console.error(`Failed to get upload URL for ${questionId}`);
      return { success: false };
    }

    // Upload directly to Supabase
    const uploadResponse = await fetch(uploadUrlResult.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": optimizedBlob.type || "video/webm",
      },
      body: optimizedBlob, // Use the optimized blob
    }).catch((error) => {
      console.error(
        `Network error uploading to Supabase for ${questionId}:`,
        error,
      );
      return null;
    });

    if (!uploadResponse || !uploadResponse.ok) {
      console.error(`Error uploading to Supabase for ${questionId}`);
      return { success: false };
    }

    const filePath = uploadUrlResult.filePath;

    // Save metadata with the unique recording ID
    await saveMetadataMutation
      .mutateAsync({
        positionId: positionId,
        questionId: recordingId, // Use unique recording ID
        filePath: filePath,
        fileSize: optimizedBlob.size, // Use the optimized blob size
      })
      .catch((error) => {
        console.error(`Error saving metadata for ${questionId}:`, error);
        throw error; // Let the caller handle this
      });

    return { success: true, filePath };
  } catch (error) {
    console.error(
      `Error in uploadRecording for question ${questionId}:`,
      error,
    );
    return { success: false };
  }
};

// Function to process the extraction and analysis of recordings
export const simulateExtraction = async (
  questionRecordings: Record<string, Blob>,
  finalQuestionId: string | null,
  positionId: string,
  uploadRecordingFn: (questionId: string, blob: Blob) => Promise<{ success: boolean; filePath?: string }>,
  setExtractionProgress: React.Dispatch<React.SetStateAction<number>>,
  router: ReturnType<typeof useRouter>,
  position: {
    questions: Array<{
      id: string;
      question: string;
      context: string | null;
    }>;
    context: string | null;
  },
  saveAnalysisMutation?: {
    mutateAsync: SaveAnalysisMutation;
  },
  analyzeVideoMutation?: {
    mutateAsync: AnalyzeVideoMutation;
  },
) => {
  // Reset progress
  setExtractionProgress(0);

  try {
    // Create a list of promises to process each recording
    const totalRecordings = Object.keys(questionRecordings).length;
    let processedCount = 0;

    // Process recordings one by one to avoid overwhelming the server
    for (const [recordingId, blob] of Object.entries(questionRecordings)) {
      // If this is a unique recording ID (contains underscore), extract the original question ID
      const originalQuestionId = recordingId.includes("_")
        ? recordingId.split("_")[0]
        : recordingId;

      // Skip the final question if we already uploaded it directly
      if (originalQuestionId === finalQuestionId && finalQuestionId !== null) {
        processedCount++;
        setExtractionProgress((processedCount / totalRecordings) * 100);
        continue;
      }

      // Make sure we have a valid question ID
      if (!originalQuestionId) {
        processedCount++;
        setExtractionProgress((processedCount / totalRecordings) * 100);
        continue;
      }

      // Find the question details
      const questionData = position.questions.find(q => q.id === originalQuestionId);
      
      if (!questionData) {
        console.warn(`Question data not found for ID: ${originalQuestionId}`);
        processedCount++;
        setExtractionProgress((processedCount / totalRecordings) * 100);
        continue;
      }

      try {
        // Update progress to show we're starting this question
        setExtractionProgress(((processedCount + 0.1) / totalRecordings) * 100);
        
        // FIRST: Upload the recording to Supabase
        console.log(`Uploading recording for question ${originalQuestionId}...`);
        const uploadResult = await uploadRecordingFn(originalQuestionId, blob);
        console.log(`Upload completed for question ${originalQuestionId}: ${uploadResult.success ? 'Success' : 'Failed'}${uploadResult.filePath ? `, Path: ${uploadResult.filePath.substring(0, 20)}...` : ''}`);
        
        // Update progress after upload
        setExtractionProgress(((processedCount + 0.3) / totalRecordings) * 100);
        
        // Analyze the video with Gemini if uploadResult was successful, includes a filePath, and analysis mutations are available
        let analysisResult: VideoAnalysisResult | null = null;
        
        if (uploadResult.success && uploadResult.filePath && analyzeVideoMutation && saveAnalysisMutation) {
          try {
            console.log(`Starting AI analysis for question: ${questionData.question}`);
            
            // Wait a moment to ensure the metadata has been saved in the database
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Use the filePath directly from the upload result
            console.log(`Using direct file path from upload: ${uploadResult.filePath.substring(0, 30)}...`);
            
            // Call the tRPC procedure to analyze the video
            analysisResult = await analyzeVideoMutation.mutateAsync({
              videoUrl: uploadResult.filePath, // Use the file path from the upload result
              question: questionData.question,
              context: position.context,
              questionContext: questionData.context,
              positionId: positionId,
              questionId: originalQuestionId,
            });
            
            console.log(`AI analysis completed for question: ${originalQuestionId}`);
            
            // Update progress to show analysis is complete
            setExtractionProgress(((processedCount + 0.7) / totalRecordings) * 100);
            
            // Save the analysis results to the database
            if (analysisResult) {
              await saveAnalysisMutation.mutateAsync({
                positionId: positionId,
                questionId: originalQuestionId,
                overall_assessment: analysisResult.overall_assessment,
                strengths: analysisResult.strengths,
                areas_for_improvement: analysisResult.areas_for_improvement,
                competency_assessments: analysisResult.competency_assessments,
              });
            }
          } catch (error) {
            console.error("Error during video analysis:", error);
          }
        } else if (!uploadResult.filePath) {
          console.error(`No file path available for question ${originalQuestionId}`);
        }
        
        // Update progress to show the question is fully processed
        processedCount++;
        setExtractionProgress((processedCount / totalRecordings) * 100);
        
      } catch (error) {
        console.error(`Error processing question ${originalQuestionId}:`, error);
        // Continue with other recordings even if one fails
        processedCount++;
        setExtractionProgress((processedCount / totalRecordings) * 100);
      }
    }

    // Ensure progress is at 100% when complete
    setExtractionProgress(100);

    // After a short delay, redirect to results page
    setTimeout(() => {
      router.push(`/candidate/position/${positionId}/results`);
    }, 1500);
  } catch (error) {
    console.error("Error in extraction process:", error);
    setExtractionProgress(100); // Set to 100% to allow navigation
    setTimeout(() => {
      router.push(`/candidate/position/${positionId}/results`);
    }, 1500);
  }
}; 