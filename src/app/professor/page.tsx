import { RoleGate } from "~/components/auth/RoleGate";

export default function ProfessorDashboard() {
  return (
    <RoleGate allowedRole="professor">
      <main className="container mx-auto p-4">
        <h1 className="mb-8 text-4xl font-bold">Professor Dashboard</h1>
        {/* Add professor-specific content here */}
      </main>
    </RoleGate>
  );
}
