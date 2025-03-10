import { Loader2, Sparkles } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface SkillExtractionLoadingProps {
  progress: number;
  totalQuestions: number;
}

const SkillExtractionLoading: React.FC<SkillExtractionLoadingProps> = ({
  progress,
  totalQuestions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  // Calculate which question is being processed based on progress
  useEffect(() => {
    const questionIndex = Math.min(
      Math.floor((progress / 100) * totalQuestions),
      totalQuestions - 1,
    );
    setCurrentQuestionIndex(questionIndex);

    // Scroll to the current question
    if (questionsContainerRef.current) {
      const currentQuestionElement =
        questionsContainerRef.current.children[questionIndex];
      if (currentQuestionElement) {
        currentQuestionElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [progress, totalQuestions, currentQuestionIndex]);

  // Calculate completed questions
  const completedQuestions = Math.min(
    Math.floor((progress / 100) * totalQuestions),
    totalQuestions,
  );

  return (
    <div className="animate-fade-in fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-semibold">
            Analyzing Your Assessment
          </h1>
          <p className="text-muted-foreground">
            Our AI is extracting and evaluating your skills
          </p>
        </div>

        <div className="mb-6 rounded-xl border bg-card p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>

          <div className="mb-6 h-2 w-full rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-verbo-purple transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Scrollable container with fixed height to show 4 questions */}
          <div
            ref={questionsContainerRef}
            className="max-h-[240px] space-y-3 overflow-y-auto pr-1"
          >
            {Array.from({ length: totalQuestions })
              // Only show questions that are currently being processed or completed
              .filter((_, index) => index <= currentQuestionIndex)
              .map((_, index) => {
                // Determine the state of each question
                const isComplete = index < completedQuestions;
                const isCurrent =
                  index === currentQuestionIndex && progress < 100;

                return (
                  <div
                    key={index}
                    className={`relative flex items-center rounded-lg p-3 transition-all duration-300 ${
                      isComplete
                        ? "bg-verbo-purple/10"
                        : isCurrent
                          ? "border border-verbo-purple/20 bg-verbo-purple/5"
                          : "bg-secondary"
                    }`}
                  >
                    <div
                      className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                        isComplete
                          ? "bg-verbo-purple text-white"
                          : isCurrent
                            ? "bg-verbo-purple/20 text-verbo-purple"
                            : "border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <Sparkles className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isComplete
                            ? "text-foreground"
                            : isCurrent
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        Question {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isComplete
                          ? "Analysis complete"
                          : isCurrent
                            ? "Analyzing..."
                            : "Pending analysis"}
                      </p>
                    </div>

                    {isCurrent && (
                      <div className="absolute inset-0 h-full w-full rounded-lg opacity-50"></div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          This may take a few moments. We're carefully analyzing your responses
          to provide accurate feedback.
        </p>
      </div>
    </div>
  );
};

export default SkillExtractionLoading;
