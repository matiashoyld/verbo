import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Middleware that handles authentication and path rewriting
// This keeps the URL clean in the browser while still using the correct routes internally
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: ["/api/webhooks/clerk", "/api/trpc"],
  afterAuth: (auth, req) => {
    // If the user is not authenticated or on a public route, we don't need to do anything
    if (!auth.userId || auth.isPublicRoute) {
      return NextResponse.next();
    }

    const path = req.nextUrl.pathname;
    
    // Skip redirects for API routes
    if (path.startsWith("/api/") || path.startsWith("/trpc/")) {
      return NextResponse.next();
    }

    // Skip if already accessing role-specific paths
    if (path.startsWith("/recruiter/") || path.startsWith("/candidate/")) {
      return NextResponse.next();
    }

    // Get auth data from Clerk
    const { sessionClaims } = auth;
    
    // Extract user role from the session claims
    // Default to "RECRUITER" if we can't determine role
    // In a real app, you might want to handle this differently
    const role = sessionClaims?.metadata ? 
      (sessionClaims.metadata as { role?: string })?.role ?? "RECRUITER" 
      : "RECRUITER";
    
    // List of paths that should be redirected based on role
    // Skip the root path as it's handled by the page component
    const pathsToRewrite = [
      "/skills",
      "/positions",
      "/challenges",
      "/submissions",
      "/analytics",
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
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 