"use client";

import { useUser } from "@clerk/nextjs";
import { type ReactNode } from "react";
import { type Role, canAccess } from "~/lib/auth-utils";

interface RoleGateProps {
  children: ReactNode;
  allowedRole: Role;
}

export function RoleGate({ children, allowedRole }: RoleGateProps) {
  const { user } = useUser();
  const userRole = (user?.unsafeMetadata?.role as Role) ?? "student";

  if (!canAccess(userRole, allowedRole)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-red-500">
          You don&apos;t have permission to view this content
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
