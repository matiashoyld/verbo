import type { SubmissionStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import type { RecruiterSubmission } from "~/types/submission";

// Utility function moved from utils.ts
export function computeSubmissionStatus(
  submission: RecruiterSubmission,
): SubmissionStatus {
  // If the database already has it marked as FAILED, keep it
  if (submission.status === "FAILED") {
    return "FAILED";
  }

  // Count total position questions
  const totalPositionQuestions = submission.position.questions?.length || 0;

  // Count answered questions (with completed recordings)
  const answeredQuestions = submission.questions.length;
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

export function SubmissionStats() {
  const { data: submissions, isLoading } =
    api.submission.getAllForRecruiter.useQuery();

  // Calculate stats based on computed statuses
  const calculateStats = () => {
    if (!submissions || submissions.length === 0) {
      return {
        total: 0,
        inProgress: 0,
        completed: 0,
        avgDurationMinutes: 0,
      };
    }

    // Compute actual statuses
    const computedSubmissions = submissions.map((submission) => ({
      ...submission,
      computedStatus: computeSubmissionStatus(submission),
    }));

    const total = computedSubmissions.length;
    const inProgress = computedSubmissions.filter(
      (s) => s.computedStatus === "IN_PROGRESS",
    ).length;
    const completed = computedSubmissions.filter(
      (s) => s.computedStatus === "COMPLETED",
    ).length;

    // Calculate average duration for completed submissions
    let totalDurationMinutes = 0;
    let completedWithDuration = 0;

    for (const sub of computedSubmissions) {
      if (sub.computedStatus === "COMPLETED") {
        const endTime = sub.completedAt || new Date();
        const durationMs = endTime.getTime() - sub.startedAt.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        totalDurationMinutes += durationMinutes;
        completedWithDuration++;
      }
    }

    const avgDurationMinutes =
      completedWithDuration > 0
        ? Math.round(totalDurationMinutes / completedWithDuration)
        : 0;

    return {
      total,
      inProgress,
      completed,
      avgDurationMinutes,
    };
  };

  // Format duration as MM:SS
  const formatDuration = (minutes: number) => {
    const mins = Math.floor(minutes);
    return `${mins}:00`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle className="h-5 w-32 rounded bg-gray-200"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Total Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inProgress}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completed}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Average Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(stats.avgDurationMinutes)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
