"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import type { Role } from "~/lib/auth-utils";

export function RoleSelect() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const role = user?.unsafeMetadata?.role as Role | undefined;
    if (role === "student") {
      void router.push("/student");
    } else if (role === "professor") {
      void router.push("/professor");
    }
  }, [user?.unsafeMetadata?.role, router]);

  const selectRole = async (role: Role) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await user.update({
        unsafeMetadata: { role },
      });

      if (role === "student") {
        void router.push("/student");
      } else {
        void router.push("/professor");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.unsafeMetadata?.role || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <div className="grid w-full max-w-2xl gap-4 px-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => void selectRole("student")}
        >
          <CardHeader>
            <CardTitle>I am a Student</CardTitle>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:scale-105"
          onClick={() => void selectRole("professor")}
        >
          <CardHeader>
            <CardTitle>I am a Professor</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
