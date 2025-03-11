"use client";

import { useAuth } from "@clerk/nextjs";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Clock,
  Database,
  Maximize2,
  MessageSquare,
  MinusCircle,
  Pause,
  Play,
  PlayCircle,
  Table,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuroraText } from "~/components/magicui/aurora-text";
import { BentoCard, BentoGrid } from "~/components/magicui/bento-grid";
import { InteractiveHoverButton } from "~/components/magicui/interactive-hover-button";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

// Function to create a sidebar navigation component
function SidebarNav({
  className,
  items,
  ...props
}: {
  className?: string;
  items: { href: string; title: string }[];
  [key: string]: unknown;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "transparent",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

// Recruiter Dashboard Content
function RecruiterDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <SidebarNav
              items={[
                { title: "Overview", href: "/" },
                { title: "Skills", href: "/skills" },
                { title: "Positions", href: "/positions" },
                { title: "Challenges", href: "/challenges" },
                { title: "Submissions", href: "/submissions" },
                { title: "Analytics", href: "/analytics" },
                { title: "Settings", href: "/settings" },
              ]}
            />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Active challenges in your pipeline
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Submissions in progress
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Completed in the last 30 days
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    Across all assessments
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest assessment activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    No recent activity to display.
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Skills</CardTitle>
                  <CardDescription>
                    Most assessed skills in your pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    No skills data available yet.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Candidate Dashboard Content - Placeholder for now
function CandidateDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <SidebarNav
              items={[
                { title: "My Challenges", href: "/" },
                { title: "Past Submissions", href: "/candidate/submissions" },
                { title: "Profile", href: "/candidate/profile" },
              ]}
            />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                My Challenges
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>No challenges yet</CardTitle>
                  <CardDescription>
                    Your assigned challenges will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Once a recruiter assigns you a challenge, you'll be able to
                  start it here.
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Loading indicator
function LoadingDashboard() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold">
          Loading your workspace...
        </h2>
        <div className="mx-auto h-2 w-24 animate-pulse rounded-full bg-verbo-purple"></div>
      </div>
    </div>
  );
}

// Marketing page components (existing code)
function BackgroundGradient() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#fff_100%)] dark:bg-gray-950 dark:[background:radial-gradient(125%_125%_at_50%_10%,#020617_40%,#020617_100%)]">
      <div className="bg-grid-black/[0.02] absolute inset-0 bg-[size:20px_20px]" />
    </div>
  );
}

function InteractiveDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [code, setCode] = useState(
    "SELECT department_name, COUNT(*) as employee_count\nFROM employees\nJOIN departments ON employees.department_id = departments.id\nGROUP BY department_name\nHAVING COUNT(*) > 5\nORDER BY employee_count DESC;",
  );
  const [hasRun, setHasRun] = useState(false);

  return (
    <div className="relative mx-auto max-w-4xl rounded-xl border bg-background/60 shadow-2xl backdrop-blur-sm">
      {/* Browser Chrome */}
      <div className="flex items-center justify-between rounded-t-xl border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <XCircle className="h-4 w-4 text-muted-foreground/60" />
            <MinusCircle className="h-4 w-4 text-muted-foreground/60" />
            <Maximize2 className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <div className="ml-4 flex items-center gap-2 rounded-md bg-background/50 px-2 py-1 text-xs text-muted-foreground">
            <Database className="h-3 w-3" />
            assessment.verbo.ai/challenge/sql-analytics
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-2 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-500">
                Recording
              </span>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isRecording ? 1 : 0 }}
            className="text-xs text-muted-foreground"
          >
            {Math.floor(currentTime / 60)}:
            {(currentTime % 60).toString().padStart(2, "0")}
          </motion.div>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="grid grid-cols-5 divide-x">
        {/* Left Panel - Schema */}
        <div className="col-span-1 p-4">
          <h4 className="mb-3 text-sm font-medium">Database Schema</h4>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Table className="h-4 w-4" />
                employees
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>id (PK)</li>
                <li>name</li>
                <li>department_id (FK)</li>
                <li>salary</li>
                <li>hire_date</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Table className="h-4 w-4" />
                departments
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>id (PK)</li>
                <li>department_name</li>
                <li>location</li>
                <li>budget</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-4 p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">
              SQL Analytics Challenge
            </h3>
            <p className="text-sm text-muted-foreground">
              Write a SQL query to find all departments with more than 5
              employees, ordered by the number of employees in descending order.
            </p>
          </div>

          {/* SQL Editor */}
          <div className="mb-4 rounded-lg border bg-muted/30">
            <div className="border-b bg-muted/50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                Query Editor
              </div>
            </div>
            <div className="p-4">
              <CodeEditor
                value={code}
                language="sql"
                onChange={(e) => setCode(e.target.value)}
                padding={16}
                style={{
                  fontSize: 14,
                  backgroundColor: "transparent",
                  fontFamily:
                    "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                }}
                className="min-h-[120px] w-full rounded-md"
              />
            </div>
          </div>

          {/* Query Results */}
          <AnimatePresence>
            {hasRun && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-6 rounded-lg border bg-muted/30 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Query Results</span>
                  <span className="text-xs text-muted-foreground">
                    3 rows in 42ms
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                        <th className="pb-2">department_name</th>
                        <th className="pb-2">employee_count</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-muted/30">
                        <td className="py-2">Engineering</td>
                        <td className="py-2">12</td>
                      </tr>
                      <tr className="border-b border-muted/30">
                        <td className="py-2">Sales</td>
                        <td className="py-2">8</td>
                      </tr>
                      <tr>
                        <td className="py-2">Marketing</td>
                        <td className="py-2">6</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Feedback */}
          {hasRun && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-4"
            >
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 p-2">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 rounded-lg rounded-tl-none border bg-muted/30 p-3">
                  <p className="text-sm">
                    Good approach! Your query correctly uses JOIN, GROUP BY, and
                    HAVING clauses. Consider adding comments to explain your
                    logic and using meaningful aliases for better readability.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    setCurrentTime(0);
                  }
                }}
              >
                {isRecording ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHasRun(true)}
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Run Query
              </Button>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="flex h-6 items-center gap-1 rounded-md bg-muted/50 px-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs">Audio OK</span>
                  </div>
                  <div className="flex h-6 items-center gap-1 rounded-md bg-muted/50 px-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs">Screen OK</span>
                  </div>
                </motion.div>
              )}
            </div>
            <Button variant="ghost" size="sm">
              End Challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { isLoaded, userId, isSignedIn } = useAuth();

  // Query to fetch the user's role from the database
  const { data: userData, isLoading: isLoadingUser } =
    api.user.getUserRole.useQuery(
      undefined, // No parameters needed
      { enabled: isLoaded && isSignedIn }, // Only run the query if the user is signed in
    );

  // If the user is signed in, render the appropriate dashboard based on their role
  if (isLoaded && isSignedIn) {
    // If we're still loading the user data, show a loading indicator
    if (isLoadingUser || !userData) {
      return <LoadingDashboard />;
    }

    // Show content based on user role
    if (userData.role === "RECRUITER") {
      return <RecruiterDashboard />;
    } else if (userData.role === "CANDIDATE") {
      return <CandidateDashboard />;
    } else {
      // Fallback if role is not recognized
      return <LoadingDashboard />;
    }
  }

  // If the user is not signed in, show the marketing page
  return (
    <div className="relative min-h-screen pb-10">
      <BackgroundGradient />

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="mb-4 inline-block rounded-full bg-verbo-purple/10 px-3 py-1 text-sm text-verbo-purple">
              Now in private beta
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              <AuroraText>AI-Powered Skill Assessments</AuroraText>
              <span className="mt-2 block">for Modern Hiring</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Replace hours of interviews with accurate, consistent, and
              scalable skill assessments. Get deeper insights with less effort.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/sign-up">
                <InteractiveHoverButton className="bg-verbo-purple text-white hover:bg-verbo-purple/90">
                  Get Started
                </InteractiveHoverButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-10 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <InteractiveDemo />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Built for recruiters, backed by AI
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-muted-foreground">
            Transform your hiring process with consistent, thorough skill
            assessments that scale with your needs.
          </p>
          <BentoGrid className="mx-auto max-w-5xl">
            <BentoCard
              name="Realistic Challenges"
              description="Put candidates in real-world scenarios that accurately test their skills, not just their interview abilities."
              Icon={MessageSquare}
              className="md:col-span-2"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-purple/10 to-verbo-green/5"></div>
              }
            />
            <BentoCard
              name="AI-Guided Interviews"
              description="Our AI guides candidates through challenges, adapting to their responses in real-time."
              Icon={Brain}
              className="col-span-1"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-blue/10 to-verbo-purple/5"></div>
              }
            />
            <BentoCard
              name="Time Efficiency"
              description="Replace hours of technical interviews with automated assessments that are just as insightful."
              Icon={Clock}
              className="col-span-1"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-green/10 to-verbo-blue/5"></div>
              }
            />
            <BentoCard
              name="Candidate Insights"
              description="Deep, structured analysis of candidate skills, with specific evidence and clear scoring."
              Icon={Database}
              className="md:col-span-2"
              href="#"
              cta="Learn more"
              background={
                <div className="absolute inset-0 bg-gradient-to-br from-verbo-dark/10 to-verbo-purple/5"></div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl rounded-lg bg-muted p-8 text-center md:p-12">
            <h3 className="mb-2 text-2xl font-bold md:text-3xl">
              Ready to transform your hiring process?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Join the companies already saving hundreds of interview hours per
              month.
            </p>
            <Link href="/sign-up">
              <Button className="h-11 bg-verbo-green px-8 text-black hover:bg-verbo-green/90">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
