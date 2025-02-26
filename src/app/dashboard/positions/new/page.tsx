"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/trpc/react";
import type { CategoryGroup, CategoryName, SkillName } from "~/types/skills";
import { AssessmentStep } from "./components/AssessmentStep";
import { JobDescriptionStep } from "./components/JobDescriptionStep";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { SkillsStep } from "./components/SkillsStep";

export default function NewPositionPage() {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [jobDescription, setJobDescription] = React.useState("");
  const [skills, setSkills] = React.useState<CategoryGroup[]>([]);
  const [assessment, setAssessment] = React.useState({
    title: "",
    difficulty: "medium",
    estimatedTime: "2 hours",
    objectives: [
      "Implement a RESTful API using Node.js and Express",
      "Create a React frontend with proper state management",
      "Implement proper error handling and input validation",
      "Write unit tests for critical components",
    ],
    evaluationCriteria: [
      "Code organization and architecture",
      "Error handling and edge cases",
      "Testing coverage and quality",
      "Documentation and code comments",
    ],
    description: "",
    context: "",
    questions: [] as Array<{
      context: string;
      question: string;
      skills_assessed: Array<{
        id: number;
        name: string;
      }>;
    }>,
  });

  // Set up the tRPC mutation
  const extractSkillsMutation = api.positions.extractSkills.useMutation();

  // Set up the tRPC mutation for generating the assessment
  const generateAssessmentMutation =
    api.positions.generateAssessment.useMutation();

  const handleNext = async () => {
    setLoading(true);

    try {
      if (step === 1) {
        // Use the tRPC mutation to extract skills from the job description
        try {
          const result = await extractSkillsMutation.mutateAsync({
            jobDescription,
          });

          // If we got a valid result, use it to set the skills
          if (result?.categories && result.categories.length > 0) {
            // Transform the result into the expected format (ensuring proper types)
            // Without hardcoded validation against predefined lists
            const transformedSkills: CategoryGroup[] = result.categories
              .map((category) => {
                return {
                  // Accept any category name from the database
                  category: category.name as CategoryName,
                  skills: category.skills
                    .map((skill) => {
                      return {
                        // Accept any skill name from the database
                        name: skill.name as SkillName,
                        competencies: skill.competencies.map((comp) => ({
                          name: comp.name,
                          selected: comp.selected,
                        })),
                      };
                    })
                    // Only filter out skills with no competencies
                    .filter((skill) => skill.competencies.length > 0),
                };
              })
              // Only filter out categories with no skills
              .filter((category) => category.skills.length > 0);

            console.log("Transformed skills from database:", transformedSkills);
            setSkills(transformedSkills);
          } else {
            // If no skills were extracted, use the fallback
            console.warn("No skills were extracted, using fallback");
            applyFallbackSkills();
          }
        } catch (error) {
          console.error("Error extracting skills:", error);
          applyFallbackSkills();
        }
      } else if (step === 2) {
        try {
          // Use the generateAssessment mutation to get an assessment case
          const result = await generateAssessmentMutation.mutateAsync({
            jobDescription,
            skills,
          });

          if (result && result.context && result.questions) {
            // Update the assessment state with the generated content
            setAssessment((prev) => ({
              ...prev,
              title: "Technical Assessment Case",
              difficulty: "medium",
              estimatedTime: "2 hours",
              context: result.context,
              questions: result.questions,
            }));
          } else {
            // Fall back to a default assessment if the result is invalid
            console.warn("Invalid assessment result, using fallback");
            setAssessment((prev) => ({
              ...prev,
              title: "Full-Stack Web Application Development Case",
              context: `Build a task management application that allows users to create, update, and manage their daily tasks.`,
              description: `Build a task management application that allows users to create, update, and manage their daily tasks. 
              
Key Requirements:
- Implement user authentication and authorization
- Create a RESTful API with proper endpoint structure
- Develop a responsive React frontend with modern state management
- Implement real-time updates using WebSocket
- Include proper error handling and input validation
- Write comprehensive tests for both frontend and backend
- Use TypeScript for type safety
- Include proper documentation

The candidate should demonstrate their ability to create a well-structured, scalable application while following best practices in both frontend and backend development.`,
            }));
          }
        } catch (error) {
          console.error("Error generating assessment:", error);
          // Use fallback if the API call fails
          setAssessment((prev) => ({
            ...prev,
            title: "Full-Stack Web Application Development Case",
            context: `Build a task management application that allows users to create, update, and manage their daily tasks.`,
            description: `Build a task management application that allows users to create, update, and manage their daily tasks. 
            
Key Requirements:
- Implement user authentication and authorization
- Create a RESTful API with proper endpoint structure
- Develop a responsive React frontend with modern state management
- Implement real-time updates using WebSocket
- Include proper error handling and input validation
- Write comprehensive tests for both frontend and backend
- Use TypeScript for type safety
- Include proper documentation

The candidate should demonstrate their ability to create a well-structured, scalable application while following best practices in both frontend and backend development.`,
          }));
        }
      }
    } catch (error) {
      console.error("Error in step transition:", error);
      if (step === 1) {
        applyFallbackSkills();
      }
    } finally {
      setLoading(false);
      setStep(step + 1);
    }
  };

  // Helper function to use fallback skills when the API fails
  const applyFallbackSkills = () => {
    setSkills([
      {
        category: "Programming",
        skills: [
          {
            name: "JavaScript",
            competencies: [
              { name: "DOM Manipulation", selected: true },
              { name: "ES6+ Features", selected: true },
              { name: "Asynchronous Patterns", selected: true },
            ],
          },
          {
            name: "TypeScript",
            competencies: [
              { name: "Type Definitions", selected: true },
              { name: "Advanced Types", selected: true },
            ],
          },
        ],
      },
      {
        category: "Frontend",
        skills: [
          {
            name: "React",
            competencies: [
              { name: "Hooks", selected: true },
              { name: "Context API", selected: true },
              { name: "State Management", selected: true },
            ],
          },
        ],
      },
    ]);
  };

  const regenerateCase = async () => {
    setLoading(true);

    try {
      // Use the generateAssessment mutation to regenerate the case
      const result = await generateAssessmentMutation.mutateAsync({
        jobDescription,
        skills,
      });

      if (result && result.context && result.questions) {
        // Update the assessment state with the new generated content
        setAssessment((prev) => ({
          ...prev,
          context: result.context,
          questions: result.questions,
        }));
      } else {
        // If we got an invalid result, show an error
        console.warn("Invalid assessment regeneration result");
      }
    } catch (error) {
      console.error("Error regenerating assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step names for tooltips
  const stepNames = ["Job Description", "Skills", "Assessment"];

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Create New Position</h1>
          <p className="text-muted-foreground">
            Set up a new position and we&apos;ll help you create the perfect
            assessment.
          </p>
        </div>

        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2 py-1 text-xs font-medium shadow-sm">
          <span className="text-muted-foreground">Step</span>
          <div className="flex">
            {[1, 2, 3].map((stepNumber) => (
              <TooltipProvider key={stepNumber} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative flex h-5 w-5 cursor-default select-none items-center justify-center rounded-full transition-colors ${
                        step === stepNumber
                          ? "bg-verbo-purple text-white"
                          : "text-muted-foreground hover:text-verbo-dark"
                      }`}
                    >
                      {stepNumber}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {stepNames[stepNumber - 1]}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && !loading && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <JobDescriptionStep
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
            />
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingIndicator
              step={step}
              message={
                step === 1
                  ? "Analyzing job description and extracting relevant skills..."
                  : "Generating assessment case based on required skills..."
              }
            />
          </motion.div>
        )}

        {step === 2 && !loading && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SkillsStep skills={skills} onSkillsChange={setSkills} />
          </motion.div>
        )}

        {step === 3 && !loading && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AssessmentStep
              assessment={assessment}
              onAssessmentChange={setAssessment}
              onRegenerateCase={regenerateCase}
              loading={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-end gap-2">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={loading}
          >
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button
            className="bg-verbo-purple hover:bg-verbo-purple/90"
            onClick={handleNext}
            disabled={loading || (step === 1 && !jobDescription.trim())}
          >
            Next
          </Button>
        ) : (
          <Button
            className="bg-verbo-green hover:bg-verbo-green/90"
            disabled={loading}
          >
            Create Position
          </Button>
        )}
      </div>
    </div>
  );
}
