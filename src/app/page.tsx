import { ArrowRight, BarChart2, Brain, Mic } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Gradient Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tighter">
              verbo<span className="text-primary">.ai</span>
            </Link>
            <div className="space-x-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section with Gradient */}
        <section className="relative">
          <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
          <div className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20">
                <div className="mx-auto max-w-3xl space-y-8 text-center">
                  <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                    Transform Reading Reflection Through Voice
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
                    Empower authentic student engagement with AI-powered voice
                    responses. No more generic written submissions – foster
                    genuine understanding through natural conversation.
                  </p>
                  <div className="space-x-4">
                    <Link href="/sign-up">
                      <Button size="lg" className="h-12 px-8">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/sign-in">
                      <Button variant="outline" size="lg" className="h-12 px-8">
                        Live Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-b border-t bg-gray-50/50">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group relative space-y-4 rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="bg-primary/10 inline-flex rounded-lg p-3">
                  <Mic className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Authentic Engagement</h3>
                <p className="text-gray-600">
                  Students respond verbally to questions, encouraging
                  spontaneous and genuine answers that demonstrate true
                  understanding.
                </p>
              </div>
              <div className="group relative space-y-4 rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="bg-primary/10 inline-flex rounded-lg p-3">
                  <Brain className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Real-Time Analysis</h3>
                <p className="text-gray-600">
                  Advanced AI-powered speech-to-text processing provides
                  immediate feedback for both students and professors.
                </p>
              </div>
              <div className="group relative space-y-4 rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="bg-primary/10 inline-flex rounded-lg p-3">
                  <BarChart2 className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Insights & Analytics</h3>
                <p className="text-gray-600">
                  Gain deep visibility into comprehension patterns and identify
                  areas where students need additional support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Professors & Students Section */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Designed for Everyone
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Whether you're teaching or learning, Verbo.ai enhances your
                experience
              </p>
            </div>
            <div className="mt-16 grid gap-12 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-2xl font-bold">For Professors</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Upload and manage reading materials
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Create or customize comprehension questions
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Receive automated transcription and analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Track student engagement and understanding
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-2xl font-bold">For Students</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Engage with readings through natural spoken responses
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Get immediate feedback on your responses
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Review transcripts of your answers
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/10 p-1">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    Track your progress and understanding
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-gray-500">
              © 2024 Verbo.ai. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
