"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import "./styles.css";

export default function CandidatePositionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Fetch position data with tRPC using the public endpoint
  const { data: position, isLoading } =
    api.positions.getPositionByIdPublic.useQuery(
      {
        id: params.id,
      },
      {
        // Only fetch if ID is available
        enabled: !!params.id,
        // Don't refetch on window focus for this page
        refetchOnWindowFocus: false,
      },
    );

  // Handle loading state
  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  // Handle position not found
  if (!loading && !position) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-verbo-dark to-verbo-purple p-4 text-white">
        <h1 className="mb-2 text-3xl font-bold">Position Not Found</h1>
        <p className="mb-6">
          The position you're looking for doesn't exist or is no longer
          available.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-verbo-green px-4 py-2 font-medium text-verbo-dark hover:bg-verbo-green/90"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Define the redirect URL for after sign-in or sign-up
  const redirectUrl = `/candidate/position/${params.id}/submission`;

  return (
    <div
      className="flex min-h-screen"
      data-page-type="candidate-position"
      data-position-id={params.id}
    >
      {loading ? (
        <div className="flex w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-verbo-green"></div>
        </div>
      ) : (
        <div className="flex w-full">
          {/* Left side - Dark with gradient, showing position info */}
          <div className="hidden w-1/2 bg-gradient-to-br from-black to-gray-900 p-12 lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-16">
                  <Image
                    src="/logo.png"
                    alt="Verbo Logo"
                    width={48}
                    height={48}
                  />
                </div>
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
                  {position?.title || "Position"}
                </h1>
                <p className="text-xl text-gray-300">
                  {position?.creator_name || "Company"}
                </p>
              </div>

              <div className="space-y-12">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-gray-400">
                    Questions
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {position?.questions?.length || 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-gray-400">
                    Company
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {position?.creator_name || "Company"}
                  </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

                <div>
                  <p className="text-sm text-gray-400">
                    Please sign in or sign up on the right to begin your
                    submission for this position.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign In component */}
          <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-8 space-y-2 lg:hidden">
                <div className="mb-8">
                  <Image
                    src="/logo.png"
                    alt="Verbo Logo"
                    width={48}
                    height={48}
                  />
                </div>
                <h1 className="text-2xl font-bold">
                  {position?.title || "Position"}
                </h1>
                <p className="text-gray-600">
                  {position?.creator_name || "Company"}
                </p>
                <div className="flex gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                      Questions
                    </p>
                    <p className="text-xl font-bold">
                      {position?.questions?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-gray-200" />
              </div>

              {/* Custom header above Clerk component */}
              <div className="mb-6 w-full">
                <h2 className="text-2xl font-bold tracking-tight text-verbo-dark">
                  Welcome!
                </h2>
                <p className="text-sm text-gray-500">
                  Please sign in or sign up to start your submission
                </p>
              </div>

              <SignIn
                appearance={{
                  elements: {
                    formButtonPrimary:
                      "bg-verbo-purple hover:bg-verbo-purple/90",
                    footerActionLink:
                      "text-verbo-purple hover:text-verbo-purple/90",
                    card: "shadow-none border-none",
                    headerTitle: "text-2xl font-bold tracking-tight",
                    headerSubtitle: "text-sm text-gray-500",
                  },
                }}
                routing="hash"
                forceRedirectUrl={redirectUrl}
                signUpForceRedirectUrl={redirectUrl}
                unsafeMetadata={{
                  role: "CANDIDATE",
                  signUpUrl: `/candidate/position/${params.id}`,
                }}
              />

              {/* Privacy text at the bottom */}
              <p className="mt-8 text-center text-xs text-gray-500">
                Your information will be shared with the recruiter for
                evaluation purposes
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
