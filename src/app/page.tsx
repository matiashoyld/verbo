"use client";

import CodeEditor from "@uiw/react-textarea-code-editor";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ChevronRight,
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
import { useState } from "react";
import { Button } from "~/components/ui/button";

function BackgroundGradient() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#94a3b8_100%)] dark:bg-gray-950 dark:[background:radial-gradient(125%_125%_at_50%_10%,#020617_40%,#475569_100%)]">
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

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative rounded-xl border bg-background/60 p-6 backdrop-blur-sm transition-colors hover:bg-accent"
    >
      <div className="mb-4 w-fit rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center text-sm text-primary">
        <span className="font-medium">Learn more</span>
        <ChevronRight className="ml-1 h-4 w-4" />
      </div>
    </motion.div>
  );
}

export default function Page() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundGradient />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container space-y-6 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center"
          >
            <h1 className="text-4xl font-bold sm:text-6xl md:text-7xl">
              The Future of
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                {" "}
                Skill Assessment
              </span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Transform your hiring process with AI-powered assessments. Let AI
              guide candidates through interactive challenges while providing
              detailed insights.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Interactive Demo Section */}
        <section className="container py-16">
          <InteractiveDemo />
        </section>

        {/* Features Bento Grid */}
        <section className="container py-16 sm:py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Powerful Features for Modern Hiring
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="AI-Driven Evaluation"
              description="Leverage advanced AI to assess technical and soft skills through interactive challenges."
            />
            <FeatureCard
              icon={Clock}
              title="Time-Saving"
              description="Reduce manual evaluation time while maintaining assessment quality."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Interactive Chat"
              description="Natural conversation flow with AI-powered interview assistance."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative border-t">
          <div className="container py-24 sm:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-[58rem] text-center"
            >
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                Ready to transform your hiring process?
              </h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">
                Join leading companies using verbo.ai to find the best talent
                efficiently.
              </p>
              <Button size="lg" className="group mt-8">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background/60 py-6 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 verbo.ai. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
