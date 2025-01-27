import { RoleGate } from "~/components/auth/RoleGate";

export default function StudentDashboard() {
  return (
    <RoleGate allowedRole="student">
      <main className="container mx-auto p-4">
        <h1 className="mb-8 text-4xl font-bold">Student Dashboard</h1>
        {/* Add student-specific content here */}
      </main>
    </RoleGate>
  );
}
