"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/trpc/react";
import type { RecruiterSubmission } from "~/types/submission";
import ReviewInterface from "./components/ReviewInterface";

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params.id;

  const {
    data: submission,
    isLoading,
    error,
  } = api.submission.getById.useQuery(
    { id: submissionId },
    { enabled: !!submissionId, refetchOnWindowFocus: false },
  );

  // Log the submission data when it's loaded
  useEffect(() => {
    if (submission) {
      console.log("Loaded submission data:", submission);

      // Log recording metadata for each question
      submission.questions.forEach((question, index) => {
        console.log(
          `Question ${index + 1} recording:`,
          question.recordingMetadata,
        );
      });

      // Log environment variables
      console.log(
        "NEXT_PUBLIC_SUPABASE_URL:",
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      );
    }
  }, [submission]);

  if (isLoading) {
    return (
      <div className="animate-fade-in flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-verbo-purple" />
          <p className="text-sm text-muted-foreground">
            Loading submission details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="animate-fade-in min-h-screen bg-background">
        <div className="mx-auto w-full max-w-[1400px] px-8 pt-6">
          <Link
            href="/recruiter/submissions"
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to Submissions
          </Link>

          <div className="mt-6 rounded-lg border bg-white p-8 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-medium text-verbo-dark">
              Error Loading Submission
            </h2>
            <p className="text-muted-foreground">
              {error?.message ||
                "Failed to load submission details. Please try again later."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // We've already checked that submission is not null
  const submissionData = submission as RecruiterSubmission;

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1400px] px-8 pt-6">
        <Link
          href="/recruiter/submissions"
          className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Submissions
        </Link>

        <div className="mt-4">
          <ReviewInterface submission={submissionData} />
        </div>
      </div>
    </div>
  );
}
