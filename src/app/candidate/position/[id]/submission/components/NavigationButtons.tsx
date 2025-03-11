import React from "react";
import { Button } from "~/components/ui/button";

interface NavigationButtonsProps {
  currentQuestionIndex: number;
  isLastQuestion: boolean;
  handleBackQuestion: () => Promise<void>;
  handleNextQuestion: () => Promise<void>;
  handleSubmitAssessment: () => Promise<void>;
  isExtracting: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentQuestionIndex,
  isLastQuestion,
  handleBackQuestion,
  handleNextQuestion,
  handleSubmitAssessment,
  isExtracting,
}) => {
  return (
    <div className="flex space-x-4">
      {/* Back button */}
      <Button
        variant="outline"
        onClick={handleBackQuestion}
        disabled={currentQuestionIndex === 0}
        className={`px-5 py-2 text-sm ${
          currentQuestionIndex === 0 ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        Back
      </Button>

      {/* Submit or Next button */}
      {isLastQuestion ? (
        // Submit Assessment button
        <button
          onClick={handleSubmitAssessment}
          disabled={isExtracting}
          className="rounded-md bg-verbo-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-verbo-purple/90 disabled:opacity-50"
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
  );
};

export default NavigationButtons;
