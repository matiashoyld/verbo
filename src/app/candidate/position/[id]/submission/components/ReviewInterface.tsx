import {
  ArrowLeft,
  ArrowRight,
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
  skills_demonstrated: string[];
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

  // Calculate skills summary across all questions
  const allSkills =
    feedback && feedback.length > 0
      ? feedback.flatMap((f) => f.skills_demonstrated || [])
      : [];

  const skillsCount = allSkills.reduce(
    (acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Sort skills by frequency
  const sortedSkills = Object.entries(skillsCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 6); // Show only top 6 skills

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold">Assessment Review</h1>
          <p className="text-muted-foreground">
            Review your responses and feedback from the AI analysis
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Question selector sidebar (left) - Now with sticky positioning */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="p-5 pb-3">
                <h2 className="mb-3 text-lg font-medium">Questions</h2>
              </div>

              <div className="max-h-[calc(100vh-140px)] space-y-px overflow-y-auto">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setActiveQuestionId(question.id)}
                    className={`w-full p-4 text-left transition-colors ${
                      activeQuestionId === question.id
                        ? "border-l-2 border-verbo-purple bg-verbo-purple/10"
                        : "border-l-2 border-transparent hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          activeQuestionId === question.id
                            ? "bg-verbo-purple text-white"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 truncate text-sm">
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
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-md bg-verbo-purple/10 px-2 py-1 text-xs text-verbo-purple">
                    Question {currentIndex + 1} of {questions.length}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrev}
                      className={`flex items-center rounded-lg px-3 py-1.5 text-sm ${
                        currentIndex > 0
                          ? "text-verbo-purple hover:bg-verbo-purple/10"
                          : "cursor-not-allowed text-muted-foreground opacity-50"
                      }`}
                      disabled={currentIndex === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </button>

                    <button
                      onClick={handleNext}
                      className={`flex items-center rounded-lg px-3 py-1.5 text-sm ${
                        currentIndex < questions.length - 1
                          ? "text-verbo-purple hover:bg-verbo-purple/10"
                          : "cursor-not-allowed text-muted-foreground opacity-50"
                      }`}
                      disabled={currentIndex === questions.length - 1}
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h2 className="mb-2 mt-4 text-xl font-medium">
                  {currentQuestion?.question}
                </h2>
                {currentQuestion?.context && (
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.context}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs for video and feedback */}
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`flex items-center px-6 py-4 text-sm font-medium ${
                    activeTab === "feedback"
                      ? "border-b-2 border-verbo-purple text-verbo-purple"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  AI Feedback
                </button>

                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex items-center px-6 py-4 text-sm font-medium ${
                    activeTab === "video"
                      ? "border-b-2 border-verbo-purple text-verbo-purple"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Your Recording
                </button>
              </div>

              <div className="bg-gray-50 p-6">
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

          {/* Skills summary sidebar (right) */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center text-lg font-medium">
                <ListChecks className="mr-2 h-5 w-5 text-verbo-purple/70" />
                Skills Summary
              </h2>

              {sortedSkills.length > 0 ? (
                <div className="space-y-3">
                  {sortedSkills.map(([skill, count]) => (
                    <div key={skill} className="group">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium transition-colors group-hover:text-verbo-purple">
                          {skill}
                        </span>
                        <span className="rounded-full bg-verbo-purple/10 px-2 py-0.5 text-xs text-verbo-purple">
                          {count}×
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className="h-1.5 rounded-full bg-verbo-purple transition-all duration-500 group-hover:opacity-80"
                          style={{
                            width: `${(count / questions.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No skills analysis available yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewInterface;
