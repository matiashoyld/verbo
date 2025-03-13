import type { SubmissionStatus } from "@prisma/client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import type { RecruiterSubmission } from "~/types/submission";

// Format date relative to now (e.g., "2 hours ago", "5 minutes ago")
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
}

// Format duration from start to end in MM:SS format
export function formatDuration(start: Date, end?: Date | null): string {
  if (!end) {
    // For in-progress submissions, calculate duration from start until now
    end = new Date();
  }

  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Get color classes for different submission statuses
export function getStatusClasses(status: SubmissionStatus): {
  bgColor: string;
  textColor: string;
} {
  switch (status) {
    case "IN_PROGRESS":
      return {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
      };
    case "COMPLETED":
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      };
    case "FAILED":
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      };
    default:
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
      };
  }
}

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

  // Count completed questions (with completed recordings)
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

export function SubmissionList() {
  const { data: submissions, isLoading } =
    api.submission.getAllForRecruiter.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="mb-4 h-10 rounded bg-gray-200"></div>
            <div className="h-20 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No submissions found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              // Compute the actual status
              const computedStatus = computeSubmissionStatus(submission);
              const { bgColor, textColor } = getStatusClasses(computedStatus);

              // Calculate completion percentage
              const totalQuestions = submission.position.questions?.length || 0;
              const completedQuestions = submission.questions.filter(
                (q) => q.recordingMetadata?.processed === true,
              ).length;
              const completionPercent =
                totalQuestions > 0
                  ? Math.round((completedQuestions / totalQuestions) * 100)
                  : 0;

              return (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.candidate.name || submission.candidate.email}
                  </TableCell>
                  <TableCell>{submission.position.title}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}
                    >
                      {computedStatus === "IN_PROGRESS"
                        ? "In Progress"
                        : computedStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatRelativeTime(submission.startedAt)}
                  </TableCell>
                  <TableCell>
                    {formatDuration(
                      submission.startedAt,
                      computedStatus === "COMPLETED"
                        ? submission.completedAt
                        : null,
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-verbo-green"
                          style={{ width: `${completionPercent}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-600">
                        {completionPercent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/recruiter/submissions/${submission.id}`}>
                        {computedStatus === "COMPLETED" ? "Review" : "View"}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
