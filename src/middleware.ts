import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { Role } from "./lib/auth-utils";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/sign-in/[[...sign-in]]",
    "/sign-up/[[...sign-up]]",
    "/api/webhooks/clerk",
  ],
  async afterAuth(auth, req) {
    // If user is signed in and tries to access auth pages, redirect them
    if (
      auth.userId &&
      (req.nextUrl.pathname.startsWith("/sign-in") ||
        req.nextUrl.pathname.startsWith("/sign-up"))
    ) {
      const user = await clerkClient.users.getUser(auth.userId);
      const role = user.unsafeMetadata.role as Role | undefined;

      if (!role) {
        return NextResponse.redirect(new URL("/select-role", req.url));
      }

      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }

    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // If the user is logged in but hasn't selected a role yet
    if (auth.userId) {
      const user = await clerkClient.users.getUser(auth.userId);
      const role = user.unsafeMetadata.role as Role | undefined;

      // If no role is set and they're not already heading to select-role
      if (!role && !req.nextUrl.pathname.startsWith("/select-role")) {
        return NextResponse.redirect(new URL("/select-role", req.url));
      }

      // Redirect based on role if trying to access the wrong dashboard
      if (role === "student" && req.nextUrl.pathname.startsWith("/professor")) {
        return NextResponse.redirect(new URL("/student", req.url));
      }
      if (role === "professor" && req.nextUrl.pathname.startsWith("/student")) {
        return NextResponse.redirect(new URL("/professor", req.url));
      }
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/api/trpc/:path*",
    "/(api|trpc)/((?!webhooks/clerk).*)$",
  ],
};
