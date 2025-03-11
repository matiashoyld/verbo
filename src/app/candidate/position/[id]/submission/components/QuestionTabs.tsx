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
    <div className="border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex space-x-3">
        {questions.map((question, index) => {
          // Question is accessible if it's completed or is the active question
          const isAccessible =
            completedQuestions.has(question.id) ||
            question.id === activeQuestionId;

          return (
            <button
              key={question.id}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                activeQuestionId === question.id
                  ? "bg-verbo-purple/10 text-verbo-purple"
                  : isAccessible
                    ? "text-gray-600 hover:bg-gray-100"
                    : "cursor-not-allowed text-gray-400"
              }`}
              onClick={() => isAccessible && setActiveQuestionId(question.id)}
              disabled={!isAccessible}
            >
              Question {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionTabs;
