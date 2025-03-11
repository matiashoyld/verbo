// Function to generate a unique recording ID for a question
export const getRecordingIdForQuestion = (
  questionId: string,
  questionRecordingIds: Record<string, string>,
  setQuestionRecordingIds: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >,
) => {
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

// Function to stop all recording processes
export const emergencyStopAllRecording = (
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  audioStreamRef: React.MutableRefObject<MediaStream | null>,
  screenStreamRef: React.MutableRefObject<MediaStream | null>,
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
  recordingChunksRef: React.MutableRefObject<BlobPart[]>,
) => {
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

// Function to start recording
export const startRecording = (
  audioStreamRef: React.MutableRefObject<MediaStream | null>,
  screenStreamRef: React.MutableRefObject<MediaStream | null>,
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  recordingChunksRef: React.MutableRefObject<BlobPart[]>,
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
) => {
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
export const stopRecording = (
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  isRecording: boolean,
  activeQuestionId: string | null,
  recordingChunksRef: React.MutableRefObject<BlobPart[]>,
  questionRecordingIds: Record<string, string>,
  setQuestionRecordings: React.Dispatch<
    React.SetStateAction<Record<string, Blob>>
  >,
  questionRecordings: Record<string, Blob>,
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
  getRecordingIdForQuestion: (questionId: string) => string,
) => {
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