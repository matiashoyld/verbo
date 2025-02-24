"use client";

import Image from "next/image";
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
          <Image
            src="/logo.png"
            alt="Verbo.ai Logo"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-verbo-dark hidden font-semibold sm:inline-block">
            verbo.ai
          </span>
        </Link>
        <Separator orientation="vertical" className="mx-4 h-6" />
        <nav className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/challenges"
            className={cn(
              "hover:text-verbo-dark text-sm font-medium transition-colors",
              pathname === "/challenges"
                ? "text-verbo-dark"
                : "text-verbo-dark/60",
            )}
          >
            Challenges
          </Link>
          <Link
            href="/submissions"
            className={cn(
              "hover:text-verbo-dark text-sm font-medium transition-colors",
              pathname === "/submissions"
                ? "text-verbo-dark"
                : "text-verbo-dark/60",
            )}
          >
            Submissions
          </Link>
          <Link
            href="/analytics"
            className={cn(
              "hover:text-verbo-dark text-sm font-medium transition-colors",
              pathname === "/analytics"
                ? "text-verbo-dark"
                : "text-verbo-dark/60",
            )}
          >
            Analytics
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-verbo-dark text-base"
            asChild
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-verbo-dark hover:bg-verbo-dark/90 text-base"
            asChild
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
