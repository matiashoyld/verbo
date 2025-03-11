"use client";

import { usePathname } from "next/navigation";
import { MainNav } from "~/components/ui/nav";

export function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navigation bar on candidate position login pages
  // but show it on submission and results pages
  const showNav =
    !pathname ||
    !pathname.startsWith("/candidate/position/") ||
    pathname.includes("/submission") ||
    pathname.includes("/results");

  if (!showNav) {
    return null;
  }

  return <MainNav />;
}
