"use client";

import { notFound } from "next/navigation";
import { StudentAssignmentView } from "~/components/student/StudentAssignmentView";
import { api } from "~/utils/api";

export default function PublicAssignmentPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: assignment,
    isLoading,
    error,
  } = api.assignment.getPublicAssignment.useQuery(
    { id: params.id },
    {
      retry: false,
    },
  );

  if (error) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    notFound();
  }

  return (
    <StudentAssignmentView
      assignmentId={assignment.id}
      assignmentName={assignment.name}
      questionCount={assignment.questions.length}
      professorName="Professor"
      courseName="Course"
      questions={assignment.questions}
    />
  );
}
