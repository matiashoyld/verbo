import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ListChecks,
  MessageSquare,
  Video,
} from "lucide-react";
import React, { useState } from "react";
import QuestionFeedback from "./QuestionFeedback";
import VideoPlayer from "./VideoPlayer";

interface Question {
  id: string;
  question: string;
  context: string | null;
}

interface Feedback {
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
}

interface ReviewInterfaceProps {
  questions: Question[];
  feedback: Feedback[];
  recordings: Record<string, Blob>;
}

const ReviewInterface: React.FC<ReviewInterfaceProps> = ({
  questions,
  feedback = [],
  recordings = {},
}) => {
  const [activeQuestionId, setActiveQuestionId] = useState(
    questions[0]?.id || "",
  );
  const [activeTab, setActiveTab] = useState<"video" | "feedback">("feedback");

  // State to control mobile dropdown visibility
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // Find current question and feedback
  const currentQuestion = questions.find((q) => q.id === activeQuestionId);
  const currentFeedback = feedback.find(
    (f) => f.questionId === activeQuestionId,
  );
  const currentRecording = recordings[activeQuestionId];

  // Find current question index
  const currentIndex = questions.findIndex((q) => q.id === activeQuestionId);

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1 && questions[currentIndex + 1]) {
      setActiveQuestionId(questions[currentIndex + 1]?.id || "");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && questions[currentIndex - 1]) {
      setActiveQuestionId(questions[currentIndex - 1]?.id || "");
    }
  };

  // Calculate competency summary across all questions
  type CompetencyRecord = {
    competency_id: string;
    competency_name: string;
    level: number;
    rationale: string;
  };

  // Safely extract all competency assessments
  const allCompetencies: CompetencyRecord[] =
    feedback && feedback.length > 0
      ? feedback.flatMap((f) =>
          f.competency_assessments && Array.isArray(f.competency_assessments)
            ? f.competency_assessments.filter(
                (c) =>
                  c &&
                  typeof c.competency_id === "string" &&
                  typeof c.competency_name === "string" &&
                  typeof c.level === "number",
              )
            : [],
        )
      : [];

  // Group competencies by name and calculate average level
  type CompetencySummary = {
    name: string;
    competency_id: string;
    averageLevel: number;
    count: number;
  };

  const competencySummaries: CompetencySummary[] = [];

  // Aggregate by competency name
  const competencyMap = new Map<
    string,
    { total: number; count: number; id: string }
  >();

  for (const comp of allCompetencies) {
    const existing = competencyMap.get(comp.competency_name);
    if (existing) {
      existing.total += comp.level;
      existing.count += 1;
    } else {
      competencyMap.set(comp.competency_name, {
        total: comp.level,
        count: 1,
        id: comp.competency_id,
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

  // Sort by highest average level
  competencySummaries.sort((a, b) => b.averageLevel - a.averageLevel);

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <header className="mb-6">
          <h1 className="mb-1 text-2xl font-semibold">Assessment Review</h1>
          <p className="text-sm text-muted-foreground">
            Review your responses and feedback from the AI analysis
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Question selector sidebar (left) - hidden on mobile */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-16 overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="p-4">
                <h2 className="mb-2 text-sm font-medium">Questions</h2>
              </div>

              <div className="max-h-[calc(100vh-160px)] space-y-px overflow-y-auto">
                {questions.map((question, index) => (
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
                {/* Mobile dropdown selector for questions */}
                <div className="relative mb-4 block lg:hidden">
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-md bg-verbo-purple/10 p-3 text-sm text-verbo-purple"
                  >
                    <span>
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${mobileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {mobileDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                      {questions.map((question, index) => (
                        <button
                          key={question.id}
                          onClick={() => {
                            setActiveQuestionId(question.id);
                            setMobileDropdownOpen(false);
                          }}
                          className={`w-full p-3 text-left ${
                            activeQuestionId === question.id
                              ? "bg-verbo-purple/10 text-verbo-purple"
                              : "hover:bg-gray-50"
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
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="inline-block hidden rounded-md bg-verbo-purple/10 px-2 py-0.5 text-xs text-verbo-purple lg:inline">
                    Question {currentIndex + 1} of {questions.length}
                  </span>

                  <div className="hidden items-center space-x-2 lg:flex">
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
                        currentIndex < questions.length - 1
                          ? "text-verbo-purple hover:bg-verbo-purple/10"
                          : "cursor-not-allowed text-muted-foreground opacity-50"
                      }`}
                      disabled={currentIndex === questions.length - 1}
                    >
                      Next
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Question context in highlighted area (similar to submission page) */}
                {currentQuestion?.context && (
                  <div className="mb-4 mt-4 rounded-md bg-gray-50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {currentQuestion.context}
                    </p>
                  </div>
                )}

                <h2 className="text-sm font-medium">
                  {currentQuestion?.question}
                </h2>
              </div>
            </div>

            {/* Tabs for video and feedback */}
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
                  AI Feedback
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
                  Your Recording
                </button>
              </div>

              <div className="bg-gray-50 p-5">
                {activeTab === "video" ? (
                  <VideoPlayer
                    questionId={activeQuestionId}
                    recordingBlob={currentRecording}
                  />
                ) : (
                  <QuestionFeedback feedback={currentFeedback} />
                )}
              </div>
            </div>
          </div>

          {/* Competency summary sidebar (right) */}
          <div className="lg:col-span-3">
            <div className="sticky top-16 rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="mb-3 flex items-center text-sm font-medium">
                <ListChecks className="mr-1.5 h-4 w-4 text-verbo-purple/70" />
                Competency Summary
              </h2>

              {competencySummaries.length > 0 ? (
                <div className="space-y-3">
                  {competencySummaries.map((comp) => (
                    <div key={comp.competency_id} className="group">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium transition-colors group-hover:text-verbo-purple">
                          {comp.name}
                        </span>
                        <span className="w-16 rounded-full bg-verbo-purple/10 px-1.5 py-0.5 text-center text-[10px] text-verbo-purple">
                          Level {comp.averageLevel}/5
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-verbo-purple"
                          style={{ width: `${(comp.averageLevel / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  No competency data available yet
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
