"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/trpc/react";
import type { CategoryGroup, CategoryName, SkillName } from "~/types/skills";
import { AssessmentStep } from "./AssessmentStep";
import { JobDescriptionStep } from "./JobDescriptionStep";
import { LoadingIndicator } from "./LoadingIndicator";
import { SkillsStep } from "./SkillsStep";

interface NewPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define headers and subheaders for each step
const stepHeaders = [
  {
    title: "Job Description",
    description:
      "Select from our list of common positions or write your own job description.",
  },
  {
    title: "Skills",
    description:
      "Select the skills and competencies required for this position.",
  },
  {
    title: "Assessment",
    description: "Review and customize the generated assessment case.",
  },
];

export function NewPositionDialog({
  open,
  onOpenChange,
}: NewPositionDialogProps) {
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

  // Get current step header content (with safety check)
  const getHeaderContent = () => {
    const defaultHeader = {
      title: "Create Position",
      description: "Fill out the details for your new position.",
    };

    if (step < 1 || step > stepHeaders.length) {
      return defaultHeader;
    }

    return stepHeaders[step - 1];
  };

  const currentHeader = getHeaderContent();

  // Reset form state when dialog is opened
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setLoading(false);
      setJobDescription("");
      // Only reset skills and assessment if needed
    }
  }, [open]);

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

  const handleCreate = () => {
    // Here you would save the position to the database
    console.log("Creating position with:", {
      jobDescription,
      skills,
      assessment,
    });

    // Close the dialog and reset the form
    onOpenChange(false);
    setStep(1);
  };

  // Step names for tooltips
  const stepNames = ["Job Description", "Skills", "Assessment"];

  // Stepper component extracted for reuse
  const Stepper = () => (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2 py-1 text-xs font-medium shadow-sm">
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
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col p-0">
        {/* Fixed Dialog Header with Dynamic Content */}
        <div className="px-4 pb-4 pt-5">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
              {currentHeader!.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {currentHeader!.description}
            </p>
          </DialogHeader>
        </div>

        <Separator className="shrink-0" />

        {/* Scrollable Dialog Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
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
                  hideHeader={true}
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
                <SkillsStep
                  skills={skills}
                  onSkillsChange={setSkills}
                  hideHeader={true}
                />
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
                  hideHeader={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="shrink-0" />

        {/* Fixed Dialog Footer */}
        <div className="flex flex-col-reverse items-center border-t p-4 sm:flex-row sm:justify-between sm:space-x-2">
          {/* Stepper in bottom left */}
          <div className="mt-3 sm:mt-0">
            <Stepper />
          </div>

          {/* Action buttons */}
          <div className="flex w-full gap-2 sm:w-auto">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="h-9 px-4"
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                className="h-9 w-full bg-verbo-purple px-4 hover:bg-verbo-purple/90 sm:w-auto"
                onClick={handleNext}
                disabled={loading || (step === 1 && !jobDescription.trim())}
              >
                Next
              </Button>
            ) : (
              <Button
                className="h-9 w-full bg-verbo-green px-4 hover:bg-verbo-green/90 sm:w-auto"
                onClick={handleCreate}
                disabled={loading}
              >
                Create Position
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
