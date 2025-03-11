import { useRouter } from "next/navigation";

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
}) => Promise<any>;

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
) => {
  if (!blob || blob.size === 0) {
    console.warn(`No valid recording blob for question ${questionId}`);
    return false;
  }

  try {
    // Use the appropriate recording ID for this question
    const recordingId = questionRecordingIds[questionId] || questionId;

    // Get a signed upload URL
    const uploadUrlResult = await getUploadUrlMutation
      .mutateAsync({
        questionId: recordingId, // Use unique recording ID
        positionId: positionId,
        contentType: blob.type || "video/webm",
        extension: "webm",
      })
      .catch((error) => {
        console.error(`Error getting signed URL for ${questionId}:`, error);
        return null;
      });

    if (!uploadUrlResult?.signedUrl) {
      console.error(`Failed to get upload URL for ${questionId}`);
      return false;
    }

    // Upload directly to Supabase
    const uploadResponse = await fetch(uploadUrlResult.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": blob.type || "video/webm",
      },
      body: blob,
    }).catch((error) => {
      console.error(
        `Network error uploading to Supabase for ${questionId}:`,
        error,
      );
      return null;
    });

    if (!uploadResponse || !uploadResponse.ok) {
      console.error(`Error uploading to Supabase for ${questionId}`);
      return false;
    }

    // Save metadata with the unique recording ID
    await saveMetadataMutation
      .mutateAsync({
        positionId: positionId,
        questionId: recordingId, // Use unique recording ID
        filePath: uploadUrlResult.filePath,
        fileSize: blob.size,
      })
      .catch((error) => {
        console.error(`Error saving metadata for ${questionId}:`, error);
        throw error; // Let the caller handle this
      });

    return true;
  } catch (error) {
    console.error(
      `Error in uploadRecording for question ${questionId}:`,
      error,
    );
    return false;
  }
};

// Function to simulate the extraction process
export const simulateExtraction = async (
  questionRecordings: Record<string, Blob>,
  finalQuestionId: string | null,
  positionId: string,
  uploadRecording: (questionId: string, blob: Blob) => Promise<boolean>,
  setExtractionProgress: React.Dispatch<React.SetStateAction<number>>,
  router: ReturnType<typeof useRouter>,
) => {
  // Reset progress
  setExtractionProgress(0);

  try {
    // Create a list of promises to upload each recording
    const uploadPromises = Object.entries(questionRecordings).map(
      ([recordingId, blob]) => {
        // If this is a unique recording ID (contains underscore), extract the original question ID
        const originalQuestionId = recordingId.includes("_")
          ? recordingId.split("_")[0]
          : recordingId;

        // Skip the final question since we already uploaded it directly
        if (originalQuestionId === finalQuestionId) {
          return Promise.resolve(true);
        }

        // Make sure we have a valid question ID
        if (!originalQuestionId) {
          return Promise.resolve(false);
        }

        return uploadRecording(originalQuestionId, blob);
      },
    );

    // Start progress simulation in parallel with uploads
    const incrementProgressInterval = setInterval(() => {
      setExtractionProgress((current) => {
        const newProgress = current + Math.random() * 3; // Random increment between 0-3%
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 300); // Update every 300ms

    // Handle all uploads and only redirect after they're complete
    const results = await Promise.all(uploadPromises);

    // Clear the interval and set progress to 100%
    clearInterval(incrementProgressInterval);
    setExtractionProgress(100);

    // After a short delay, redirect to results page
    setTimeout(() => {
      router.push(`/candidate/position/${positionId}/results`);
    }, 1500);
  } catch (error) {
    console.error("Error in extraction process:", error);
    throw error;
  }
}; 