import { Check, ChevronRight } from "lucide-react";
import React from "react";

interface FeedbackProps {
  feedback?: {
    questionId: string;
    strengths: string[];
    areas_for_improvement: string[];
    skills_demonstrated: string[];
    overall_assessment: string;
  };
}

const QuestionFeedback: React.FC<FeedbackProps> = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          AI analysis is not yet available for this question.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-0 divide-y">
      <div className="pb-4">
        <div className="mb-4 rounded-md border bg-white p-4">
          <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
            OVERALL ANALYSIS
          </h3>
          <p className="text-xs leading-relaxed text-gray-800">
            {feedback.overall_assessment}
          </p>
        </div>

        <div className="mb-4 rounded-md border bg-white p-4">
          <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
            KEY STRENGTHS
          </h3>

          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-gray-800"
              >
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-verbo-green/10">
                  <Check className="h-2.5 w-2.5 text-verbo-green" />
                </div>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border bg-white p-4">
          <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
            AREAS FOR IMPROVEMENT
          </h3>

          <ul className="space-y-2">
            {feedback.areas_for_improvement.map((area, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-gray-800"
              >
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-verbo-purple/10">
                  <ChevronRight className="h-2.5 w-2.5 text-verbo-purple" />
                </div>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuestionFeedback;
