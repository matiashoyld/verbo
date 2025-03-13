"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Clock,
  Database,
  Loader2,
  Maximize2,
  MessageSquare,
  MinusCircle,
  Play,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuroraText } from "~/components/magicui/aurora-text";
import { BentoCard, BentoGrid } from "~/components/magicui/bento-grid";
import { InteractiveHoverButton } from "~/components/magicui/interactive-hover-button";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

// Function to create a sidebar navigation component
function SidebarNav({
  className,
  items,
  ...props
}: {
  className?: string;
  items: { href: string; title: string }[];
  [key: string]: unknown;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "transparent",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

// Recruiter Dashboard Content
function RecruiterDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <SidebarNav
              items={[
                { title: "Overview", href: "/" },
                { title: "Skills", href: "/skills" },
                { title: "Positions", href: "/positions" },
                { title: "Submissions", href: "/submissions" },
                { title: "Settings", href: "/settings" },
              ]}
            />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Active challenges in your pipeline
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Submissions in progress
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Completed in the last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    Across all assessments
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest assessment activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    No recent activity to display.
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                  <CardDescription>
                    Most assessed skills in your pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    No skills data available yet.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Candidate Dashboard Content - Placeholder for now
function CandidateDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <SidebarNav
              items={[
                { title: "My Challenges", href: "/" },
                { title: "Past Submissions", href: "/candidate/submissions" },
                { title: "Profile", href: "/candidate/profile" },
              ]}
            />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                My Challenges
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>No challenges yet</CardTitle>
                  <CardDescription>
                    Your assigned challenges will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Once a recruiter assigns you a challenge, you'll be able to
                  start it here.
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Loading indicator
function LoadingDashboard() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold">
          Loading your workspace...
        </h2>
        <div className="mx-auto h-2 w-24 animate-pulse rounded-full bg-verbo-purple"></div>
      </div>
    </div>
  );
}

// Marketing page components (existing code)
function BackgroundGradient() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#fff_100%)] dark:bg-gray-950 dark:[background:radial-gradient(125%_125%_at_50%_10%,#020617_40%,#020617_100%)]">
      <div className="bg-grid-black/[0.02] absolute inset-0 bg-[size:20px_20px]" />
    </div>
  );
}

function InteractiveDemo() {
  const [isRecording, setIsRecording] = useState(true);
  const [currentTime, setCurrentTime] = useState(235);
  const [activeQuestion, setActiveQuestion] = useState("Question 3");
  const [notes, setNotes] = useState("");
  const [showingAnalysis, setShowingAnalysis] = useState(false);
  const [showingResults, setShowingResults] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const questionsContainerRef = useRef<HTMLDivElement>(null);

  // Mock responses for questions 1 & 2 to give the impression they've been answered
  const [mockResponses] = useState({
    "Question 1": `SELECT 
  reel_id,
  SUM(CASE WHEN engagement_type = 'like' THEN 1 ELSE 0 END) AS total_likes,
  SUM(CASE WHEN engagement_type = 'comment' THEN 1 ELSE 0 END) AS total_comments,
  SUM(CASE WHEN engagement_type = 'share' THEN 1 ELSE 0 END) AS total_shares,
  SUM(CASE WHEN engagement_type = 'save' THEN 1 ELSE 0 END) AS total_saves,
  SUM(watch_time) / 60 AS total_watch_minutes
FROM reels_engagement
GROUP BY reel_id
ORDER BY total_watch_minutes DESC;`,
    "Question 2":
      "The top 5 reels with highest average watch time share several common characteristics. First, they all feature concise and attention-grabbing content in the first 3 seconds. Second, they utilize trending audio tracks. Third, they employ smooth transitions between scenes. Based on the data, optimal length appears to be 15-30 seconds, with a clear narrative structure. User demographic analysis shows these reels perform consistently across age groups, suggesting universal appeal factors rather than targeted content.",
  });

  // Get the appropriate notes for the current question
  const getCurrentNotes = () => {
    if (activeQuestion === "Question 1") return mockResponses["Question 1"];
    if (activeQuestion === "Question 2") return mockResponses["Question 2"];
    return notes; // For Question 3, return the user's input
  };

  // Update notes only for Question 3
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeQuestion === "Question 3") {
      setNotes(e.target.value);
    }
  };

  // Timer effect for recording time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Analysis progress effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (showingAnalysis && analysisProgress < 100) {
      interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          // Increase by larger random amount between 3-7% for faster animation
          const increment = Math.floor(Math.random() * 5) + 3;
          return Math.min(prev + increment, 100);
        });
      }, 100); // Shorter interval for faster updates
    }

    // When analysis reaches 100%, show results after a short delay
    if (showingAnalysis && analysisProgress === 100 && !showingResults) {
      const timeout = setTimeout(() => {
        setShowingAnalysis(false);
        setShowingResults(true);
      }, 800);

      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showingAnalysis, analysisProgress, showingResults]);

  // Different question content based on activeQuestion
  const renderQuestionContent = () => {
    switch (activeQuestion) {
      case "Question 1":
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-2">
              <p className="text-xs text-gray-500">
                Using the{" "}
                <span className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px]">
                  reels_engagement
                </span>{" "}
                table, analyze the overall engagement distribution.
              </p>
            </div>

            <h3 className="mb-1.5 text-sm font-semibold text-verbo-dark">
              Question 1
            </h3>

            <p className="text-xs text-gray-700">
              Write a SQL query to calculate the total number of 'likes',
              'comments', 'shares', and 'saves' for each{" "}
              <span className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px]">
                reel_id
              </span>
              . Additionally, calculate the total watch time in minutes.
            </p>
          </div>
        );
      case "Question 2":
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-2">
              <p className="text-xs text-gray-500">
                For this question, focus on user engagement patterns.
              </p>
            </div>

            <h3 className="mb-1.5 text-sm font-semibold text-verbo-dark">
              Question 2
            </h3>

            <p className="text-xs text-gray-700">
              Write a SQL query to identify the top 5 reels with the highest
              average watch time. Then explain what factors might contribute to
              these reels having higher engagement than others.
            </p>
          </div>
        );
      case "Question 3":
        return (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-2">
              <p className="text-xs text-gray-500">
                Final question about product recommendations.
              </p>
            </div>

            <h3 className="mb-1.5 text-sm font-semibold text-verbo-dark">
              Question 3
            </h3>

            <p className="text-xs text-gray-700">
              Based on the engagement data analysis, what three product
              recommendations would you make to increase user engagement with
              Reels? Support your recommendations with data-driven insights.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Analysis screen component
  const AnalysisScreen = () => {
    const totalQuestions = 3;
    const currentQuestionIndex = Math.min(
      Math.floor((analysisProgress / 100) * totalQuestions),
      totalQuestions - 1,
    );
    const completedQuestions = Math.min(
      Math.floor((analysisProgress / 100) * totalQuestions),
      totalQuestions,
    );

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
        <div className="w-[85%] max-w-xs">
          <div className="mb-4 text-center">
            <h1 className="mb-1 text-base font-semibold text-verbo-dark">
              Analyzing Your Assessment
            </h1>
            <p className="text-xs text-muted-foreground">
              Our AI is extracting and evaluating your skills
            </p>
          </div>

          <div className="mb-4 rounded-lg border bg-white p-4 shadow-md">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium">Progress</span>
              <span className="text-xs font-medium">
                {Math.round(analysisProgress)}%
              </span>
            </div>

            <div className="mb-4 h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-verbo-purple transition-all duration-300 ease-out"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>

            <div
              ref={questionsContainerRef}
              className="max-h-[180px] space-y-2 overflow-y-auto pr-1"
            >
              {Array.from({ length: totalQuestions })
                .filter((_, index) => index <= currentQuestionIndex)
                .map((_, index) => {
                  // Determine the state of each question
                  const isComplete = index < completedQuestions;
                  const isCurrent =
                    index === currentQuestionIndex && analysisProgress < 100;

                  return (
                    <div
                      key={index}
                      className={`relative flex items-center rounded-lg p-2 transition-all duration-300 ${
                        isComplete
                          ? "bg-verbo-purple/10"
                          : isCurrent
                            ? "border border-verbo-purple/20 bg-verbo-purple/5"
                            : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${
                          isComplete
                            ? "bg-verbo-purple text-white"
                            : isCurrent
                              ? "bg-verbo-purple/20 text-verbo-purple"
                              : "border bg-gray-50 text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <Sparkles className="h-3 w-3" />
                        ) : isCurrent ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className="text-[9px]">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium ${
                            isComplete
                              ? "text-foreground"
                              : isCurrent
                                ? "text-foreground"
                                : "text-muted-foreground"
                          }`}
                        >
                          Question {index + 1}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {isComplete
                            ? "Analysis complete"
                            : isCurrent
                              ? "Analyzing..."
                              : "Pending analysis"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            This may take a few moments as we analyze your responses.
          </p>
        </div>
      </div>
    );
  };

  // Mock skills data
  const skills = [
    { name: "SQL Query Writing", score: 92, confidence: "high" },
    { name: "Data Analysis", score: 87, confidence: "high" },
    { name: "Product Thinking", score: 78, confidence: "medium" },
    { name: "Technical Communication", score: 83, confidence: "medium" },
  ];

  // Results view component
  const ResultsView = () => {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

    // Assessment question titles and brief descriptions
    const questions = [
      {
        title: "SQL Query for Engagement",
        description: "Calculate engagement metrics for reels",
      },
      {
        title: "Engagement Analysis",
        description: "Identify factors affecting watch time",
      },
      {
        title: "Product Recommendations",
        description: "Provide data-driven product improvements",
      },
    ];

    // Mock analysis data
    const analysisData = [
      {
        overview:
          "Strong query structure with proper aggregation functions and grouping.",
        strengths: [
          "Efficient use of GROUP BY",
          "Complete calculation of all metrics",
          "Clean code organization",
        ],
        improvements: [
          "Could optimize for large datasets",
          "Consider additional engagement ratios",
        ],
      },
      {
        overview:
          "Good identification of patterns and analytical reasoning about engagement factors.",
        strengths: [
          "Data-driven insights",
          "Clear correlation analysis",
          "Logical conclusions",
        ],
        improvements: [
          "Could explore more demographic factors",
          "Additional visualization suggestions",
        ],
      },
      {
        overview:
          "Excellent product thinking with practical and innovative recommendations.",
        strengths: [
          "Recommendations tied directly to data",
          "Prioritization of features",
          "Business impact focus",
        ],
        improvements: [
          "Include implementation complexity",
          "Consider A/B testing approach",
        ],
      },
    ];

    // Safety check for index bounds with type assertions
    const currentQuestion = questions[selectedQuestionIndex] ?? questions[0];
    const currentAnalysis =
      analysisData[selectedQuestionIndex] ?? analysisData[0];

    type QuestionType = (typeof questions)[0];
    type AnalysisType = (typeof analysisData)[0];

    // Ensure we have valid objects even if something unexpected happens
    const safeQuestion: QuestionType = currentQuestion || {
      title: "Question",
      description: "Assessment question",
    };

    const safeAnalysis: AnalysisType = currentAnalysis || {
      overview: "Assessment completed",
      strengths: [],
      improvements: [],
    };

    return (
      <div className="absolute inset-0 flex flex-col bg-background">
        {/* Browser Chrome */}
        <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-1">
              <XCircle className="h-3 w-3 text-muted-foreground/60" />
              <MinusCircle className="h-3 w-3 text-muted-foreground/60" />
              <Maximize2 className="h-3 w-3 text-muted-foreground/60" />
            </div>
            <div className="ml-3 flex items-center gap-1 rounded-md bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Database className="h-2.5 w-2.5" />
              verbo.ai/assessment/results/ds-interview
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            Data Scientist, Product Analytics Assessment
          </div>
        </div>

        <div className="flex flex-1 divide-x overflow-hidden">
          {/* Questions selector - Left */}
          <div className="w-1/5 overflow-y-auto bg-white p-2">
            <h3 className="mb-2 text-xs font-semibold text-verbo-dark">
              Questions
            </h3>
            <div className="space-y-1.5">
              {questions.map((q, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedQuestionIndex(i)}
                  className={cn(
                    "cursor-pointer rounded-md p-1.5 transition-colors",
                    selectedQuestionIndex === i
                      ? "bg-verbo-purple/10 text-verbo-purple"
                      : "hover:bg-gray-50",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-medium",
                      selectedQuestionIndex === i
                        ? "text-verbo-purple"
                        : "text-verbo-dark",
                    )}
                  >
                    Question {i + 1}
                  </p>
                  <p className="line-clamp-1 text-[8px] text-muted-foreground">
                    {q.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-2">
              <p className="text-[10px] font-medium text-verbo-dark">
                Overall Score
              </p>
              <div className="mt-2 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-verbo-purple text-sm font-bold text-white">
                  85
                </div>
              </div>
              <p className="mt-1 text-center text-[9px] text-muted-foreground">
                Strong candidate
              </p>
            </div>
          </div>

          {/* Analysis panel - Center */}
          <div className="w-3/5 overflow-y-auto bg-white p-3">
            <div className="mb-3 space-y-1">
              <h3 className="text-sm font-semibold text-verbo-dark">
                Question {selectedQuestionIndex + 1}: {safeQuestion.title}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {selectedQuestionIndex === 0 &&
                  "Write a SQL query to calculate engagement metrics per reel."}
                {selectedQuestionIndex === 1 &&
                  "Identify top reels and explain factors contributing to high engagement."}
                {selectedQuestionIndex === 2 &&
                  "Recommend product improvements based on engagement data analysis."}
              </p>
            </div>

            <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50 p-2.5">
              <div className="mt-1.5 aspect-video w-full overflow-hidden rounded-md bg-black">
                {/* Mock video player */}
                <div className="relative h-full w-full">
                  {/* Video thumbnail - gradient background to simulate a paused video */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30">
                      <Play className="h-5 w-5 fill-white text-white" />
                    </div>
                  </div>

                  {/* Video controls */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2">
                    <div className="flex items-center gap-1.5">
                      <div className="border-t-3 border-b-3 h-0 w-0 border-l-4 border-b-transparent border-l-white border-t-transparent"></div>
                      <div className="h-1 w-24 rounded-full bg-white/30">
                        <div className="h-1 w-16 rounded-full bg-verbo-purple"></div>
                      </div>
                      <span className="text-[8px] text-white">2:14 / 3:27</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-[8px] text-white">1x</div>
                      <div className="text-[8px] text-white">HD</div>
                      <div className="h-3 w-3 rounded-sm border border-white"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[8px] text-gray-500">
                  Recorded {selectedQuestionIndex === 2 ? "today" : "yesterday"}
                </span>
                <span className="text-[8px] text-verbo-purple">
                  Watch full response
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-verbo-purple/10 bg-verbo-purple/5 p-2.5">
                <p className="text-[10px] font-medium text-verbo-purple">
                  AI Assessment Overview
                </p>
                <p className="mt-1 text-[9px] text-gray-600">
                  {safeAnalysis.overview}
                </p>
              </div>

              <div className="rounded-lg border border-verbo-green/10 bg-verbo-green/5 p-2.5">
                <p className="text-[10px] font-medium text-verbo-green">
                  Strengths
                </p>
                <ul className="mt-1 space-y-1 pl-3">
                  {safeAnalysis.strengths.map((strength, i) => (
                    <li key={i} className="list-disc text-[9px] text-gray-600">
                      {strength}
                      <span className="ml-1 text-[8px] text-verbo-green">
                        [
                        {selectedQuestionIndex === 0
                          ? "0:42"
                          : selectedQuestionIndex === 1
                            ? "1:13"
                            : "0:58"}
                        {i === 0 ? "" : i === 1 ? ", 2:05" : ", 2:37"}]
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-2.5">
                <p className="text-[10px] font-medium text-verbo-blue">
                  Areas for Improvement
                </p>
                <ul className="mt-1 space-y-1 pl-3">
                  {safeAnalysis.improvements.map((improvement, i) => (
                    <li key={i} className="list-disc text-[9px] text-gray-600">
                      {improvement}
                      <span className="ml-1 text-[8px] text-verbo-blue">
                        [
                        {selectedQuestionIndex === 0
                          ? "1:57"
                          : selectedQuestionIndex === 1
                            ? "2:36"
                            : "2:19"}
                        {i === 0 ? "" : ", 3:01"}]
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-gray-100 p-2.5">
                <p className="text-[10px] font-medium text-verbo-dark">
                  Video Analysis
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <div className="flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                    <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[8px] text-gray-700">
                      Confident tone (85%)
                    </span>
                  </div>
                  <div className="flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                    <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[8px] text-gray-700">
                      Clear articulation (92%)
                    </span>
                  </div>
                  <div className="flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                    <div className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                    <span className="text-[8px] text-gray-700">
                      Eye contact (67%)
                    </span>
                  </div>
                  <div className="flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                    <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[8px] text-gray-700">
                      Engagement (78%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills panel - Right */}
          <div className="w-1/5 overflow-y-auto bg-white p-2">
            <h3 className="mb-2 text-xs font-semibold text-verbo-dark">
              Skills Assessment
            </h3>
            <div className="space-y-2.5">
              {skills.map((skill, i) => (
                <div key={i} className="rounded-lg border border-gray-100 p-2">
                  <p className="text-[10px] font-medium text-verbo-dark">
                    {skill.name}
                  </p>

                  {/* 5-star rating system */}
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={cn(
                            "mr-0.5 h-2 w-2 rounded-full",
                            star <= Math.round(skill.score / 20)
                              ? "bg-verbo-purple"
                              : "bg-gray-200",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[8px] font-medium text-gray-500">
                      {Math.round(skill.score / 20)}/5
                    </span>
                  </div>

                  <p className="mt-1.5 text-right text-[8px] text-muted-foreground">
                    {skill.confidence} confidence
                  </p>
                </div>
              ))}

              {/* Related skills */}
              <div className="mt-1 space-y-1">
                <p className="text-[10px] font-medium text-verbo-dark">
                  Related Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Data Visualization",
                    "Analytical Thinking",
                    "Problem Solving",
                    "Business Acumen",
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[8px] font-medium text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                className="h-6 bg-verbo-purple px-3 py-0 text-[9px] text-white hover:bg-verbo-purple/90"
                onClick={() => {
                  // Reset the demo state
                  setShowingResults(false);
                  setShowingAnalysis(false);
                  setAnalysisProgress(0);
                  setActiveQuestion("Question 1");
                  setNotes("");
                }}
              >
                Return to Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-lg border bg-background/60 shadow-xl backdrop-blur-sm">
      {/* Browser Chrome */}
      <div className="flex items-center justify-between rounded-t-lg border-b bg-muted/50 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <XCircle className="h-3 w-3 text-muted-foreground/60" />
            <MinusCircle className="h-3 w-3 text-muted-foreground/60" />
            <Maximize2 className="h-3 w-3 text-muted-foreground/60" />
          </div>
          <div className="ml-3 flex items-center gap-1 rounded-md bg-background/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Database className="h-2.5 w-2.5" />
            verbo.ai/assessment/position/...
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Always show recording status but style differently when not recording */}
          <div
            className={`flex items-center gap-1 rounded-md ${isRecording ? "bg-red-500/10 px-1.5 py-0.5" : "px-1 py-0.5"}`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${isRecording ? "animate-pulse bg-red-500" : "bg-gray-300"}`}
            />
            <span
              className={`text-[10px] font-medium ${isRecording ? "text-red-500" : "text-gray-400"}`}
            >
              {isRecording ? "Recording" : "Not recording"}
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-muted-foreground"
          >
            {Math.floor(currentTime / 60)}:
            {(currentTime % 60).toString().padStart(2, "0")}
          </motion.div>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="flex h-[420px] divide-x">
        {/* Left Panel - Context */}
        <div className="w-2/5 overflow-y-auto rounded-bl-lg border-r border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-base font-bold text-verbo-dark">
            Data Scientist, Product Analytics
          </h2>
          <p className="mb-3 text-xs text-gray-600">
            Review and understand the assessment case and questions.
          </p>

          <div className="space-y-3">
            <p className="text-xs text-gray-700">
              You are a Data Scientist at Instagram, focusing on Reels.
              Instagram Reels is a short-form video feature designed to
              entertain and engage users. You are tasked with analyzing user
              engagement patterns to inform product decisions and growth
              strategies.
            </p>

            <div className="rounded-lg border bg-gray-50 p-3">
              <p className="text-xs font-medium">Table: reels_engagement</p>
              <table className="mt-1.5 w-full text-[10px]">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-1 pr-2">Column</th>
                    <th className="pb-1 pr-2">Description</th>
                    <th className="pb-1">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-1 pr-2">reel_id</td>
                    <td className="py-1 pr-2">Unique identifier for Reel</td>
                    <td className="py-1">VARCHAR</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-1 pr-2">user_id</td>
                    <td className="py-1 pr-2">User identifier</td>
                    <td className="py-1">INT</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-1 pr-2">engagement_type</td>
                    <td className="py-1 pr-2">Like, comment, share, etc.</td>
                    <td className="py-1">VARCHAR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right panel - Question and Notepad */}
        <div className="flex w-3/5 flex-col overflow-hidden rounded-br-lg">
          {/* Question tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              {["Question 1", "Question 2", "Question 3"].map((question) => (
                <button
                  key={question}
                  onClick={() => setActiveQuestion(question)}
                  className={`flex items-center px-4 py-2 text-xs font-medium transition-colors ${
                    activeQuestion === question
                      ? "bg-verbo-purple/10 text-verbo-purple"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Question content - Dynamic based on active question */}
          <div className="p-4">{renderQuestionContent()}</div>

          {/* Notes section */}
          <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <h4 className="text-xs font-medium text-gray-700">Notes</h4>
            </div>
            <div className="flex-1 rounded-md border border-gray-200 bg-white p-2">
              <textarea
                value={getCurrentNotes()}
                onChange={handleNotesChange}
                placeholder="If you need, you can take notes here..."
                className="h-full w-full resize-none border-0 bg-transparent p-0 text-xs text-gray-700 focus:outline-none focus:ring-0"
              />
            </div>

            {/* Recording controls */}
            <div className="mt-3 flex items-center justify-between">
              {/* Recording indicator - Always visible */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className={`h-2 w-2 rounded-full ${isRecording ? "animate-pulse bg-red-500" : "bg-gray-300"}`}
                  />
                  <span className="text-[10px] font-medium text-gray-700">
                    {isRecording
                      ? "Screen and audio recording in progress"
                      : "Click to start recording"}
                  </span>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 py-0 text-xs text-gray-600"
                  disabled={activeQuestion === "Question 1"}
                  onClick={() => {
                    if (activeQuestion === "Question 2") {
                      setActiveQuestion("Question 1");
                    } else if (activeQuestion === "Question 3") {
                      setActiveQuestion("Question 2");
                    }
                  }}
                >
                  Back
                </Button>

                <Button
                  variant={
                    activeQuestion === "Question 3" ? "default" : "outline"
                  }
                  size="sm"
                  className={`h-7 px-2 py-0 text-xs ${
                    activeQuestion === "Question 3"
                      ? "bg-verbo-purple hover:bg-verbo-purple/90"
                      : ""
                  }`}
                  onClick={() => {
                    if (activeQuestion === "Question 1") {
                      setActiveQuestion("Question 2");
                    } else if (activeQuestion === "Question 2") {
                      setActiveQuestion("Question 3");
                    } else if (activeQuestion === "Question 3") {
                      // Show the analysis screen when submitting
                      setIsRecording(false);
                      setShowingAnalysis(true);
                      setAnalysisProgress(0);
                    }
                  }}
                >
                  {activeQuestion === "Question 3" ? "Submit" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Screen */}
      {showingAnalysis && <AnalysisScreen />}

      {/* Results View */}
      {showingResults && <ResultsView />}
    </div>
  );
}

export default function Page() {
  const { isLoaded, isSignedIn } = useAuth();

  // Query to fetch the user's role from the database
  const { data: userData, isLoading: isLoadingUser } =
    api.user.getUserRole.useQuery(
      undefined, // No parameters needed
      { enabled: isLoaded && isSignedIn }, // Only run the query if the user is signed in
    );

  // If the user is signed in, render the appropriate dashboard based on their role
  if (isLoaded && isSignedIn) {
    // If we're still loading the user data, show a loading indicator
    if (isLoadingUser || !userData) {
      return <LoadingDashboard />;
    }

    // Show content based on user role
    if (userData.role === "RECRUITER") {
      return <RecruiterDashboard />;
    } else if (userData.role === "CANDIDATE") {
      return <CandidateDashboard />;
    } else {
      // Fallback if role is not recognized
      return <LoadingDashboard />;
    }
  }

  // If the user is not signed in, show the marketing page
  return (
    <div className="relative min-h-screen pb-10">
      <BackgroundGradient />

      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="mb-4 inline-block rounded-full bg-verbo-purple/10 px-3 py-1 text-sm text-verbo-purple">
              Now in private beta
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              <AuroraText>AI-Powered Skill Assessments</AuroraText>
              <span className="mt-2 block">for Modern Hiring</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Replace hours of interviews with accurate, consistent, and
              scalable skill assessments. Get deeper insights with less effort.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/sign-up">
                <InteractiveHoverButton className="bg-verbo-purple text-white hover:bg-verbo-purple/90">
                  Get Started
                </InteractiveHoverButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-10 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <InteractiveDemo />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Built for recruiters, backed by AI
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-muted-foreground">
            Transform your hiring process with consistent, thorough skill
            assessments that scale with your needs.
          </p>
          <BentoGrid className="mx-auto max-w-5xl">
            <BentoCard
              name="Realistic Challenges"
              description="Put candidates in real-world scenarios that accurately test their skills, not just their interview abilities."
              Icon={MessageSquare}
              className="md:col-span-2"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-purple/10 to-verbo-green/5"></div>
              }
            />
            <BentoCard
              name="AI-Guided Interviews"
              description="Our AI guides candidates through challenges, adapting to their responses in real-time."
              Icon={Brain}
              className="col-span-1"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-blue/10 to-verbo-purple/5"></div>
              }
            />
            <BentoCard
              name="Time Efficiency"
              description="Replace hours of technical interviews with automated assessments that are just as insightful."
              Icon={Clock}
              className="col-span-1"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-green/10 to-verbo-blue/5"></div>
              }
            />
            <BentoCard
              name="Candidate Insights"
              description="Deep, structured analysis of candidate skills, with specific evidence and clear scoring."
              Icon={Database}
              className="md:col-span-2"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-dark/10 to-verbo-purple/5"></div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl rounded-lg bg-muted p-8 text-center md:p-12">
            <h3 className="mb-2 text-2xl font-bold md:text-3xl">
              Ready to transform your hiring process?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Join the companies already saving hundreds of interview hours per
              month.
            </p>
            <Link href="/sign-up">
              <Button className="h-11 bg-verbo-purple px-8 text-white hover:bg-verbo-purple/90">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
