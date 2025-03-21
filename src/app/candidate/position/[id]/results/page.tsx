"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import ReviewInterface from "./components/ReviewInterface";

// Define types for the recordings
interface Recording {
  id: string;
  questionId: string | undefined;
  recordingId: string;
  url: string | null;
  filePath: string;
  fileSize: number | null;
  durationSeconds: number | null;
  createdAt: string | Date;
}

interface RecordingResult {
  questionId: string | undefined;
  blob: Blob;
}

// Define types for the feedback data
interface FeedbackItem {
  questionId: string;
  strengths: string[];
  areas_for_improvement: string[];
  overall_assessment: string;
  competency_assessments: Array<{
    competency_id: string;
    competency_name: string;
    level: number; // 1-5 based on rubric
    rationale: string;
  }>;
}

// Generate fallback feedback data if AI analysis is not available
const generateFallbackFeedback = (
  questions: { id: string; question: string; context: string | null }[],
): FeedbackItem[] => {
  return questions.map((q) => ({
    questionId: q.id,
    strengths: [
      "Clear and concise communication",
      "Strong technical knowledge demonstrated",
      "Well-structured explanation of concepts",
    ],
    areas_for_improvement: [
      "Could provide more specific examples",
      "Consider elaborating on edge cases",
    ],
    overall_assessment:
      "Strong response that demonstrates good understanding of the subject matter. The candidate showed clear thinking and articulated their thoughts well.",
    competency_assessments: [],
  }));
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  // Fetch position data from the database using tRPC
  const { data: position, isLoading } =
    api.positions.getPositionByIdPublic.useQuery(
      { id: params.id },
      { enabled: !!params.id, refetchOnWindowFocus: false },
    );

  // Fetch recordings using the tRPC API
  const { data: recordingsData } = api.recordings.getRecordings.useQuery(
    { positionId: params.id },
    { enabled: !!params.id && !!position, refetchOnWindowFocus: false },
  );

  // Fetch AI analysis results using the tRPC API
  const { data: _analysisData } = api.recordings.getAnalysisResults.useQuery(
    { positionId: params.id },
    { enabled: !!params.id && !!position, refetchOnWindowFocus: false },
  );

  // State to store processed recording blobs
  const [recordings, setRecordings] = useState<Record<string, Blob>>({});

  // Process feedback data when analysis results are available
  useEffect(() => {
    setIsLoadingFeedback(true);

    if (position?.questions) {
      if (_analysisData?.results && _analysisData.results.length > 0) {
        // Map the analysis results to feedback items
        const mappedFeedback = position.questions.map((question) => {
          // Find the analysis for this question
          const analysis = _analysisData.results.find(
            (a) => a.questionId === question.id,
          );

          if (analysis) {
            // Return the real analysis data
            return {
              questionId: question.id,
              strengths: analysis.strengths,
              areas_for_improvement: analysis.areas_for_improvement,
              competency_assessments: analysis.competency_assessments,
              overall_assessment: analysis.overall_assessment,
            };
          } else {
            // Return a fallback item if no analysis is found
            return {
              questionId: question.id,
              strengths: ["Recording processed successfully"],
              areas_for_improvement: [
                "Check back later for complete AI analysis",
              ],
              competency_assessments: [],
              overall_assessment:
                "Your recording has been processed, but detailed AI analysis is still being generated.",
            };
          }
        });

        setFeedbackItems(mappedFeedback);
      } else {
        // If no analysis data, use fallback
        setFeedbackItems(generateFallbackFeedback(position.questions));
      }

      setIsLoadingFeedback(false);
    }
  }, [position, _analysisData]);

  // Load recordings from Supabase URLs
  useEffect(() => {
    // Skip if recordings data is not available yet
    if (!recordingsData?.recordings || recordingsData.recordings.length === 0) {
      return;
    }

    console.log(
      "Loading recordings from Supabase:",
      recordingsData.recordings.length,
    );

    // Function to fetch and convert a recording URL to a Blob
    const fetchRecordingBlob = async (recording: Recording) => {
      if (!recording.url || !recording.questionId) {
        console.warn("Recording missing URL or questionId:", recording.id);
        return null;
      }

      try {
        // Fetch the video data
        const response = await fetch(recording.url);
        if (!response.ok) {
          console.error(
            `Failed to fetch recording for question ${recording.questionId}:`,
            response.statusText,
          );
          return null;
        }

        // Convert to blob
        const blob = await response.blob();
        console.log(
          `Successfully loaded recording for question ${recording.questionId}, size: ${blob.size} bytes`,
        );
        return { questionId: recording.questionId, blob };
      } catch (error) {
        console.error(
          `Error fetching recording for question ${recording.questionId}:`,
          error,
        );
        return null;
      }
    };

    // Process all recordings in parallel
    const processRecordings = async () => {
      if (!recordingsData?.recordings) return;

      const blobPromises = recordingsData.recordings
        .filter((recording) => recording.url && recording.questionId)
        .map((recording) => fetchRecordingBlob(recording));

      // Wait for all downloads to complete
      const results = await Promise.all(blobPromises);

      // Build the recordings object
      const recordingsMap: Record<string, Blob> = {};
      results.forEach((result: RecordingResult | null) => {
        if (result && result.questionId) {
          recordingsMap[result.questionId] = result.blob;
        }
      });

      setRecordings(recordingsMap);
      console.log("Recordings loaded:", Object.keys(recordingsMap).length);
    };

    void processRecordings();
  }, [position, recordingsData]);

  if (isLoading || isLoadingFeedback) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-verbo-purple" />
          <p className="text-verbo-dark">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-verbo-dark to-verbo-purple p-4 text-white">
        <h1 className="mb-2 text-3xl font-bold">Position Not Found</h1>
        <p className="mb-6">
          The position you're looking for doesn't exist or is no longer
          available.
        </p>
      </div>
    );
  }

  return (
    <ReviewInterface
      questions={position.questions}
      feedback={feedbackItems}
      recordings={recordings}
    />
  );
}
