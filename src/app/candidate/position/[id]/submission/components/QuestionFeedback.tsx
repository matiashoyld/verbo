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
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          AI analysis is not yet available for this question.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-0 divide-y">
      <div className="pb-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verbo-purple/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-verbo-purple"
            >
              <path d="M6.5 6.5h11v11h-11z"></path>
              <path d="M6 18L18 6"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold">AI Analysis</h2>
        </div>

        <div className="mb-6 rounded-md border bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase text-gray-500">
            KEY SKILLS DEMONSTRATED
          </h3>
          <div className="flex flex-wrap gap-2">
            {feedback.skills_demonstrated.map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-verbo-purple/10 px-4 py-2 text-sm text-verbo-purple"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-md border bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase text-gray-500">
            OVERALL ANALYSIS
          </h3>
          <p className="leading-relaxed text-gray-800">
            {feedback.overall_assessment}
          </p>
        </div>

        <div className="mb-6 rounded-md border bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase text-gray-500">
            KEY STRENGTHS
          </h3>

          <ul className="space-y-3">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-800">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-verbo-green/10">
                  <Check className="h-3 w-3 text-verbo-green" />
                </div>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border bg-white p-6">
          <h3 className="mb-4 text-sm font-medium uppercase text-gray-500">
            AREAS FOR IMPROVEMENT
          </h3>

          <ul className="space-y-3">
            {feedback.areas_for_improvement.map((area, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-800">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-verbo-purple/10">
                  <ChevronRight className="h-3 w-3 text-verbo-purple" />
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
