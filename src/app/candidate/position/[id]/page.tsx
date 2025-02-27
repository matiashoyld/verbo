"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { CandidateLoginForm } from "../components/CandidateLoginForm";

export default function CandidatePositionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Fetch position data with tRPC using the public endpoint
  const {
    data: position,
    isLoading,
    error,
  } = api.positions.getPositionByIdPublic.useQuery(
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

  return (
    <div className="flex min-h-screen">
      {loading ? (
        <div className="flex w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-verbo-green"></div>
        </div>
      ) : (
        <CandidateLoginForm
          positionId={params.id}
          positionTitle={position?.title || ""}
          companyName={position?.creatorName || ""}
          questionCount={position?.questions?.length || 0}
        />
      )}
    </div>
  );
}
