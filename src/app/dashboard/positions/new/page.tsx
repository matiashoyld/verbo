"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { AssessmentStep } from "./components/AssessmentStep";
import { JobDescriptionStep } from "./components/JobDescriptionStep";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { SkillsStep } from "./components/SkillsStep";
import { Stepper } from "./components/Stepper";
import type { CategoryGroup, CategoryName, SkillName } from "./components/data";

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
  });

  // Set up the tRPC mutation
  const extractSkillsMutation = api.positions.extractSkills.useMutation();

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
            useFallbackSkills();
          }
        } catch (error) {
          console.error("Error extracting skills:", error);
          useFallbackSkills();
        }
      } else if (step === 2) {
        setAssessment((prev) => ({
          ...prev,
          title: "Full-Stack Web Application Development Case",
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
      console.error("Error in step transition:", error);
      if (step === 1) {
        useFallbackSkills();
      }
    } finally {
      setLoading(false);
      setStep(step + 1);
    }
  };

  // Helper function to use fallback skills when the API fails
  // This should eventually be updated to fetch default skills from the database as well
  const useFallbackSkills = () => {
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAssessment((prev) => ({
        ...prev,
        description: `Create a real-time chat application with the following features:

Key Requirements:
- Implement user authentication with OAuth
- Create group chat functionality
- Add file sharing capabilities
- Implement message search and filtering
- Create a responsive UI with dark mode support
- Add typing indicators and read receipts
- Implement message encryption
- Add comprehensive test coverage

The candidate should focus on creating a secure, scalable chat application while demonstrating their understanding of real-time communication and modern web development practices.`,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Create New Position</h1>
        <p className="text-muted-foreground">
          Set up a new position and we&apos;ll help you create the perfect
          assessment.
        </p>
      </div>

      <Stepper currentStep={step} />

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
