import { Check, ChevronRight } from "lucide-react";
import React from "react";

interface SkillLevelProps {
  level: number;
  maxLevel: number;
}

export function SkillLevel({ level, maxLevel }: SkillLevelProps) {
  return (
    <div className="flex h-2 gap-1">
      {Array.from({ length: maxLevel }).map((_, i) => (
        <div
          key={i}
          className={`h-full w-8 rounded-full ${
            i < level ? "bg-verbo-purple" : "bg-gray-200 dark:bg-gray-700"
          } transition-colors`}
        />
      ))}
    </div>
  );
}

interface FeedbackProps {
  feedback?: {
    questionId: string;
    strengths: string[];
    areas_for_improvement: string[];
    competency_assessments: Array<{
      competency_id: string;
      competency_name: string;
      level: number;
      rationale: string;
    }>;
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

        <div className="mb-4 rounded-md border bg-white p-4">
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

        {feedback.competency_assessments &&
          feedback.competency_assessments.length > 0 && (
            <div className="rounded-md border bg-white p-4">
              <h3 className="mb-4 text-xs font-medium uppercase text-gray-500">
                COMPETENCY ASSESSMENTS
              </h3>

              <div className="space-y-4">
                {feedback.competency_assessments.map((assessment, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium text-verbo-dark">
                        {assessment.competency_name}
                      </h4>
                      <div className="flex flex-col items-end gap-1">
                        <SkillLevel level={assessment.level} maxLevel={5} />
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700">
                      {assessment.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default QuestionFeedback;
