"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";
import { Button } from "./button";
import { Separator } from "./separator";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary" />
          <span className="hidden font-semibold sm:inline-block">verbo.ai</span>
        </Link>
        <Separator orientation="vertical" className="mx-4 h-6" />
        <nav className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/challenges"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/challenges"
                ? "text-foreground"
                : "text-foreground/60",
            )}
          >
            Challenges
          </Link>
          <Link
            href="/submissions"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/submissions"
                ? "text-foreground"
                : "text-foreground/60",
            )}
          >
            Submissions
          </Link>
          <Link
            href="/analytics"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/analytics"
                ? "text-foreground"
                : "text-foreground/60",
            )}
          >
            Analytics
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-base" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" className="text-base" asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
