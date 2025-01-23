export type Role = "student" | "professor" | "admin";

export function canAccess(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    student: 1,
    professor: 2,
    admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
