import { Mic, MonitorSmartphone } from "lucide-react";
import React from "react";

interface RecordingIndicatorProps {
  isRecording: boolean;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isRecording,
}) => {
  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-verbo-purple/10 px-3 py-2">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
      </div>
      <span className="text-xs font-medium text-verbo-dark">
        <span className="md:hidden">Recording</span>
        <span className="hidden md:inline">Recording in progress</span>
      </span>
      <div className="flex gap-1.5">
        <Mic className="h-3.5 w-3.5 text-verbo-purple/70" />
        <MonitorSmartphone className="h-3.5 w-3.5 text-verbo-purple/70" />
      </div>
    </div>
  );
};

export default RecordingIndicator;
