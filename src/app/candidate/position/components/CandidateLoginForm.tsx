"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CandidateLoginFormProps {
  positionId: string;
  positionTitle: string;
  companyName: string;
  questionCount: number;
}

export function CandidateLoginForm({
  positionId,
  positionTitle,
  companyName,
  questionCount,
}: CandidateLoginFormProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Dark with gradient, showing position info */}
      <div className="hidden w-1/2 bg-gradient-to-br from-black to-gray-900 p-12 lg:block">
        <div className="flex h-full flex-col justify-between">
          <div>
            <div className="mb-16">
              <Image src="/logo.png" alt="Verbo Logo" width={48} height={48} />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
              {positionTitle}
            </h1>
            <p className="text-xl text-gray-300">{companyName}</p>
          </div>

          <div className="space-y-12">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-400">
                Questions
              </p>
              <p className="text-3xl font-bold text-white">{questionCount}</p>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-400">
                Company
              </p>
              <p className="text-3xl font-bold text-white">{companyName}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

            <div>
              <p className="text-sm text-gray-400">
                Please log in on the right to begin your submission for this
                position.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Light, with Clerk SignIn component */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="space-y-2 lg:hidden">
            <div className="mb-8">
              <Image src="/logo.png" alt="Verbo Logo" width={48} height={48} />
            </div>
            <h1 className="text-2xl font-bold">{positionTitle}</h1>
            <p className="text-gray-600">{companyName}</p>
            <div className="flex gap-4 py-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
                  Questions
                </p>
                <p className="text-xl font-bold">{questionCount}</p>
              </div>
            </div>
            <div className="h-px bg-gray-200" />
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome, candidate
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to begin your submission
            </p>
          </div>

          <div className="mt-6">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none",
                  formButtonPrimary:
                    "bg-verbo-green hover:bg-verbo-green/90 text-verbo-dark",
                  footerActionLink:
                    "text-verbo-purple hover:text-verbo-purple/90",
                },
              }}
              redirectUrl={`/candidate/position/${positionId}/submission`}
              afterSignInUrl={`/candidate/position/${positionId}/submission`}
            />
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Your information will be shared with the recruiter for evaluation
            purposes
          </p>
        </div>
      </div>
    </div>
  );
}
