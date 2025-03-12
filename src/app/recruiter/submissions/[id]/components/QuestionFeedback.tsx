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

interface SkillLevelProps {
  level: number;
  maxLevel: number;
}

const SkillLevel: React.FC<SkillLevelProps> = ({ level, maxLevel = 5 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxLevel }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 w-2 rounded-full ${
            idx < level ? "bg-verbo-purple" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

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
          <h3 className="mb-2 text-sm font-medium text-green-600">
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {question.strengths.map((strength, index) => (
              <li key={index} className="flex text-sm">
                <span className="mr-2 mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check className="h-3 w-3" />
                </span>
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
            <h3 className="mb-2 text-sm font-medium text-amber-600">
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {question.areas_of_improvement.map((area, index) => (
                <li key={index} className="flex text-sm">
                  <span className="mr-2 mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Competency assessments section */}
      {question.competencyAssessments &&
        question.competencyAssessments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-verbo-dark">
              Competency Assessments
            </h3>
            {question.competencyAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="rounded-md bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">
                      {assessment.questionCompetency.competency.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {assessment.questionCompetency.competency.skill.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SkillLevel level={assessment.level} maxLevel={5} />
                    <span className="text-xs font-medium text-verbo-purple">
                      Level {assessment.level}/5
                    </span>
                  </div>
                </div>
                <p className="text-sm">{assessment.rationale}</p>
              </div>
            ))}
          </div>
        )}

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
