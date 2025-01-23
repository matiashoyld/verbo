import { currentUser } from "@clerk/nextjs/server";

export type Role = "student" | "professor" | "admin";

export async function getUserRole(): Promise<Role> {
  const user = await currentUser();
  return (user?.publicMetadata?.role as Role) ?? "student";
}

export function canAccess(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    student: 1,
    professor: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
