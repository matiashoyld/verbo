import type { SubmissionStatus } from "@prisma/client";
import {
  ArrowLeft,
  ArrowRight,
  ListChecks,
  MessageSquare,
  Video,
} from "lucide-react";
import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { RecruiterSubmission } from "~/types/submission";
import QuestionFeedback from "./QuestionFeedback";
import VideoPlayer from "./VideoPlayer";

// Utility functions moved from utils.ts

// Compute the actual submission status based on answered questions
export function computeSubmissionStatus(
  submission: RecruiterSubmission,
): SubmissionStatus {
  // If the database already has it marked as FAILED, keep it
  if (submission.status === "FAILED") {
    return "FAILED";
  }

  // Count total position questions
  const totalPositionQuestions = submission.position.questions?.length || 0;

  // Count completed questions (with processed recordings)
  const completedQuestions = submission.questions.filter(
    (question) => question.recordingMetadata?.processed === true,
  ).length;

  // If all questions have been answered and processed, it's complete
  if (
    totalPositionQuestions > 0 &&
    completedQuestions === totalPositionQuestions
  ) {
    return "COMPLETED";
  }

  // Otherwise, it's still in progress
  return "IN_PROGRESS";
}

interface ReviewInterfaceProps {
  submission: RecruiterSubmission;
}

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

interface CompetencySummary {
  name: string;
  competency_id: string;
  averageLevel: number;
  count: number;
}

interface SkillSummary {
  id: string;
  name: string;
  averageLevel: number;
  competencyCount: number;
  competencies?: Array<{
    id: string;
    name: string;
    level: number;
  }>;
}

const ReviewInterface: React.FC<ReviewInterfaceProps> = ({ submission }) => {
  // Extract questions from submission
  const questions = submission.questions;

  // Sort questions - completed ones first
  const sortedQuestions = [...questions].sort((a, b) => {
    // Move processed questions to the top
    if (a.recordingMetadata?.processed && !b.recordingMetadata?.processed)
      return -1;
    if (!a.recordingMetadata?.processed && b.recordingMetadata?.processed)
      return 1;
    return 0;
  });

  const [activeQuestionId, setActiveQuestionId] = useState(
    sortedQuestions[0]?.id || "",
  );
  const [activeTab, setActiveTab] = useState<
    "feedback" | "competencies" | "video"
  >("feedback");

  // Find current question and feedback
  const currentQuestion = sortedQuestions.find(
    (q) => q.id === activeQuestionId,
  );

  // Find current question index
  const currentIndex = sortedQuestions.findIndex(
    (q) => q.id === activeQuestionId,
  );

  // Navigation handlers
  const handleNext = () => {
    if (
      currentIndex < sortedQuestions.length - 1 &&
      sortedQuestions[currentIndex + 1]
    ) {
      setActiveQuestionId(sortedQuestions[currentIndex + 1]?.id || "");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && sortedQuestions[currentIndex - 1]) {
      setActiveQuestionId(sortedQuestions[currentIndex - 1]?.id || "");
    }
  };

  // Get competency assessments for the current question
  const currentCompetencyAssessments = currentQuestion
    ? (currentQuestion.competencyAssessments as unknown as CompetencyAssessment[]) ||
      []
    : [];

  // Calculate competency summary across all questions
  // Safely extract all competency assessments
  const allCompetencies: CompetencyAssessment[] = sortedQuestions.flatMap(
    (q) => {
      const assessments =
        q.competencyAssessments as unknown as CompetencyAssessment[];
      return assessments && Array.isArray(assessments) ? assessments : [];
    },
  );

  // Group competencies by name and calculate average level
  const competencySummaries: CompetencySummary[] = [];

  // Aggregate by competency name
  const competencyMap = new Map<
    string,
    { total: number; count: number; id: string }
  >();

  for (const comp of allCompetencies) {
    if (
      !comp ||
      !comp.questionCompetency ||
      !comp.questionCompetency.competency
    )
      continue;

    const name = comp.questionCompetency.competency.name;
    const existing = competencyMap.get(name);

    if (existing) {
      existing.total += comp.level;
      existing.count += 1;
    } else {
      competencyMap.set(name, {
        total: comp.level,
        count: 1,
        id: comp.questionCompetency.competency.id,
      });
    }
  }

  // Calculate averages and sort
  for (const [name, data] of competencyMap.entries()) {
    competencySummaries.push({
      name,
      competency_id: data.id,
      averageLevel: Number((data.total / data.count).toFixed(1)),
      count: data.count,
    });
  }

  // Group competencies by skill
  const skillMap = new Map<
    string,
    {
      id: string;
      name: string;
      totalLevel: number;
      competencyCount: number;
      assessmentCount: number;
      competenciesSeen: Set<string>;
      competencies: Map<
        string,
        {
          id: string;
          name: string;
          totalLevel: number;
          count: number;
        }
      >;
    }
  >();

  for (const comp of allCompetencies) {
    if (
      !comp ||
      !comp.questionCompetency ||
      !comp.questionCompetency.competency ||
      !comp.questionCompetency.competency.skill
    )
      continue;

    const skill = comp.questionCompetency.competency.skill;
    const skillId = skill.id;
    const skillName = skill.name;
    const competency = comp.questionCompetency.competency;
    const competencyId = competency.id;
    const competencyName = competency.name;

    const existing = skillMap.get(skillId);

    if (existing) {
      existing.totalLevel += comp.level;
      existing.assessmentCount += 1;

      // Check if we've already seen this competency
      if (!existing.competenciesSeen.has(competencyId)) {
        existing.competencyCount += 1;
        existing.competenciesSeen.add(competencyId);

        // Add new competency to our tracking
        existing.competencies.set(competencyId, {
          id: competencyId,
          name: competencyName,
          totalLevel: comp.level,
          count: 1,
        });
      } else {
        // Update existing competency data
        const existingComp = existing.competencies.get(competencyId);
        if (existingComp) {
          existingComp.totalLevel += comp.level;
          existingComp.count += 1;
        }
      }
    } else {
      // Create new skill entry with first competency
      const competenciesMap = new Map();
      competenciesMap.set(competencyId, {
        id: competencyId,
        name: competencyName,
        totalLevel: comp.level,
        count: 1,
      });

      skillMap.set(skillId, {
        id: skillId,
        name: skillName,
        totalLevel: comp.level,
        competencyCount: 1,
        assessmentCount: 1,
        competenciesSeen: new Set([competencyId]),
        competencies: competenciesMap,
      });
    }
  }

  // Calculate skill summaries
  const skillSummaries: SkillSummary[] = [];

  for (const [skillId, data] of skillMap.entries()) {
    // Calculate average for each competency
    const competenciesArray = Array.from(data.competencies.values()).map(
      (comp) => ({
        id: comp.id,
        name: comp.name,
        level: Number((comp.totalLevel / comp.count).toFixed(1)),
      }),
    );

    // Sort by highest level
    competenciesArray.sort((a, b) => b.level - a.level);

    skillSummaries.push({
      id: skillId,
      name: data.name,
      averageLevel: Number((data.totalLevel / data.assessmentCount).toFixed(1)),
      competencyCount: data.competencyCount,
      competencies: competenciesArray,
    });
  }

  // Sort by highest average level
  skillSummaries.sort((a, b) => b.averageLevel - a.averageLevel);

  // Original competency sort
  competencySummaries.sort((a, b) => b.averageLevel - a.averageLevel);

  if (sortedQuestions.length === 0) {
    return (
      <div className="animate-fade-in bg-background">
        <div className="w-full max-w-[1400px]">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-center text-muted-foreground">
              No questions have been answered for this submission yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render the competency assessment tab content
  const renderCompetencyAssessments = () => {
    if (
      !currentCompetencyAssessments ||
      currentCompetencyAssessments.length === 0
    ) {
      return (
        <div className="rounded-md bg-white p-4 text-center text-sm text-muted-foreground">
          No competency assessments available for this question yet.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {currentCompetencyAssessments.map((assessment) => (
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
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-2 rounded-full ${
                        idx < assessment.level
                          ? "bg-verbo-purple"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-verbo-purple">
                  Level {assessment.level}/5
                </span>
              </div>
            </div>
            <p className="text-sm">{assessment.rationale}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <div className="mt-4 w-full max-w-[1400px]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Question selector sidebar (left) - Now with sticky positioning */}
          <div className="lg:col-span-2">
            <div className="sticky top-16 overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="p-4">
                <h2 className="mb-2 text-sm font-medium">Questions</h2>
              </div>

              <div className="max-h-[calc(100vh-160px)] space-y-px overflow-y-auto">
                {sortedQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setActiveQuestionId(question.id)}
                    className={`w-full p-3 text-left transition-colors ${
                      activeQuestionId === question.id
                        ? "border-l-2 border-verbo-purple bg-verbo-purple/10"
                        : "border-l-2 border-transparent hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`mr-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${
                          activeQuestionId === question.id
                            ? "bg-verbo-purple text-white"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 truncate text-xs">
                        Question {index + 1}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area (middle) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Question display with inline navigation buttons */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-md bg-verbo-purple/10 px-2 py-0.5 text-xs text-verbo-purple">
                    Question {currentIndex + 1} of {sortedQuestions.length}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrev}
                      className={`flex items-center rounded-lg px-2 py-1 text-xs ${
                        currentIndex > 0
                          ? "text-verbo-purple hover:bg-verbo-purple/10"
                          : "cursor-not-allowed text-muted-foreground opacity-50"
                      }`}
                      disabled={currentIndex === 0}
                    >
                      <ArrowLeft className="mr-1 h-3 w-3" />
                      Previous
                    </button>

                    <button
                      onClick={handleNext}
                      className={`flex items-center rounded-lg px-2 py-1 text-xs ${
                        currentIndex < sortedQuestions.length - 1
                          ? "text-verbo-purple hover:bg-verbo-purple/10"
                          : "cursor-not-allowed text-muted-foreground opacity-50"
                      }`}
                      disabled={currentIndex === sortedQuestions.length - 1}
                    >
                      Next
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Question context in highlighted area */}
                {currentQuestion?.positionQuestion.context && (
                  <div className="mb-4 mt-4 rounded-md bg-gray-50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {currentQuestion.positionQuestion.context}
                    </p>
                  </div>
                )}

                <h2 className="text-sm font-medium">
                  {currentQuestion?.positionQuestion.question}
                </h2>
              </div>
            </div>

            {/* Tabs for video, feedback, and competencies */}
            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`flex items-center px-5 py-4 text-xs font-medium ${
                    activeTab === "feedback"
                      ? "border-b-2 border-verbo-purple text-verbo-purple"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="mr-1.5 h-3 w-3" />
                  Overall Feedback
                </button>

                <button
                  onClick={() => setActiveTab("competencies")}
                  className={`flex items-center px-5 py-4 text-xs font-medium ${
                    activeTab === "competencies"
                      ? "border-b-2 border-verbo-purple text-verbo-purple"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListChecks className="mr-1.5 h-3 w-3" />
                  Competencies
                </button>

                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex items-center px-5 py-4 text-xs font-medium ${
                    activeTab === "video"
                      ? "border-b-2 border-verbo-purple text-verbo-purple"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="mr-1.5 h-3 w-3" />
                  Recording
                </button>
              </div>

              <div className="bg-gray-50 p-5">
                {activeTab === "video" ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <VideoPlayer
                      recordingFilePath={
                        currentQuestion?.recordingMetadata?.filePath
                      }
                    />
                  </div>
                ) : activeTab === "competencies" ? (
                  renderCompetencyAssessments()
                ) : (
                  <QuestionFeedback question={currentQuestion} />
                )}
              </div>
            </div>
          </div>

          {/* Competency summary sidebar (right) */}
          <div className="lg:col-span-3">
            <div className="sticky top-16 rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="mb-3 flex items-center text-sm font-medium">
                <ListChecks className="mr-1.5 h-4 w-4 text-verbo-purple/70" />
                Skills Summary
              </h2>

              {skillSummaries.length > 0 ? (
                <div className="space-y-4">
                  {skillSummaries.map((skill) => (
                    <div key={skill.id} className="group">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium transition-colors group-hover:text-verbo-purple">
                          {skill.name}
                        </span>
                        <span className="w-16 rounded-full bg-verbo-purple/10 px-1.5 py-0.5 text-center text-[10px] text-verbo-purple">
                          Level {skill.averageLevel}/5
                        </span>
                      </div>
                      <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-verbo-purple"
                          style={{
                            width: `${(skill.averageLevel / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="cursor-help text-[10px] text-muted-foreground transition-colors hover:text-verbo-purple">
                              Based on {skill.competencyCount}{" "}
                              {skill.competencyCount === 1
                                ? "competency"
                                : "competencies"}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="max-w-[280px] overflow-hidden rounded-lg border border-gray-100 bg-white p-0 shadow-md"
                          >
                            <div className="p-3">
                              <h4 className="mb-2 border-b pb-1 text-xs font-medium text-foreground">
                                {skill.name} Competencies
                              </h4>
                              <div className="space-y-2">
                                {skill.competencies?.map((comp) => (
                                  <div
                                    key={comp.id}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {comp.name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map(
                                          (_, i) => (
                                            <div
                                              key={i}
                                              className={`h-1.5 w-1.5 rounded-full ${
                                                i < comp.level
                                                  ? "bg-verbo-purple"
                                                  : "bg-gray-200"
                                              }`}
                                            />
                                          ),
                                        )}
                                      </div>
                                      <span className="text-[10px] font-medium text-verbo-dark">
                                        {comp.level}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  No skill data available yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewInterface;
