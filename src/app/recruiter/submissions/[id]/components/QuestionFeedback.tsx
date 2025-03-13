import { Check, ChevronRight } from "lucide-react";
import React from "react";

interface CompetencyAssessment {
  id: string;
  level: number;
  rationale: string;
  questionCompetency: {
    id: string;
    competency: {
      id: string;
      name: string;
      skill: {
        id: string;
        name: string;
      };
    };
  };
}

interface SubmissionQuestion {
  id: string;
  overall_assessment: string | null;
  strengths: string[];
  areas_of_improvement: string[];
  competencyAssessments: CompetencyAssessment[];
  recordingMetadata: {
    id: string;
    filePath: string;
    fileSize: number | null;
    durationSeconds: number | null;
    processed: boolean;
  } | null;
  positionQuestion: {
    id: string;
    question: string;
    context: string | null;
  };
}

interface FeedbackProps {
  question: SubmissionQuestion | undefined;
}

const QuestionFeedback: React.FC<FeedbackProps> = ({ question }) => {
  if (!question || !question.recordingMetadata?.processed) {
    return (
      <div className="rounded-md bg-white p-4 text-center text-sm text-muted-foreground">
        AI analysis not available yet. Please check back later after the video
        has been processed.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall assessment section */}
      {question.overall_assessment && (
        <div className="rounded-md bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-verbo-dark">
            Overall Assessment
          </h3>
          <p className="text-sm">{question.overall_assessment}</p>
        </div>
      )}

      {/* Key strengths section */}
      {question.strengths && question.strengths.length > 0 && (
        <div className="rounded-md bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-verbo-dark">
            KEY STRENGTHS
          </h3>
          <ul className="space-y-2">
            {question.strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-xs text-gray-800"
              >
                <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-verbo-green/10">
                  <Check className="h-2.5 w-2.5 text-verbo-green" />
                </div>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for improvement section */}
      {question.areas_of_improvement &&
        question.areas_of_improvement.length > 0 && (
          <div className="rounded-md bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-medium text-verbo-dark">
              AREAS FOR IMPROVEMENT
            </h3>
            <ul className="space-y-2">
              {question.areas_of_improvement.map((area, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-gray-800"
                >
                  <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-verbo-purple/10">
                    <ChevronRight className="h-2.5 w-2.5 text-verbo-purple" />
                  </div>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Competency assessments section */}

      {/* No feedback available fallback */}
      {!question.overall_assessment &&
        (!question.strengths || question.strengths.length === 0) &&
        (!question.areas_of_improvement ||
          question.areas_of_improvement.length === 0) &&
        (!question.competencyAssessments ||
          question.competencyAssessments.length === 0) && (
          <div className="rounded-md bg-white p-4 text-center text-sm text-muted-foreground">
            No feedback available yet for this question.
          </div>
        )}
    </div>
  );
};

export default QuestionFeedback;
