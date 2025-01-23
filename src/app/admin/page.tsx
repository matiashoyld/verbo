import { RoleGate } from "~/components/auth/RoleGate";

export default function AdminPage() {
  return (
    <RoleGate allowedRole="admin">
      <div className="container mx-auto p-8">
        <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Admin Controls</h2>
          <p>This content is only visible to administrators.</p>
        </div>
      </div>
    </RoleGate>
  );
}
