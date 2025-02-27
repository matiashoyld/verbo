"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "~/trpc/react";

// Interface for code component props
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Define types that match the actual API response
type PositionQuestion = {
  id: string;
  question: string;
  context: string | null;
};

// This type is used by the API response
type Position = {
  id: string;
  title: string;
  jobDescription: string;
  context: string | null;
  creatorId?: string;
  creatorName?: string | null;
  createdAt?: string;
  questions: PositionQuestion[];
};

export default function CandidateSubmissionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Track the active question index
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Fetch position data from the database using tRPC
  const { data: position, isLoading } =
    api.positions.getPositionByIdPublic.useQuery(
      {
        id: params.id,
      },
      {
        enabled: !!params.id,
        refetchOnWindowFocus: false,
      },
    );

  // Set initial active question when data loads
  useEffect(() => {
    if (
      position?.questions &&
      position.questions.length > 0 &&
      !activeQuestionId
    ) {
      // Safely access the first question
      const firstQuestion = position.questions[0];
      if (firstQuestion) {
        setActiveQuestionId(firstQuestion.id);
      }
    }
  }, [position, activeQuestionId]);

  // Function to replace \n with actual newlines for markdown rendering
  const formatMarkdown = (text: string) => {
    // Handle both \n and \\n newline formats
    return text?.replace(/\\n/g, "\n") || "";
  };

  // Custom components for markdown rendering
  const MarkdownComponents: Components = {
    // Style headings
    h1: ({ ...props }) => (
      <h1
        className="mb-4 mt-6 text-base font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h2: ({ ...props }) => (
      <h2
        className="mb-3 mt-5 text-[15px] font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h3: ({ ...props }) => (
      <h3
        className="mb-2 mt-4 text-sm font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h4: ({ ...props }) => (
      <h4
        className="mb-2 mt-3 text-[13px] font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h5: ({ ...props }) => (
      <h5
        className="mb-2 mt-3 text-xs font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    h6: ({ ...props }) => (
      <h6
        className="mb-2 mt-3 text-xs font-medium text-verbo-dark last:mb-0"
        {...props}
      />
    ),
    // Style paragraphs
    p: ({ ...props }) => (
      <p className="mb-4 text-sm text-foreground/80 last:mb-0" {...props} />
    ),
    // Style links
    a: ({ ...props }) => (
      <a
        className="font-medium text-verbo-blue no-underline hover:underline"
        {...props}
      />
    ),
    // Style emphasis and strong
    em: ({ ...props }) => (
      <em className="italic text-foreground/80" {...props} />
    ),
    strong: ({ ...props }) => (
      <strong className="font-medium text-foreground/90" {...props} />
    ),
    // Style lists
    ul: ({ ...props }) => (
      <ul className="mb-4 list-disc pl-5 last:mb-0" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="mb-4 list-decimal pl-5 last:mb-0" {...props} />
    ),
    li: ({ ...props }) => (
      <li
        className="mb-2 text-sm text-foreground/80 marker:text-foreground last:mb-0"
        {...props}
      />
    ),
    // Style code blocks and inline code
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <code
          className={`my-4 block w-full overflow-visible whitespace-pre-wrap break-words rounded-md border border-border/10 bg-muted/20 p-3 text-sm font-medium last:mb-0 ${match[1] ? `language-${match[1]}` : ""}`}
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className="rounded bg-verbo-purple/5 px-1.5 py-0.5 text-sm font-medium text-verbo-purple/80"
          {...props}
        >
          {children}
        </code>
      );
    },
    // Style blockquotes
    blockquote: ({ ...props }) => (
      <blockquote
        className="my-4 border-l-2 border-verbo-purple/30 pl-4 text-foreground/70 last:mb-0"
        {...props}
      />
    ),
    // Style horizontal rules
    hr: ({ ...props }) => (
      <hr className="my-6 border-border/50 last:mb-0" {...props} />
    ),
    // Style tables
    table: ({ ...props }) => (
      <div className="my-5 w-full overflow-visible last:mb-0">
        <table
          className="w-full border-collapse border border-border/30 text-left text-sm"
          {...props}
        />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead className="bg-muted/30 text-foreground/90" {...props} />
    ),
    tbody: ({ ...props }) => <tbody {...props} />,
    tr: ({ ...props }) => (
      <tr className="border-b border-border/30 even:bg-muted/10" {...props} />
    ),
    th: ({ ...props }) => (
      <th
        className="break-words border border-border/30 p-2 text-xs font-medium"
        {...props}
      />
    ),
    td: ({ ...props }) => (
      <td
        className="whitespace-normal break-words border border-border/30 p-2 text-xs"
        {...props}
      />
    ),
    pre: ({ ...props }) => (
      <pre
        className="my-4 overflow-visible whitespace-pre-wrap rounded-md border border-border/10 bg-muted/20 p-0"
        {...props}
      />
    ),
  };

  // Redirect to login page if not signed in
  if (isLoaded && !isSignedIn) {
    router.push(`/candidate/position/${params.id}`);
    return null;
  }

  // Handle loading state
  if (isLoading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-verbo-purple" />
          <p className="text-verbo-dark">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Handle case where position is not found
  if (!position) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-verbo-dark to-verbo-purple p-4 text-white">
        <h1 className="mb-2 text-3xl font-bold">Position Not Found</h1>
        <p className="mb-6">
          The position you're looking for doesn't exist or is no longer
          available.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-verbo-green px-4 py-2 font-medium text-verbo-dark hover:bg-verbo-green/90"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Find the current question based on activeQuestionId
  const currentQuestion =
    position.questions.find((q) => q.id === activeQuestionId) ||
    (position.questions.length > 0 ? position.questions[0] : null);

  // If there are no questions, show a message
  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-4 text-center">
          <h2 className="text-xl font-bold text-verbo-dark">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            This position does not have any questions yet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-verbo-purple px-4 py-2 text-sm font-medium text-white"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Get the current question index for display
  const currentQuestionIndex = position.questions.findIndex(
    (q) => q.id === currentQuestion.id,
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-gray-50">
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Context */}
        <div className="w-2/5 overflow-y-auto border-r border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-xl font-bold text-verbo-dark">
            {position.title}
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Review and understand the assessment case and questions.
          </p>

          <div className="w-full space-y-4 overflow-visible whitespace-normal break-words text-sm">
            {position.context && (
              <div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {formatMarkdown(position.context)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Question and Notepad */}
        <div className="flex w-3/5 flex-col overflow-hidden">
          {/* Question tabs */}
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex space-x-3">
              {position.questions.map((question, index) => (
                <button
                  key={question.id}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeQuestionId === question.id
                      ? "bg-verbo-purple/10 text-verbo-purple"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveQuestionId(question.id)}
                >
                  Question {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question content */}
          <div className="max-h-[35vh] overflow-y-auto border-b border-gray-200 bg-white p-6">
            {/* Question context - highlighted area */}
            {currentQuestion.context && (
              <div className="mb-4 rounded-md bg-gray-50 p-4">
                <div className="flex items-start">
                  <div className="w-full overflow-visible whitespace-normal break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownComponents}
                    >
                      {formatMarkdown(currentQuestion.context)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            <h3 className="mb-3 text-base font-semibold text-verbo-dark">
              Question {currentQuestionIndex + 1}
            </h3>

            <div className="mb-4 w-full overflow-visible whitespace-normal break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {formatMarkdown(currentQuestion.question)}
              </ReactMarkdown>
            </div>
          </div>

          {/* Notepad/Codepad - Taking up all remaining space */}
          <div className="flex flex-1 flex-col overflow-hidden bg-gray-50 p-6">
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Solution
                  </span>
                </div>
              </div>
              <textarea
                className="w-full flex-1 resize-none p-4 font-mono text-sm text-gray-800 focus:outline-none"
                placeholder="Write your solution here..."
              ></textarea>
            </div>

            <div className="mt-5 flex justify-end space-x-4">
              <button className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Cancel
              </button>
              <button className="rounded-md bg-verbo-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-verbo-purple/90">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
