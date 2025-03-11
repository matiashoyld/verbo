"use client";

import { useSignIn } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

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
  const { isLoaded, signIn } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);

      // Start the Google OAuth flow
      // The authenticateWithRedirect method returns void, not a result
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `/candidate/position/${positionId}/submission`,
        redirectUrlComplete: `/candidate/position/${positionId}/submission`,
      });

      // This code won't actually run - the page will redirect to Google
      // The handling of the redirect back happens automatically through Clerk
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setIsLoading(false);
    }
  };

  // Handle email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;
    if (!emailAddress || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        // In the newer Clerk versions, this happens automatically
        // No need to call setActive manually
        // Redirect to the submission page
        router.push(`/candidate/position/${positionId}/submission`);
      } else {
        // Handle any other status (unlikely with email/password)
        console.log("Sign in result:", result);
        setError("Unable to sign in. Please try again.");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("Error signing in with email:", err);
      // Handle the error with proper type checking
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(
        clerkError.errors?.[0]?.message ||
          "Failed to sign in. Please check your credentials.",
      );
      setIsLoading(false);
    }
  };

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

      {/* Right side - Light, with custom shadcn login form */}
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

          <Card className="border-none shadow-none">
            <CardHeader className="space-y-1 p-0">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome, candidate
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Please sign in to begin your submission
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <div className="grid gap-4">
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  ) : (
                    <Image
                      src="/google-logo.svg"
                      alt="Google Logo"
                      width={20}
                      height={20}
                    />
                  )}
                  <span>Continue with Google</span>
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm font-medium text-red-500">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-verbo-purple text-white hover:bg-verbo-purple/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    "Sign in with Email"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-xs text-gray-500">
            Your information will be shared with the recruiter for evaluation
            purposes
          </p>
        </div>
      </div>
    </div>
  );
}
