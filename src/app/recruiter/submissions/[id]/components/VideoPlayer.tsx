import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface VideoPlayerProps {
  recordingFilePath: string | undefined | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ recordingFilePath }) => {
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Use the recordings API to get a signed URL
  const { mutate: getSignedUrlMutation } =
    api.recordings.getSignedUrl.useMutation({
      onSuccess: (data) => {
        console.log("Received signed URL:", data.url);
        setVideoUrl(data.url);
        setLoading(false);
      },
      onError: (err) => {
        console.error("Error getting signed URL:", err);
        setError("Failed to load the video: " + err.message);
        setLoading(false);
      },
    });

  useEffect(() => {
    // Reset states when the filePath changes
    setLoading(true);
    setError(null);

    if (!recordingFilePath) {
      setLoading(false);
      setError("No recording available for this question.");
      return;
    }

    // For direct URLs, use them as-is
    if (recordingFilePath.startsWith("http")) {
      setVideoUrl(recordingFilePath);
      setLoading(false);
      return;
    }

    console.log("Fetching signed URL for:", recordingFilePath);

    // Call the API to get a signed URL
    getSignedUrlMutation({ filePath: recordingFilePath });
  }, [recordingFilePath, getSignedUrlMutation]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md bg-white text-sm text-muted-foreground">
        <div className="animate-pulse">Loading video...</div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md bg-white p-4 text-center text-sm text-muted-foreground">
        {error || "No recording available for this question."}
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-md bg-black">
      <video
        key={videoUrl} // Force video reload when URL changes
        className="h-full w-full"
        controls
        autoPlay={false}
        src={videoUrl}
        onError={(e) => {
          console.error("Video loading error:", e);
          setError("Error loading video. The recording may not be available.");
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
