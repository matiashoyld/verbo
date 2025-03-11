"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2, Mic, MonitorSmartphone } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import SkillExtractionLoading from "./components/SkillExtractionLoading";

// Interface for code component props
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Define types that match the actual API response
type PositionQuestion = {
  id: string;
  question: string;
  context: string | null;
};

// This type is used by the API response
type Position = {
  id: string;
  title: string;
  jobDescription: string;
  context: string | null;
  creatorId?: string;
  creatorName?: string | null;
  createdAt?: string;
  questions: PositionQuestion[];
};

export default function CandidateSubmissionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Define tRPC mutations
  const getUploadUrlMutation = api.recordings.getUploadUrl.useMutation();
  const saveMetadataMutation = api.recordings.saveMetadata.useMutation();

  // Track the active question index
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(
    new Set(),
  );

  // Add state to store notes for each question
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>(
    {},
  );

  // Add a unique recording ID for each question to avoid confusion
  const [questionRecordingIds, setQuestionRecordingIds] = useState<
    Record<string, string>
  >({});

  // Function to get or create a unique recording ID for a question
  const getRecordingIdForQuestion = (questionId: string) => {
    if (!questionRecordingIds[questionId]) {
      // Generate a unique ID combining question ID and timestamp
      const uniqueId = `${questionId}_${Date.now()}`;
      setQuestionRecordingIds((prev) => ({
        ...prev,
        [questionId]: uniqueId,
      }));
      return uniqueId;
    }
    return questionRecordingIds[questionId];
  };

  // State for permission dialog
  const [showPermissionDialog, setShowPermissionDialog] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionStep, setPermissionStep] = useState<
    "initial" | "microphone" | "screen"
  >("initial");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<BlobPart[]>([]);

  // Object to store recordings for each question
  const [questionRecordings, setQuestionRecordings] = useState<
    Record<string, Blob>
  >({});

  // Extraction loading state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  // Function to request permissions
  const requestPermissions = async () => {
    setPermissionError(null);

    try {
      // First request microphone permission
      setPermissionStep("microphone");
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      audioStreamRef.current = micStream;

      // Then request screen sharing permission
      setPermissionStep("screen");
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      screenStreamRef.current = displayStream;

      // Successfully granted permissions
      setPermissionsGranted(true);

      // Close the dialog
      setShowPermissionDialog(false);
      setPermissionStep("initial");

      // Start recording for the first question
      startRecording();
    } catch (err) {
      console.error("Error requesting permissions:", err);
      // Reset step if error occurs
      setPermissionStep("initial");

      // Set specific error message based on the error
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setPermissionError(
            "Permissions were denied. You must allow both microphone and screen recording to continue.",
          );
        } else if (err.name === "NotFoundError") {
          setPermissionError(
            "No microphone was found on your device. Please connect a microphone and try again.",
          );
        } else {
          setPermissionError(`Permission error: ${err.message}`);
        }
      } else {
        setPermissionError(
          "An unknown error occurred while requesting permissions.",
        );
      }

      // Keep dialog open if permissions are denied
      setPermissionsGranted(false);
    }
  };

  // Function to start recording
  const startRecording = () => {
    if (!audioStreamRef.current || !screenStreamRef.current) {
      console.error("Streams not available for recording");
      return;
    }

    try {
      // Combine audio and screen streams
      const combinedStream = new MediaStream([
        ...audioStreamRef.current.getAudioTracks(),
        ...screenStreamRef.current.getVideoTracks(),
      ]);

      // Create a new MediaRecorder instance with appropriate options
      const options = { mimeType: "video/webm" };
      try {
        const mediaRecorder = new MediaRecorder(combinedStream, options);
        mediaRecorderRef.current = mediaRecorder;

        // Clear previous recording chunks
        recordingChunksRef.current = [];

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordingChunksRef.current.push(event.data);
          }
        };

        // Start recording with timeslice to ensure we get regular dataavailable events
        mediaRecorder.start(1000); // Collect data every second
        setIsRecording(true);
      } catch (error) {
        console.error("Error creating MediaRecorder with video/webm:", error);

        // Try with basic MediaRecorder as fallback
        try {
          const basicRecorder = new MediaRecorder(combinedStream);
          mediaRecorderRef.current = basicRecorder;

          recordingChunksRef.current = [];

          basicRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordingChunksRef.current.push(event.data);
            }
          };

          basicRecorder.start(1000);
          setIsRecording(true);
        } catch (fallbackError) {
          console.error(
            "Critical error: Cannot create MediaRecorder:",
            fallbackError,
          );
        }
      }
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  // Function to stop recording and save for current question
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) {
      return Promise.resolve(); // Return a resolved promise if not recording
    }

    // Capture the current question ID to ensure we save with the right ID even if it changes during async operation
    const currentQuestionId = activeQuestionId;

    return new Promise<void>((resolve) => {
      // Safety timeout to prevent hanging promises
      const safetyTimeout = setTimeout(() => {
        console.warn("Recording stop operation timed out after 5 seconds");
        // If we have chunks but the recorder didn't properly stop, try to save what we have
        if (recordingChunksRef.current.length > 0 && currentQuestionId) {
          const recordingBlob = new Blob(recordingChunksRef.current, {
            type: "video/webm",
          });

          if (recordingBlob.size > 0) {
            // Get a unique recording ID for this question
            const recordingId = getRecordingIdForQuestion(currentQuestionId);

            setQuestionRecordings((prev) => ({
              ...prev,
              [recordingId]: recordingBlob,
            }));
          }
        }

        setIsRecording(false);
        resolve();
      }, 5000);

      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        clearTimeout(safetyTimeout);
        setIsRecording(false);
        resolve();
        return;
      }

      // Add handler for when recording stops
      mediaRecorder.onstop = () => {
        clearTimeout(safetyTimeout);

        // Create a blob from the recording chunks
        const recordingBlob = new Blob(recordingChunksRef.current, {
          type: "video/webm",
        });

        // Save the recording for the current question
        if (currentQuestionId && recordingBlob.size > 0) {
          // Get a unique recording ID for this question
          const recordingId = getRecordingIdForQuestion(currentQuestionId);

          // Make sure to save this synchronously to avoid race conditions
          const updatedRecordings = {
            ...questionRecordings,
            [recordingId]: recordingBlob,
          };

          setQuestionRecordings(updatedRecordings);
        }

        // Reset recording state
        recordingChunksRef.current = [];
        setIsRecording(false);

        // Give React a moment to update state before resolving
        setTimeout(resolve, 300);
      };

      // Add an error handler
      mediaRecorder.onerror = (event) => {
        clearTimeout(safetyTimeout);
        console.error("Error in MediaRecorder:", event);
        setIsRecording(false);
        resolve();
      };

      // Stop the recording
      try {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        } else {
          setIsRecording(false);
          resolve();
        }
      } catch (err) {
        console.error("Error stopping MediaRecorder:", err);
        setIsRecording(false);
        resolve();
      }
    });
  };

  // Function to stop all recording processes
  const emergencyStopAllRecording = () => {
    try {
      // Stop the MediaRecorder if it exists
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
          }
        } catch (e) {
          console.error("Error stopping MediaRecorder:", e);
        }
        mediaRecorderRef.current = null;
      }

      // Stop all tracks in the audio stream
      if (audioStreamRef.current) {
        try {
          const audioTracks = audioStreamRef.current.getTracks();
          audioTracks.forEach((track) => {
            track.stop();
          });
        } catch (e) {
          console.error("Error stopping audio tracks:", e);
        }
        audioStreamRef.current = null;
      }

      // Stop all tracks in the screen stream
      if (screenStreamRef.current) {
        try {
          const screenTracks = screenStreamRef.current.getTracks();
          screenTracks.forEach((track) => {
            track.stop();
          });
        } catch (e) {
          console.error("Error stopping screen tracks:", e);
        }
        screenStreamRef.current = null;
      }

      // Reset all recording state
      setIsRecording(false);
      recordingChunksRef.current = [];
    } catch (e) {
      console.error("Critical error stopping recording:", e);
    }
  };

  // Fetch position data from the database using tRPC
  const { data: position, isLoading } =
    api.positions.getPositionByIdPublic.useQuery(
      {
        id: params.id,
      },
      {
        enabled: !!params.id,
        refetchOnWindowFocus: false,
      },
    );

  // Set initial active question when data loads
  useEffect(() => {
    if (
      position?.questions &&
      position.questions.length > 0 &&
      !activeQuestionId
    ) {
      // Safely access the first question
      const firstQuestion = position.questions[0];
      if (firstQuestion) {
        setActiveQuestionId(firstQuestion.id);
      }
    }
  }, [position, activeQuestionId]);

  // Function to handle moving to the next question
  const handleNextQuestion = async () => {
    if (!position || !activeQuestionId) return;

    // Stop current recording
    await stopRecording();

    // Add current question to completed questions
    setCompletedQuestions((prev) => {
      const updated = new Set(prev);
      updated.add(activeQuestionId);
      return updated;
    });

    // Find the index of the current question
    const currentIndex = position.questions.findIndex(
      (q) => q.id === activeQuestionId,
    );

    // Check if there's a next question
    if (currentIndex >= 0 && currentIndex < position.questions.length - 1) {
      // Move to the next question - use optional chaining and nullish coalescing to handle undefined
      const nextQuestionId = position.questions[currentIndex + 1]?.id;
      if (nextQuestionId) {
        setActiveQuestionId(nextQuestionId);

        // Start recording for the next question
        startRecording();
      }
    } else {
      // This was the last question, start the extraction process
      console.log("Last question reached, preparing for submission");

      // Verify all recordings before submission
      if (position?.questions) {
        const missingRecordings = position.questions
          .map((q) => {
            const recordingId = questionRecordingIds[q.id] || q.id;
            const hasRecording = !!questionRecordings[recordingId];
            return {
              questionId: q.id,
              recordingId,
              hasRecording,
              index: position.questions.findIndex((pq) => pq.id === q.id),
            };
          })
          .filter((r) => !r.hasRecording);

        if (missingRecordings.length > 0) {
          console.warn("Missing recordings for questions:", missingRecordings);
        } else {
          console.log(
            "All questions have recordings, proceeding with submission",
          );
        }
      }

      // Don't automatically start extraction - let the user click Submit
      console.log("Last question completed. User should click Submit.");
    }
  };

  // Function to handle moving to the previous question
  const handleBackQuestion = async () => {
    if (!position || !activeQuestionId) return;

    // Stop current recording
    await stopRecording();

    // Find the index of the current question
    const currentIndex = position.questions.findIndex(
      (q) => q.id === activeQuestionId,
    );

    // Check if there's a previous question
    if (currentIndex > 0) {
      // Move to the previous question - use optional chaining and nullish coalescing to handle undefined
      const prevQuestionId = position.questions[currentIndex - 1]?.id;
      if (prevQuestionId) {
        setActiveQuestionId(prevQuestionId);

        // Start recording for the previous question
        startRecording();
      }
    }
  };

  // Clean up media streams and recorders when component unmounts
  useEffect(() => {
    return () => {
      // Use our emergency stop function
      emergencyStopAllRecording();
    };
  }, []);

  // Function to replace \n with actual newlines for markdown rendering
  const formatMarkdown = (text: string) => {
    // Handle both \n and \\n newline formats
    return text?.replace(/\\n/g, "\n") || "";
  };

  // Custom components for markdown rendering
  const MarkdownComponents: Components = {
    // Style headings
    h1: ({ ...props }) => (
      <h1
        className="mb-4 mt-6 text-base font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h2: ({ ...props }) => (
      <h2
        className="mb-3 mt-5 text-[15px] font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h3: ({ ...props }) => (
      <h3
        className="mb-2 mt-4 text-sm font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h4: ({ ...props }) => (
      <h4
        className="mb-2 mt-3 text-[13px] font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h5: ({ ...props }) => (
      <h5
        className="mb-2 mt-3 text-xs font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h6: ({ ...props }) => (
      <h6
        className="mb-2 mt-3 text-xs font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    // Style paragraphs
    p: ({ ...props }) => (
      <p className="mb-4 text-sm text-foreground/80 last:mb-0" {...props} />
    ),
    // Style links
    a: ({ ...props }) => (
      <a
        className="font-medium text-verbo-blue no-underline hover:underline"
        {...props}
      />
    ),
    // Style emphasis and strong
    em: ({ ...props }) => (
      <em className="italic text-foreground/80" {...props} />
    ),
    strong: ({ ...props }) => (
      <strong className="font-medium text-foreground/90" {...props} />
    ),
    // Style lists
    ul: ({ ...props }) => (
      <ul className="mb-4 list-disc pl-5 last:mb-0" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="mb-4 list-decimal pl-5 last:mb-0" {...props} />
    ),
    li: ({ ...props }) => (
      <li
        className="mb-2 text-sm text-foreground/80 marker:text-foreground last:mb-0"
        {...props}
      />
    ),
    // Style code blocks and inline code
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <code
          className={`my-4 block w-full overflow-visible whitespace-pre-wrap break-words rounded-md border border-border/10 bg-muted/20 p-3 text-sm font-medium last:mb-0 ${match[1] ? `language-${match[1]}` : ""}`}
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className="rounded bg-verbo-purple/5 px-1.5 py-0.5 text-sm font-medium text-verbo-purple/80"
          {...props}
        >
          {children}
        </code>
      );
    },
    // Style blockquotes
    blockquote: ({ ...props }) => (
      <blockquote
        className="my-4 border-l-2 border-verbo-purple/30 pl-4 text-foreground/70 last:mb-0"
        {...props}
      />
    ),
    // Style horizontal rules
    hr: ({ ...props }) => (
      <hr className="my-6 border-border/50 last:mb-0" {...props} />
    ),
    // Style tables
    table: ({ ...props }) => (
      <div className="my-5 w-full overflow-visible last:mb-0">
        <table
          className="w-full border-collapse border border-border/30 text-left text-sm"
          {...props}
        />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead className="bg-muted/30 text-foreground/90" {...props} />
    ),
    tbody: ({ ...props }) => <tbody {...props} />,
    tr: ({ ...props }) => (
      <tr className="border-b border-border/30 even:bg-muted/10" {...props} />
    ),
    th: ({ ...props }) => (
      <th
        className="break-words border border-border/30 p-2 text-xs font-medium"
        {...props}
      />
    ),
    td: ({ ...props }) => (
      <td
        className="whitespace-normal break-words border border-border/30 p-2 text-xs"
        {...props}
      />
    ),
    pre: ({ ...props }) => (
      <pre
        className="my-4 overflow-visible whitespace-pre-wrap rounded-md border border-border/10 bg-muted/20 p-0"
        {...props}
      />
    ),
  };

  // Redirect to login page if not signed in
  if (isLoaded && !isSignedIn) {
    router.push(`/candidate/position/${params.id}`);
    return null;
  }

  // Handle loading state
  if (isLoading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-verbo-purple" />
          <p className="text-verbo-dark">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Handle case where position is not found
  if (!position) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-verbo-dark to-verbo-purple p-4 text-white">
        <h1 className="mb-2 text-3xl font-bold">Position Not Found</h1>
        <p className="mb-6">
          The position you're looking for doesn't exist or is no longer
          available.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-verbo-green px-4 py-2 font-medium text-verbo-dark hover:bg-verbo-green/90"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Find the current question based on activeQuestionId
  const currentQuestion =
    position.questions.find((q) => q.id === activeQuestionId) ||
    (position.questions.length > 0 ? position.questions[0] : null);

  // If there are no questions, show a message
  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-4 text-center">
          <h2 className="text-xl font-bold text-verbo-dark">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            This position does not have any questions yet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-verbo-purple px-4 py-2 text-sm font-medium text-white"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Find the index of the current question
  const currentQuestionIndex =
    position?.questions.findIndex((q) => q.id === activeQuestionId) ?? -1;

  // Flag to check if this is the last question
  const isLastQuestion =
    currentQuestionIndex !== -1 &&
    currentQuestionIndex === (position?.questions.length ?? 0) - 1;

  // If extraction is in progress, show the loading screen as a full-page overlay
  if (isExtracting && position) {
    return (
      <div className="fixed inset-0 z-50">
        <SkillExtractionLoading
          progress={extractionProgress}
          totalQuestions={position.questions.length}
        />
      </div>
    );
  }

  // Function to upload a recording to Supabase
  const uploadRecording = async (questionId: string, blob: Blob) => {
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
          positionId: params.id,
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
          positionId: params.id,
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
  const simulateExtraction = async () => {
    // Reset progress
    setExtractionProgress(0);

    try {
      // Get the final question ID for excluding
      const finalQuestionId = activeQuestionId;

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
        router.push(`/candidate/position/${params.id}/results`);
      }, 1500);
    } catch (error) {
      console.error("Error in extraction process:", error);
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-gray-50">
      {/* Permission Dialog */}
      <Dialog
        open={showPermissionDialog}
        onOpenChange={(open) => {
          // Only allow closing the dialog if permissions are granted
          if (!open && !permissionsGranted) {
            return;
          }
          setShowPermissionDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-verbo-dark">
              Permission Required
            </DialogTitle>
            <DialogDescription>
              This assessment requires audio and screen recording to accurately
              evaluate your skills. Your session will be recorded for AI
              analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <div className="rounded-md bg-verbo-purple/10 p-4">
              <p className="text-sm text-verbo-dark">
                When you click "Allow Recording" below, your browser will ask
                for permission to:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-verbo-dark/80">
                <li>Access your microphone for audio recording</li>
                <li>Share your screen for visual assessment</li>
              </ul>

              {permissionStep === "screen" && (
                <div className="mt-3 rounded-md bg-verbo-green/10 p-3">
                  <p className="text-sm font-medium text-verbo-dark">
                    Important:
                  </p>
                  <p className="mt-1 text-sm text-verbo-dark/80">
                    In the screen selection dialog that appears, please select
                    the <strong>"Entire screen"</strong> option and click
                    "Share" to ensure accurate assessment.
                  </p>
                  <div className="mt-2 overflow-hidden rounded border border-border/30">
                    <img
                      src="/images/screen-share-guide.png"
                      alt="Screen sharing guide"
                      className="w-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                </div>
              )}

              <p className="mt-2 text-sm italic text-verbo-dark/70">
                Note: All recordings are used solely for the purpose of this
                assessment and will be processed securely.
              </p>
            </div>

            {permissionError && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  {permissionError}
                </p>
                <p className="mt-1 text-xs text-red-700">
                  Tip: Check your browser settings to ensure that permissions
                  for this site are not blocked.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={requestPermissions}
              className="w-full bg-verbo-purple text-white hover:bg-verbo-purple/90 sm:w-auto"
            >
              {permissionError ? "Retry" : "Allow Recording"}
            </Button>
            {permissionError && (
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto"
              >
                Return to Home
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Context */}
        <div className="w-2/5 overflow-y-auto border-r border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-xl font-bold text-verbo-dark">
            {position.title}
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Review and understand the assessment case and questions.
          </p>

          <div className="w-full space-y-4 overflow-visible whitespace-normal break-words text-sm">
            {position.context && (
              <div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {formatMarkdown(position.context)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Question and Notepad */}
        <div className="flex w-3/5 flex-col overflow-hidden">
          {/* Question tabs */}
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex space-x-3">
              {position.questions.map((question, index) => {
                // Question is accessible if it's completed or is the active question
                const isAccessible =
                  completedQuestions.has(question.id) ||
                  question.id === activeQuestionId;

                return (
                  <button
                    key={question.id}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                      activeQuestionId === question.id
                        ? "bg-verbo-purple/10 text-verbo-purple"
                        : isAccessible
                          ? "text-gray-600 hover:bg-gray-100"
                          : "cursor-not-allowed text-gray-400"
                    }`}
                    onClick={() =>
                      isAccessible && setActiveQuestionId(question.id)
                    }
                    disabled={!isAccessible}
                  >
                    Question {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question content */}
          <div className="max-h-[35vh] overflow-y-auto border-b border-gray-200 bg-white p-6">
            {/* Question context - highlighted area */}
            {currentQuestion.context && (
              <div className="mb-4 rounded-md bg-gray-50 p-4">
                <div className="flex items-start">
                  <div className="w-full overflow-visible whitespace-normal break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {formatMarkdown(currentQuestion.context)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            <h3 className="mb-3 text-base font-semibold text-verbo-dark">
              Question {currentQuestionIndex + 1}
            </h3>

            <div className="mb-4 w-full overflow-visible whitespace-normal break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {formatMarkdown(currentQuestion.question)}
              </ReactMarkdown>
            </div>
          </div>

          {/* Notepad/Codepad - Taking up all remaining space */}
          <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 p-6">
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Notes
                  </span>
                </div>
              </div>
              <textarea
                className="w-full flex-1 resize-none p-4 font-mono text-sm text-gray-800 focus:outline-none"
                placeholder="If you need, you can take notes here..."
                value={
                  activeQuestionId ? questionNotes[activeQuestionId] || "" : ""
                }
                onChange={(e) => {
                  if (activeQuestionId) {
                    setQuestionNotes((prev) => ({
                      ...prev,
                      [activeQuestionId]: e.target.value,
                    }));
                  }
                }}
              ></textarea>
            </div>

            <div className="mt-5 flex items-center justify-between">
              {/* Recording indicator - positioned at the bottom left */}
              {isRecording && (
                <div className="flex items-center gap-2 rounded-md bg-verbo-purple/10 px-3 py-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
                  </div>
                  <span className="text-xs font-medium text-verbo-dark">
                    Recording in progress
                  </span>
                  <div className="flex gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-verbo-purple/70" />
                    <MonitorSmartphone className="h-3.5 w-3.5 text-verbo-purple/70" />
                  </div>
                </div>
              )}

              {/* Action buttons - navigation between questions */}
              <div className="flex space-x-4">
                {/* Back button */}
                <Button
                  variant="outline"
                  onClick={handleBackQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-5 py-2 text-sm ${
                    currentQuestionIndex === 0
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  Back
                </Button>

                {/* Submit or Next button */}
                {isLastQuestion ? (
                  // Submit Assessment button
                  <button
                    onClick={async () => {
                      try {
                        // Prevent multiple submissions
                        if (isExtracting) {
                          console.log(
                            "Already extracting, ignoring duplicate click",
                          );
                          return;
                        }

                        // Disable further submissions immediately
                        setIsExtracting(true);

                        if (!position || !activeQuestionId) {
                          console.error("No active question when submitting");
                          return;
                        }

                        // 1. Stop recording and get the blob directly
                        const recordingBlob = await new Promise<Blob | null>(
                          async (resolve) => {
                            if (
                              mediaRecorderRef.current &&
                              mediaRecorderRef.current.state === "recording"
                            ) {
                              console.log(
                                "Stopping active recording for final question",
                              );

                              // Collect chunks
                              const chunks: BlobPart[] = [
                                ...recordingChunksRef.current,
                              ];

                              // Set up handler for remaining data
                              const originalHandler =
                                mediaRecorderRef.current.ondataavailable;
                              mediaRecorderRef.current.ondataavailable = (
                                event,
                              ) => {
                                if (event.data && event.data.size > 0) {
                                  chunks.push(event.data);
                                }

                                // Restore original handler if needed
                                if (originalHandler) {
                                  mediaRecorderRef.current!.ondataavailable =
                                    originalHandler;
                                }
                              };

                              // Stop recording
                              mediaRecorderRef.current.stop();

                              // Wait for the recorder to stop
                              await new Promise<void>((stopResolve) => {
                                const checkInterval = setInterval(() => {
                                  if (
                                    !mediaRecorderRef.current ||
                                    mediaRecorderRef.current.state !==
                                      "recording"
                                  ) {
                                    clearInterval(checkInterval);
                                    stopResolve();
                                  }
                                }, 100);

                                // Safety timeout
                                setTimeout(() => {
                                  clearInterval(checkInterval);
                                  stopResolve();
                                }, 2000);
                              });

                              // Create blob from chunks
                              if (chunks.length > 0) {
                                const blob = new Blob(chunks, {
                                  type: "video/webm",
                                });

                                // Save it to state
                                if (activeQuestionId) {
                                  const recordingId =
                                    getRecordingIdForQuestion(activeQuestionId);
                                  setQuestionRecordings((prev) => ({
                                    ...prev,
                                    [recordingId]: blob,
                                  }));
                                }

                                resolve(blob);
                              } else {
                                resolve(null);
                              }
                            } else {
                              resolve(null);
                            }
                          },
                        );

                        // 2. Add this recording to completed questions
                        setCompletedQuestions((prev) => {
                          const updated = new Set(prev);
                          updated.add(activeQuestionId);
                          return updated;
                        });

                        // 3. Wait a moment to ensure any pending state updates complete
                        await new Promise((resolve) =>
                          setTimeout(resolve, 500),
                        );

                        // 4. Stop all tracks to clean up resources
                        if (audioStreamRef.current) {
                          audioStreamRef.current
                            .getTracks()
                            .forEach((track) => track.stop());
                        }
                        if (screenStreamRef.current) {
                          screenStreamRef.current
                            .getTracks()
                            .forEach((track) => track.stop());
                        }

                        // 5. Upload the final recording directly
                        if (recordingBlob && recordingBlob.size > 0) {
                          try {
                            // Get a signed upload URL
                            const uploadUrlResult =
                              await getUploadUrlMutation.mutateAsync({
                                questionId: activeQuestionId,
                                positionId: params.id,
                                contentType: recordingBlob.type || "video/webm",
                                extension: "webm",
                              });

                            if (uploadUrlResult?.signedUrl) {
                              // Upload directly to Supabase
                              const uploadResponse = await fetch(
                                uploadUrlResult.signedUrl,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type":
                                      recordingBlob.type || "video/webm",
                                  },
                                  body: recordingBlob,
                                },
                              );

                              if (uploadResponse.ok) {
                                // Save metadata
                                await saveMetadataMutation.mutateAsync({
                                  positionId: params.id,
                                  questionId: activeQuestionId,
                                  filePath: uploadUrlResult.filePath,
                                  fileSize: recordingBlob.size,
                                });
                              }
                            }
                          } catch (error) {
                            console.error(
                              "Error in direct upload of final recording:",
                              error,
                            );
                          }
                        }

                        // 6. Process all other recordings
                        await simulateExtraction();
                      } catch (error) {
                        console.error("Error in submit button:", error);
                        // Try to ensure extraction still starts
                        if (!isExtracting) {
                          setIsExtracting(true);
                          simulateExtraction();
                        }
                      }
                    }}
                    className="rounded-md bg-verbo-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-verbo-purple/90"
                  >
                    Submit Assessment
                  </button>
                ) : (
                  // Next Question button
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-verbo-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-verbo-purple/90"
                  >
                    Next Question
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
