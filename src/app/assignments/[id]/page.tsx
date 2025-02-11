import { notFound } from "next/navigation"
import { StudentInfoForm } from "~/components/student/StudentInfoForm"
import { serverClient } from "~/server/api/server"

export default async function AssignmentPage({ params }: { params: { id: string } }) {
  const caller = serverClient();
  const assignment = await caller.assignment.getById({ id: params.id });

  if (!assignment) {
    notFound()
  }

  return (
    <StudentInfoForm
      assignmentId={assignment.id}
      assignmentName={assignment.name}
      questionCount={assignment.questions.length}
      professorName={assignment.course.user.name ?? "Unknown Professor"}
      courseName={assignment.course.name}
    />
  )
} 