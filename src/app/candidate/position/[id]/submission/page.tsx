"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import MarkdownRenderer from "./components/MarkdownRenderer";
import NavigationButtons from "./components/NavigationButtons";
import NotesEditor from "./components/NotesEditor";
import PermissionDialog from "./components/PermissionDialog";
import QuestionContent from "./components/QuestionContent";
import QuestionTabs from "./components/QuestionTabs";
import RecordingIndicator from "./components/RecordingIndicator";
import {
  emergencyStopAllRecording,
  startRecording,
  stopRecording,
} from "./components/RecordingUtils";
import SkillExtractionLoading from "./components/SkillExtractionLoading";
import {
  simulateExtraction as simulateExtractionUtil,
  uploadRecording as uploadRecordingUtil,
} from "./components/UploadUtils";
import {
  optimizationSettings,
  optimizeVideoStream,
} from "./components/VideoOptimizer";

export default function CandidateSubmissionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Define tRPC mutations
  const getUploadUrlMutation = api.recordings.getUploadUrl.useMutation();
  const saveMetadataMutation = api.recordings.saveMetadata.useMutation();
  const saveAnalysisMutation = api.recordings.saveAnalysis.useMutation();
  const analyzeVideoMutation = api.recordings.analyzeVideo.useMutation();

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

      // Then request screen sharing permission with optimized constraints
      setPermissionStep("screen");
      const displayMediaOptions = {
        video: optimizationSettings.stream.video,
        audio: false,
      };

      const displayStream =
        await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // Apply additional optimization to the video stream
      const optimizedStream = await optimizeVideoStream(displayStream);
      screenStreamRef.current = optimizedStream;

      // Successfully granted permissions
      setPermissionsGranted(true);

      // Close the dialog
      setShowPermissionDialog(false);
      setPermissionStep("initial");

      // Start recording for the first question with optimized quality for LLM analysis
      startRecording(
        audioStreamRef,
        screenStreamRef,
        mediaRecorderRef,
        recordingChunksRef,
        setIsRecording,
      );
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
    await stopRecording(
      mediaRecorderRef,
      isRecording,
      activeQuestionId,
      recordingChunksRef,
      questionRecordingIds,
      setQuestionRecordings,
      questionRecordings,
      setIsRecording,
      getRecordingIdForQuestion,
    );

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

        // Start recording for the next question with optimized quality for LLM analysis
        startRecording(
          audioStreamRef,
          screenStreamRef,
          mediaRecorderRef,
          recordingChunksRef,
          setIsRecording,
        );
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
    await stopRecording(
      mediaRecorderRef,
      isRecording,
      activeQuestionId,
      recordingChunksRef,
      questionRecordingIds,
      setQuestionRecordings,
      questionRecordings,
      setIsRecording,
      getRecordingIdForQuestion,
    );

    // Find the index of the current question
    const currentIndex = position.questions.findIndex(
      (q) => q.id === activeQuestionId,
    );

    // Check if there's a previous question
    if (currentIndex > 0) {
      const prevQuestionId = position.questions[currentIndex - 1]?.id;
      if (prevQuestionId) {
        setActiveQuestionId(prevQuestionId);

        // Start recording for the previous question with optimized quality for LLM analysis
        startRecording(
          audioStreamRef,
          screenStreamRef,
          mediaRecorderRef,
          recordingChunksRef,
          setIsRecording,
        );
      }
    }
  };

  // Clean up media streams and recorders when component unmounts
  useEffect(() => {
    return () => {
      // Use our emergency stop function
      emergencyStopAllRecording(
        mediaRecorderRef,
        audioStreamRef,
        screenStreamRef,
        setIsRecording,
        recordingChunksRef,
      );
    };
  }, []);

  // Function to upload a recording to Supabase
  const uploadRecording = async (questionId: string, blob: Blob) => {
    const result = await uploadRecordingUtil(
      questionId,
      blob,
      params.id,
      getUploadUrlMutation,
      saveMetadataMutation,
      questionRecordingIds,
    );

    // Return the full result object that includes file path
    return result;
  };

  // Handle submission of the assessment
  const handleSubmitAssessment = async () => {
    setIsExtracting(true);
    setExtractionProgress(0);

    try {
      if (!position || !activeQuestionId) {
        console.error("No active question when submitting");
        return;
      }

      // 1. Stop recording and get the blob directly
      const recordingBlob = await new Promise<Blob | null>(async (resolve) => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          console.log("Stopping active recording for final question");

          // Collect chunks
          const chunks: BlobPart[] = [...recordingChunksRef.current];

          // Set up handler for remaining data
          const originalHandler = mediaRecorderRef.current.ondataavailable;
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              chunks.push(event.data);
            }

            // Restore original handler if needed
            if (originalHandler) {
              mediaRecorderRef.current!.ondataavailable = originalHandler;
            }
          };

          // Stop recording
          mediaRecorderRef.current.stop();

          // Wait for the recorder to stop
          await new Promise<void>((stopResolve) => {
            const checkInterval = setInterval(() => {
              if (
                !mediaRecorderRef.current ||
                mediaRecorderRef.current.state !== "recording"
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
              const recordingId = getRecordingIdForQuestion(activeQuestionId);
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
      });

      // 2. Add this recording to completed questions
      setCompletedQuestions((prev) => {
        const updated = new Set(prev);
        updated.add(activeQuestionId);
        return updated;
      });

      // 3. Wait a moment to ensure any pending state updates complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 4. Stop all tracks to clean up resources
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // 5. Upload the final recording directly
      let finalRecordingFilePath: string | undefined;
      if (recordingBlob && recordingBlob.size > 0) {
        try {
          const uploadResult = await uploadRecording(
            activeQuestionId,
            recordingBlob,
          );
          finalRecordingFilePath = uploadResult.filePath;

          // 5b. Analyze the final recording directly
          if (
            uploadResult.success &&
            uploadResult.filePath &&
            analyzeVideoMutation &&
            saveAnalysisMutation
          ) {
            const currentQuestion = position.questions.find(
              (q) => q.id === activeQuestionId,
            );
            if (currentQuestion) {
              console.log(
                `Analyzing final question recording: ${activeQuestionId}`,
              );

              // Wait a moment to ensure the metadata has been saved
              await new Promise((resolve) => setTimeout(resolve, 2000));

              // Analyze the video
              const analysisResult = await analyzeVideoMutation.mutateAsync({
                videoUrl: uploadResult.filePath,
                question: currentQuestion.question,
                context: position.context,
                questionContext: currentQuestion.context,
                positionId: params.id,
                questionId: activeQuestionId,
              });

              console.log(`Final question analysis completed`);

              // Save the analysis results
              if (analysisResult) {
                await saveAnalysisMutation.mutateAsync({
                  positionId: params.id,
                  questionId: activeQuestionId,
                  overall_assessment: analysisResult.overall_assessment,
                  strengths: analysisResult.strengths,
                  areas_for_improvement: analysisResult.areas_for_improvement,
                  skills_demonstrated: analysisResult.skills_demonstrated,
                });
              }
            }
          }
        } catch (error) {
          console.error(
            "Error in direct upload/analysis of final recording:",
            error,
          );
        }
      }

      // 6. Process all other recordings
      await simulateExtractionUtil(
        questionRecordings,
        activeQuestionId, // We already handled the analysis for this question
        params.id,
        uploadRecording,
        setExtractionProgress,
        router,
        position
          ? {
              questions: position.questions.map((q) => ({
                id: q.id,
                question: q.question,
                context: q.context,
              })),
              context: position.context,
            }
          : {
              questions: [],
              context: null,
            },
        saveAnalysisMutation,
        analyzeVideoMutation,
      );
    } catch (error) {
      console.error("Error in submit button:", error);
      // Try to ensure extraction still starts
      if (!isExtracting) {
        setIsExtracting(true);
        simulateExtractionUtil(
          questionRecordings,
          activeQuestionId,
          params.id,
          uploadRecording,
          setExtractionProgress,
          router,
          position
            ? {
                questions: position.questions.map((q) => ({
                  id: q.id,
                  question: q.question,
                  context: q.context,
                })),
                context: position.context,
              }
            : {
                questions: [],
                context: null,
              },
          saveAnalysisMutation,
          analyzeVideoMutation,
        );
      }
    }
  };

  // Redirect to login page if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/candidate/position/${params.id}`);
    }
  }, [isLoaded, isSignedIn, params.id, router]);

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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-gray-50">
      {/* Permission Dialog */}
      <PermissionDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        permissionsGranted={permissionsGranted}
        permissionError={permissionError}
        permissionStep={permissionStep}
        requestPermissions={requestPermissions}
      />

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

          {position.context && (
            <div className="w-full space-y-4 overflow-visible whitespace-normal break-words text-sm">
              <MarkdownRenderer content={position.context} />
            </div>
          )}
        </div>

        {/* Right panel - Question and Notepad */}
        <div className="flex w-3/5 flex-col overflow-hidden">
          {/* Question tabs */}
          <QuestionTabs
            questions={position.questions}
            activeQuestionId={activeQuestionId}
            completedQuestions={completedQuestions}
            setActiveQuestionId={setActiveQuestionId}
          />

          {/* Question content */}
          {currentQuestion && (
            <QuestionContent
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
            />
          )}

          {/* Notepad/Codepad - Taking up all remaining space */}
          <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 p-6">
            <NotesEditor
              activeQuestionId={activeQuestionId}
              questionNotes={questionNotes}
              setQuestionNotes={setQuestionNotes}
            />

            <div className="mt-5 flex items-center justify-between">
              {/* Recording indicator - positioned at the bottom left */}
              <RecordingIndicator isRecording={isRecording} />

              {/* Action buttons - navigation between questions */}
              <NavigationButtons
                currentQuestionIndex={currentQuestionIndex}
                isLastQuestion={isLastQuestion}
                handleBackQuestion={handleBackQuestion}
                handleNextQuestion={handleNextQuestion}
                handleSubmitAssessment={handleSubmitAssessment}
                isExtracting={isExtracting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
