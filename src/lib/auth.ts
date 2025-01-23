import { currentUser } from "@clerk/nextjs/server";
import type { Role } from "./auth-utils";

export async function getUserRole(): Promise<Role> {
  const user = await currentUser();
  return (user?.publicMetadata?.role as Role) ?? "student";
}

// Re-export Role type for convenience
export type { Role } from "./auth-utils";

export function canAccess(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    student: 1,
    professor: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
