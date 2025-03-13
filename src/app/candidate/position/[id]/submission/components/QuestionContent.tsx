import React from "react";
import { type PositionQuestion } from "~/types/position";
import MarkdownRenderer from "./MarkdownRenderer";

interface QuestionContentProps {
  currentQuestion: PositionQuestion;
  currentQuestionIndex: number;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  currentQuestion,
  currentQuestionIndex,
}) => {
  return (
    <div className="overflow-y-auto border-b border-gray-200 bg-white p-4 sm:p-6">
      {/* Question context - highlighted area */}
      {currentQuestion.context && (
        <div className="mb-3 rounded-md bg-gray-50 p-3 sm:mb-4 sm:p-4">
          <div className="flex items-start">
            <MarkdownRenderer content={currentQuestion.context} />
          </div>
        </div>
      )}

      <h3 className="mb-2 text-sm font-semibold text-verbo-dark sm:mb-3 sm:text-base">
        Question {currentQuestionIndex + 1}
      </h3>

      <div className="mb-3 w-full overflow-visible whitespace-normal break-words text-sm sm:mb-4 sm:text-base">
        <MarkdownRenderer content={currentQuestion.question} />
      </div>
    </div>
  );
};

export default QuestionContent;
