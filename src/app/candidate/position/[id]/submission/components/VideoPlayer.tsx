import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

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

  // Debug logging
  useEffect(() => {
    if (recordingBlob) {
      console.log(
        `Recording blob received for question ${questionId}:`,
        recordingBlob.size,
        recordingBlob.type,
      );
    } else {
      console.log(`No recording blob for question ${questionId}`);
    }
  }, [questionId, recordingBlob]);

  // Create URL from blob or simulate loading when question changes
  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);

    if (recordingBlob) {
      try {
        // Create a URL from the blob
        const url = URL.createObjectURL(recordingBlob);
        console.log(`Created URL for question ${questionId}: ${url}`);
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

    // Clean up the URL when component unmounts or question changes
    return () => {
      if (videoUrl) {
        console.log(`Revoking URL for question ${questionId}: ${videoUrl}`);
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [questionId, recordingBlob]);

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
