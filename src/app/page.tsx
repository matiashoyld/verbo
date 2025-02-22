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
  icon: any;
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
          <div className="grid gap-6 md:grid-cols-2">
            {/* AI-Powered Assessment Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-background/60 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">
                  AI-Powered Assessment
                </h3>
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary/20">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
              <p className="mb-6 text-muted-foreground">
                Our AI analyzes candidate responses in real-time, providing
                comprehensive insights into their skills and capabilities.
              </p>
              <div className="space-y-4">
                {["Code Quality", "Problem Solving", "Communication"].map(
                  (skill, i) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{skill}</span>
                        <span className="text-primary">{[85, 92, 78][i]}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${[85, 92, 78][i]}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-6 inline-flex items-center text-sm font-medium text-primary">
                Learn more
                <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>

            {/* Smart Analysis Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-background/60 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Smart Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced AI algorithms analyze responses and provide detailed
                  skill assessments
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["Accuracy", "Speed", "Precision", "Recall"].map(
                  (metric, i) => (
                    <div
                      key={metric}
                      className="flex flex-col items-center rounded-lg border bg-muted/50 p-3 transition-colors hover:bg-muted"
                    >
                      <div className="text-2xl font-bold text-primary">
                        {[94, 89, 92, 87][i]}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metric}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Time-Saving Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-background/60 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Time-Saving</h3>
                <p className="text-muted-foreground">
                  Reduce manual overhead with automated evaluations and instant
                  feedback
                </p>
              </div>
              <div className="relative h-32">
                <svg className="h-full w-full" viewBox="0 0 100 30">
                  {[...Array(3)].map((_, i) => (
                    <motion.path
                      key={i}
                      d={`M 0 ${20 + i * 2} C 20 ${10 + i * 2}, 40 ${25 + i * 2}, 100 ${15 + i * 2}`}
                      className="stroke-primary"
                      fill="none"
                      strokeWidth="0.5"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: i * 0.5 }}
                    />
                  ))}
                  <motion.circle
                    cx="75"
                    cy="16"
                    r="2"
                    className="fill-primary"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                  />
                </svg>
                <div className="absolute bottom-4 right-4 rounded-full bg-primary/10 px-3 py-1 text-sm">
                  <span className="font-medium text-primary">-45%</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    Time Saved
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Chat Card */}
            <div className="group relative overflow-hidden rounded-xl border bg-background/60 p-6 backdrop-blur-sm transition-all hover:shadow-lg">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Interactive Chat</h3>
                <p className="text-muted-foreground">
                  Natural conversation flow with AI-powered interview assistance
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    text: "Tell me about your experience with React",
                    delay: 0,
                  },
                  { text: "How do you handle state management?", delay: 1 },
                  { text: "Can you explain component lifecycle?", delay: 2 },
                ].map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: message.delay * 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 p-2">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-lg rounded-tl-none border bg-muted/30 px-3 py-2">
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5 }}
                  className="ml-auto flex h-8 items-center gap-2 rounded-full bg-primary/10 px-3"
                >
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="text-xs font-medium text-primary">
                    AI is typing...
                  </span>
                </motion.div>
              </div>
            </div>
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
