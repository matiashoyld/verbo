import { type RouterOutputs } from "~/trpc/react";

// Type for a submission as returned by the tRPC API
export type RecruiterSubmission = RouterOutputs["submission"]["getAllForRecruiter"][0];

// Type for a submission with additional count properties
export type SubmissionWithCounts = RecruiterSubmission & {
  questionCount: number;
  completedQuestionCount: number;
}; 