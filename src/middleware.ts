import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Create matchers for different route types
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isIgnoredRoute = createRouteMatcher(["/api/webhooks/clerk", "/api/trpc/(.*)"]);
const isRecruiterPath = createRouteMatcher(["/recruiter/(.*)"]);
const isCandidatePath = createRouteMatcher(["/candidate/(.*)"]);

// Custom auth routes - these routes handle their own authentication
const isCustomAuthRoute = createRouteMatcher([
  "/candidate/position/(.*)"]
);

// Middleware that handles authentication and path rewriting
// This keeps the URL clean in the browser while still using the correct routes internally
export default clerkMiddleware(async (auth, req) => {
  // If it's an ignored route, continue without auth checks
  if (isIgnoredRoute(req)) {
    return NextResponse.next();
  }

  // If it's a public route, continue without auth checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  // Custom auth routes handle their own authentication
  if (isCustomAuthRoute(req)) {
    return NextResponse.next();
  }

  // Get authentication state
  const { userId, sessionClaims } = await auth();

  // If user is not authenticated and not on a public route or custom auth route, redirect to sign in
  if (!userId) {
    // You can customize this to redirect to your sign-in page
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const path = req.nextUrl.pathname;
  
  // Skip redirects for API routes
  if (path.startsWith("/api/") || path.startsWith("/trpc/")) {
    return NextResponse.next();
  }

  // Skip if already accessing role-specific paths
  if (isRecruiterPath(req) || isCandidatePath(req)) {
    return NextResponse.next();
  }

  // Extract user role from the session claims
  // Default to "CANDIDATE" if we can't determine role
  const role = sessionClaims?.metadata ? 
    (sessionClaims.metadata as { role?: string })?.role ?? "CANDIDATE" 
    : "CANDIDATE";
  
  // List of paths that should be redirected based on role
  // Skip the root path as it's handled by the page component
  const pathsToRewrite = [
    "/skills",
    "/positions",
    "/submissions",
    "/candidates",
    "/settings"
  ];
  
  // If the user is at one of these paths, rewrite to the role-specific version
  if (pathsToRewrite.includes(path)) {
    // For a recruiter, "/skills" becomes "/recruiter/skills", etc.
    if (role === "RECRUITER") {
      const url = new URL(`/recruiter${path}`, req.url);
      // Use rewrite instead of redirect to keep the URL shown in the browser the same
      return NextResponse.rewrite(url);
    }
    
    // For a candidate, "/skills" becomes "/candidate/skills", etc.
    if (role === "CANDIDATE") {
      const url = new URL(`/candidate${path}`, req.url);
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match only the specific paths we want to protect
     * Plus wildcard routes for sign-in and sign-up to handle Clerk's component needs
     */
    '/',
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/skills',
    '/positions',
    '/submissions',
    '/candidates',
    '/settings',
    '/recruiter/:path*',
    '/candidate/:path*',
    '/api/:path*'
  ],
}; 