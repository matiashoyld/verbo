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
    <div className="max-h-[35vh] overflow-y-auto border-b border-gray-200 bg-white p-6">
      {/* Question context - highlighted area */}
      {currentQuestion.context && (
        <div className="mb-4 rounded-md bg-gray-50 p-4">
          <div className="flex items-start">
            <MarkdownRenderer content={currentQuestion.context} />
          </div>
        </div>
      )}

      <h3 className="mb-3 text-base font-semibold text-verbo-dark">
        Question {currentQuestionIndex + 1}
      </h3>

      <div className="mb-4 w-full overflow-visible whitespace-normal break-words">
        <MarkdownRenderer content={currentQuestion.question} />
      </div>
    </div>
  );
};

export default QuestionContent;
