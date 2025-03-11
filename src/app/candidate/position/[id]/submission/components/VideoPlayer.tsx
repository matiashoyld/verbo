import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  questionId: string;
  recordingBlob?: Blob;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  questionId,
  recordingBlob,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  // Handle blob changes and create URL only when questionId or recordingBlob change
  useEffect(() => {
    // Reset state when input changes
    setIsLoading(true);
    setErrorMessage(null);

    // Clean up previous URL if it exists
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
      setVideoUrl(null);
    }

    if (recordingBlob) {
      try {
        // Create a URL from the blob
        const url = URL.createObjectURL(recordingBlob);
        console.log(`Created URL for question ${questionId}: ${url}`);
        urlRef.current = url;
        setVideoUrl(url);
        setIsLoading(false);
      } catch (error) {
        console.error(`Error creating URL for question ${questionId}:`, error);
        setErrorMessage("Failed to load video");
        setIsLoading(false);
      }
    } else {
      // Simulate loading when no recording is available
      const timer = setTimeout(() => {
        setIsLoading(false);
        setErrorMessage("No recording available");
      }, 1200);

      return () => clearTimeout(timer);
    }

    // Cleanup function for when component unmounts or dependencies change
    return () => {
      if (urlRef.current) {
        console.log(
          `Cleanup: Revoking URL for question ${questionId}: ${urlRef.current}`,
        );
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [questionId, recordingBlob]); // videoUrl is NOT a dependency

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-black/5">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-verbo-purple" />
          <p className="text-sm text-muted-foreground">Loading recording...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-black/5">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-black/5">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            No recording available
          </p>
        </div>
      </div>
    );
  }

  return (
    <video
      className="h-full w-full rounded-lg object-cover"
      src={videoUrl}
      controls
      onError={(e) => {
        console.error(`Video error for question ${questionId}:`, e);
        setErrorMessage("Error playing video");
      }}
    />
  );
};

export default VideoPlayer;
