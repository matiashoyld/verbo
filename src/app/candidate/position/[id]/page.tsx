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
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
          Position Not Found
        </h1>
        <p className="mb-6 text-center">
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
      className="flex min-h-screen flex-col"
      data-page-type="candidate-position"
      data-position-id={params.id}
    >
      {loading ? (
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-verbo-green"></div>
            <p className="mt-4 text-sm text-gray-500">Loading position...</p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
          {/* Left side - Dark with gradient, showing position info */}
          <div className="hidden w-full bg-gradient-to-br from-black to-gray-900 p-8 lg:block lg:w-1/2 lg:p-12">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-12 lg:mb-16">
                  <Image
                    src="/logo.png"
                    alt="Verbo Logo"
                    width={48}
                    height={48}
                  />
                </div>
                <h1 className="mb-4 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                  {position?.title || "Position"}
                </h1>
                <p className="text-xl text-gray-300">
                  {position?.creator_name || "Company"}
                </p>
              </div>

              <div className="space-y-8 lg:space-y-12">
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
          <div className="flex w-full flex-1 items-center justify-center px-5 py-8 sm:px-6 sm:py-10 lg:w-1/2 lg:py-12">
            <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center">
              {/* Mobile header - Only visible on mobile */}
              <div className="mb-4 lg:hidden">
                <div className="flex justify-center">
                  <Image
                    src="/logo.png"
                    alt="Verbo Logo"
                    width={56}
                    height={56}
                  />
                </div>
              </div>

              {/* Custom header above Clerk component */}
              <div className="mb-5 w-full text-center lg:text-left">
                <h2 className="text-xl font-bold tracking-tight text-verbo-dark sm:text-2xl">
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
                    headerTitle: "text-xl font-bold tracking-tight sm:text-2xl",
                    headerSubtitle: "text-sm text-gray-500",
                    formFieldInput: "rounded-lg",
                    formFieldLabel: "text-sm font-medium text-gray-700",
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
              <p className="mt-6 text-center text-xs text-gray-500 sm:mt-8">
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
