import { CheckCircle } from "lucide-react";
import React from "react";
import { type PositionQuestion } from "~/types/position";

interface QuestionTabsProps {
  questions: PositionQuestion[];
  activeQuestionId: string | null;
  completedQuestions: Set<string>;
  setActiveQuestionId: (id: string) => void;
}

const QuestionTabs: React.FC<QuestionTabsProps> = ({
  questions,
  activeQuestionId,
  completedQuestions,
  setActiveQuestionId,
}) => {
  return (
    <div className="border-b border-gray-200 bg-white px-3 py-2 sm:px-6 sm:py-3">
      <div className="flex space-x-2 sm:space-x-3">
        {questions.map((question, index) => {
          // Question is accessible if it's completed or is the active question
          const isAccessible =
            completedQuestions.has(question.id) ||
            question.id === activeQuestionId;

          const isCompleted = completedQuestions.has(question.id);

          return (
            <button
              key={question.id}
              className={`flex min-w-[90px] items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:min-w-0 sm:px-4 sm:text-sm ${
                activeQuestionId === question.id
                  ? "bg-verbo-purple/10 text-verbo-purple"
                  : isAccessible
                    ? "text-gray-600 hover:bg-gray-100"
                    : "cursor-not-allowed text-gray-400"
              }`}
              onClick={() => isAccessible && setActiveQuestionId(question.id)}
              disabled={!isAccessible}
              aria-current={activeQuestionId === question.id ? "true" : "false"}
            >
              <span className="flex items-center">
                {isCompleted && (
                  <CheckCircle className="mr-1 h-3 w-3 text-verbo-green sm:h-4 sm:w-4" />
                )}
                <span className="md:hidden">Q{index + 1}</span>
                <span className="hidden md:inline">Question {index + 1}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionTabs;
