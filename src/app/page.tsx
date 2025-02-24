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
import { AuroraText } from "~/components/magicui/aurora-text";
import { BentoCard, BentoGrid } from "~/components/magicui/bento-grid";
import { InteractiveHoverButton } from "~/components/magicui/interactive-hover-button";
import { Button } from "~/components/ui/button";

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
        <section className="container space-y-12 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center"
          >
            <h1 className="text-4xl font-bold sm:text-6xl md:text-7xl">
              The Future of <AuroraText>Skill Assessment</AuroraText>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Transform your hiring process with AI-powered assessments. Let AI
              guide candidates through interactive challenges while providing
              detailed insights.
            </p>
            <div className="flex gap-4">
              <InteractiveHoverButton>Start Free Trial</InteractiveHoverButton>
            </div>
          </motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <InteractiveDemo />
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section className="container py-16 sm:py-24">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Powerful Features for Modern Hiring
          </h2>
          <BentoGrid>
            <BentoCard
              name="AI-Powered Assessment"
              description="Real-time analysis of candidate responses with comprehensive insights into skills and capabilities."
              Icon={Brain}
              href="#"
              cta="Learn more"
              className="col-span-3 lg:col-span-2"
              background={
                <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
                  <div className="relative h-[250px] w-full">
                    {/* Code Editor-like Interface */}
                    <div className="absolute left-1/2 top-10 w-[90%] -translate-x-1/2 rounded-lg border bg-background/80 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out [mask-image:linear-gradient(to_bottom,#000_0%,#000_60%,transparent_95%)] group-hover:scale-[0.98]">
                      {/* Editor Header */}
                      <div className="flex items-center justify-between border-b px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500/50" />
                          <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                          <div className="h-3 w-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          assessment.js
                        </div>
                      </div>
                      {/* Code Content */}
                      <div className="space-y-2 p-4">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <div className="text-xs text-muted-foreground">
                              {i + 1}
                            </div>
                            <div className="h-4 flex-1 rounded bg-primary/10">
                              <motion.div
                                className="h-full rounded bg-primary/30"
                                initial={{ width: "0%" }}
                                animate={{ width: ["0%", "100%", "60%"] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 1,
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <motion.div
                                className="h-3 w-3 rounded-full bg-green-500/50"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: i * 0.2 + 1 }}
                              />
                              <motion.div
                                className="text-xs text-green-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.2 + 1.2 }}
                              >
                                {["95%", "88%", "92%"][i]}
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    {/* Floating AI Indicators */}
                    <div className="absolute inset-x-0 top-0 h-full [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute h-2 w-2 rounded-full bg-primary/50 shadow-[0_0_10px_4px_rgba(var(--primary),.2)]"
                          style={{
                            left: `${10 + ((i * 80) % 90)}%`,
                            top: `${(i * 30) % 60}%`,
                          }}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.8, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    {/* White Blur Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-background/80 dark:via-background/20 dark:to-transparent" />
                  </div>
                </div>
              }
            />
            <BentoCard
              name="Interactive Challenges"
              description="Engage candidates with real-world coding scenarios and live feedback."
              Icon={PlayCircle}
              href="#"
              cta="Try demo"
              className="col-span-3 lg:col-span-1"
              background={
                <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
                  <div className="relative h-[180px] w-full">
                    {/* Code Challenge Interface */}
                    <div className="absolute left-1/2 top-6 w-[85%] -translate-x-1/2 rounded-lg border bg-background/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out [mask-image:linear-gradient(to_bottom,#000_0%,#000_60%,transparent_95%)] group-hover:scale-95">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-xs font-medium">Challenge 01</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            02:45
                          </motion.div>
                        </div>
                      </div>
                      <CodeEditor
                        value="function solve(input) {\n  // Your solution here\n}"
                        language="js"
                        className="rounded border !bg-muted/30"
                        style={{
                          fontSize: 12,
                          backgroundColor: "transparent",
                          fontFamily: "monospace",
                        }}
                        padding={8}
                      />
                      <motion.div
                        className="mt-3 h-1 w-full rounded-full bg-muted"
                        initial={{ width: "0%" }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1 }}
                      >
                        <div className="h-full rounded-full bg-primary" />
                      </motion.div>
                    </div>
                    {/* White Blur Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-background/80 dark:via-background/20 dark:to-transparent" />
                  </div>
                </div>
              }
            />
            <BentoCard
              name="Time Analytics"
              description="Track performance metrics and completion times with detailed insights."
              Icon={Clock}
              href="#"
              cta="View analytics"
              className="col-span-3 lg:col-span-1"
              background={
                <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
                  <div className="relative h-[180px] w-full">
                    <div className="absolute left-1/2 top-6 w-[85%] -translate-x-1/2">
                      {/* Analytics Chart */}
                      <div className="rounded-lg border bg-background/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out [mask-image:linear-gradient(to_bottom,#000_0%,#000_60%,transparent_95%)] group-hover:scale-95">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-xs font-medium">
                            Performance Trend
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <div className="text-xs text-muted-foreground">
                              Live
                            </div>
                          </div>
                        </div>
                        <div className="relative h-20">
                          <svg
                            className="h-full w-full"
                            preserveAspectRatio="none"
                          >
                            <motion.path
                              d="M 0 40 C 100 30, 150 60, 300 35"
                              className="fill-none stroke-primary stroke-2"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            {[...Array(5)].map((_, i) => (
                              <motion.circle
                                key={i}
                                cx={60 * i}
                                cy={35 + Math.sin(i) * 10}
                                r="3"
                                className="fill-primary"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.2 }}
                              />
                            ))}
                          </svg>
                          <motion.div
                            className="absolute bottom-0 left-0 h-full w-full"
                            style={{
                              background:
                                "linear-gradient(to top, hsl(var(--primary)/.2), transparent)",
                              clipPath:
                                "polygon(0 100%, 100% 100%, 100% 50%, 0 70%)",
                            }}
                            animate={{
                              clipPath: [
                                "polygon(0 100%, 100% 100%, 100% 50%, 0 70%)",
                                "polygon(0 100%, 100% 100%, 100% 60%, 0 40%)",
                                "polygon(0 100%, 100% 100%, 100% 50%, 0 70%)",
                              ],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* White Blur Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-background/80 dark:via-background/20 dark:to-transparent" />
                  </div>
                </div>
              }
            />
            <BentoCard
              name="Smart Analysis"
              description="Advanced AI algorithms analyze responses and provide detailed skill assessments."
              Icon={MessageSquare}
              href="#"
              cta="Learn more"
              className="col-span-3 lg:col-span-2"
              background={
                <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
                  <div className="relative h-[250px] w-full">
                    {/* Analysis Interface */}
                    <div className="absolute left-1/2 top-10 grid w-[90%] -translate-x-1/2 grid-cols-2 gap-4 transition-all duration-300 ease-out [mask-image:linear-gradient(to_bottom,#000_0%,#000_60%,transparent_95%)] group-hover:scale-[0.98]">
                      {/* Left Column - Skills Analysis */}
                      <div className="space-y-3">
                        {[
                          "Problem Solving",
                          "Code Quality",
                          "Communication",
                        ].map((skill, i) => (
                          <motion.div
                            key={skill}
                            className="rounded-lg border bg-background/80 p-3 shadow-sm backdrop-blur-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                          >
                            <div className="mb-2 text-xs font-medium">
                              {skill}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-muted">
                                <motion.div
                                  className="h-full rounded-full bg-primary"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${[85, 92, 78][i]}%` }}
                                  transition={{ duration: 1, delay: i * 0.2 }}
                                />
                              </div>
                              <div className="text-xs text-primary">
                                {[85, 92, 78][i]}%
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {/* Right Column - Live Analysis */}
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 rounded-lg border bg-background/80 p-3 shadow-sm backdrop-blur-sm"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="mb-2 text-xs font-medium">
                            Live Analysis
                          </div>
                          <div className="space-y-2">
                            {[
                              "Analyzing response patterns...",
                              "Evaluating code structure...",
                              "Generating insights...",
                            ].map((text, i) => (
                              <motion.div
                                key={i}
                                className="flex items-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 + i * 0.3 }}
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <div className="text-xs text-muted-foreground">
                                  {text}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <motion.div
                            className="mt-3 h-1 w-full rounded-full bg-muted"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="h-full animate-pulse rounded-full bg-primary" />
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                    {/* White Blur Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-background/80 dark:via-background/20 dark:to-transparent" />
                  </div>
                </div>
              }
            />
          </BentoGrid>
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
