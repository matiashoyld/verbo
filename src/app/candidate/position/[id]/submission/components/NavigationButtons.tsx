import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import RecordingIndicator from "./RecordingIndicator";

interface NavigationButtonsProps {
  currentQuestionIndex: number;
  isLastQuestion: boolean;
  handleBackQuestion: () => Promise<void>;
  handleNextQuestion: () => Promise<void>;
  handleSubmitAssessment: () => Promise<void>;
  isExtracting: boolean;
  isRecording?: boolean; // Make it optional for backward compatibility
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentQuestionIndex,
  isLastQuestion,
  handleBackQuestion,
  handleNextQuestion,
  handleSubmitAssessment,
  isExtracting,
  isRecording,
}) => {
  return (
    <div className="flex w-full items-center justify-between space-x-3 sm:w-auto sm:justify-end sm:space-x-4">
      {/* Back button */}
      <Button
        variant="outline"
        onClick={handleBackQuestion}
        disabled={currentQuestionIndex === 0}
        className={`h-9 px-3 text-xs sm:h-10 sm:px-5 sm:text-sm ${
          currentQuestionIndex === 0 ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
        <span>Back</span>
      </Button>

      {/* Recording indicator - visible if isRecording is provided */}
      {isRecording !== undefined && (
        <div className="flex-shrink-0">
          <RecordingIndicator isRecording={isRecording} />
        </div>
      )}

      {/* Submit or Next button */}
      {isLastQuestion ? (
        // Submit Assessment button
        <button
          onClick={handleSubmitAssessment}
          disabled={isExtracting}
          className="flex h-9 items-center justify-center rounded-md bg-verbo-purple px-3 text-xs font-medium text-white transition-colors hover:bg-verbo-purple/90 disabled:opacity-50 sm:h-10 sm:px-5 sm:text-sm"
        >
          <span>Submit</span>
          <Send className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      ) : (
        // Next Question button
        <Button
          onClick={handleNextQuestion}
          className="flex h-9 items-center justify-center bg-verbo-purple px-3 text-xs font-medium text-white transition-colors hover:bg-verbo-purple/90 sm:h-10 sm:px-5 sm:text-sm"
        >
          <span>Next</span>
          <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
