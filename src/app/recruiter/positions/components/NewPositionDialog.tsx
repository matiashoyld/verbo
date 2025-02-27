"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, RefreshCcw } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import type { CategoryGroup, CategoryName, SkillName } from "~/types/skills";
import { AssessmentStep } from "./AssessmentStep";
import { JobDescriptionStep } from "./JobDescriptionStep";
import { LoadingIndicator } from "./LoadingIndicator";
import { SkillsStep } from "./SkillsStep";

// Type definition for database skills data
interface DBSkillData {
  skillName: string;
  skillNumId: number | null;
  categoryName: string;
  categoryNumId: number | null;
  competencies?: Array<{ name: string; numId: number | null }>;
}

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

// Define assessment type to match what AssessmentStep expects
interface AssessmentQuestion {
  context: string;
  question: string;
  skills_assessed: Array<{
    numId: number | null;
    name: string;
  }>;
}

interface Assessment {
  title: string;
  difficulty: string;
  estimatedTime: string;
  objectives: string[];
  evaluationCriteria: string[];
  description: string;
  context: string;
  questions: AssessmentQuestion[];
}

// Default assessment state (moved out of component to avoid recreation on each render)
const defaultAssessment: Assessment = {
  title: "",
  difficulty: "medium",
  estimatedTime: "2 hours",
  objectives: [],
  evaluationCriteria: [],
  description: "",
  context: "",
  questions: [],
};

// Fallback data for when API responses fail
const fallbackAssessmentData = {
  title: "Technical Assessment Case",
  context:
    "Build a task management application that allows users to create, update, and manage their daily tasks.",
  description: `Build a task management application that allows users to create, update, and manage their daily tasks.
    
Key Requirements:
- Implement user authentication and authorization
- Create a RESTful API with proper endpoint structure
- Develop a responsive React frontend with modern state management
- Include proper error handling and input validation
- Write comprehensive tests
- Use TypeScript for type safety
- Include documentation`,
};

export function NewPositionDialog({
  open,
  onOpenChange,
}: NewPositionDialogProps) {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [jobDescription, setJobDescription] = React.useState("");
  const [skills, setSkills] = React.useState<CategoryGroup[]>([]);
  const [assessment, setAssessment] =
    React.useState<Assessment>(defaultAssessment);

  // State for the add skill popover
  const [addSkillOpen, setAddSkillOpen] = React.useState(false);

  // Query for available skills
  const { data: dbSkillsData } =
    api.positions.getAllSkillsAndCategories.useQuery();

  // Calculate step index with safety bounds
  const headerIndex = Math.max(0, Math.min(step - 1, stepHeaders.length - 1));
  // Provide fallback values in case stepHeaders[headerIndex] is undefined
  const currentTitle = stepHeaders[headerIndex]?.title || "Create Position";
  const currentDescription =
    stepHeaders[headerIndex]?.description ||
    "Fill out the details for your new position.";

  // Function to add a skill directly
  const addSkill = (skillName: SkillName) => {
    if (!dbSkillsData) return;

    // Find the skill in the data
    const skillData = dbSkillsData.find(
      (item: DBSkillData) => item.skillName === skillName,
    );
    if (!skillData) return;

    // Get the category
    const category = (skillData.categoryName as CategoryName) || "Other";
    const categoryNumId = skillData.categoryNumId;

    // Get competencies
    const defaultCompetencies = skillData.competencies?.map((c) => ({
      name: c.name,
      numId: c.numId,
      selected: true,
    })) || [{ name: "General Knowledge", numId: null, selected: true }];

    // Update skills
    setSkills((currentSkills: CategoryGroup[]) => {
      const categoryIndex = currentSkills.findIndex(
        (c: CategoryGroup) => c.category === category,
      );
      if (categoryIndex >= 0) {
        const newSkills = [...currentSkills];
        if (
          !newSkills[categoryIndex]?.skills.some((s) => s.name === skillName)
        ) {
          newSkills[categoryIndex] = {
            category,
            categoryNumId,
            skills: [
              ...(newSkills[categoryIndex]?.skills || []),
              {
                name: skillName,
                numId: skillData.skillNumId,
                competencies: defaultCompetencies,
              },
            ],
          };
          return newSkills;
        }
        return currentSkills;
      }
      return [
        ...currentSkills,
        {
          category,
          categoryNumId,
          skills: [
            {
              name: skillName,
              numId: skillData.skillNumId,
              competencies: defaultCompetencies,
            },
          ],
        },
      ];
    });

    // Close the popover
    setAddSkillOpen(false);
  };

  // Function to get available skills
  const getAvailableSkills = React.useCallback(() => {
    if (!dbSkillsData) return [];

    // Get all skills that are already selected
    const selectedSkillNames = skills.flatMap((category) =>
      category.skills.map((skill) => skill.name),
    );

    // Return skills that aren't already selected
    return dbSkillsData
      .filter(
        (item: DBSkillData) => !selectedSkillNames.includes(item.skillName),
      )
      .map((item: DBSkillData) => item.skillName);
  }, [dbSkillsData, skills]);

  // Reset form state when dialog is opened
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setLoading(false);
      setJobDescription("");
      setSkills([]);
      setAssessment(defaultAssessment);
    }
  }, [open]);

  // Set up the tRPC mutations
  const extractSkillsMutation = api.positions.extractSkills.useMutation();
  const generateAssessmentMutation =
    api.positions.generateAssessment.useMutation();
  const createPositionMutation = api.positions.createPosition.useMutation();

  const handleNext = async () => {
    setLoading(true);

    try {
      if (step === 1) {
        // Extract skills from job description
        try {
          const result = await extractSkillsMutation.mutateAsync({
            jobDescription,
          });

          // Process valid result or use fallback
          if (result?.categories && result.categories.length > 0) {
            const transformedSkills: CategoryGroup[] = result.categories
              .map((category) => ({
                category: category.name as CategoryName,
                categoryNumId: category.numId,
                skills: category.skills
                  .map((skill) => ({
                    name: skill.name as SkillName,
                    numId: skill.numId,
                    competencies: skill.competencies.map((comp) => ({
                      name: comp.name,
                      numId: comp.numId,
                      selected: comp.selected,
                    })),
                  }))
                  .filter((skill) => skill.competencies.length > 0),
              }))
              .filter((category) => category.skills.length > 0);

            setSkills(transformedSkills);
          } else {
            console.warn("No skills were extracted, using fallback");
            applyFallbackSkills();
          }
        } catch (error) {
          console.error("Error extracting skills:", error);
          applyFallbackSkills();
        }
      } else if (step === 2) {
        try {
          // Generate assessment based on job description and skills
          const result = await generateAssessmentMutation.mutateAsync({
            jobDescription,
            skills,
          });

          if (result && result.context && result.questions) {
            // Update with generated content
            setAssessment((prev) => ({
              ...prev,
              title: "Technical Assessment Case",
              context: result.context,
              questions: result.questions.map((q) => ({
                context: q.context,
                question: q.question,
                skills_assessed: q.skills_assessed || [],
              })),
            }));
          } else {
            // Use fallback if result is invalid
            console.warn("Invalid assessment result, using fallback");
            setAssessment((prev) => ({
              ...prev,
              ...fallbackAssessmentData,
            }));
          }
        } catch (error) {
          console.error("Error generating assessment:", error);
          // Use fallback on error
          setAssessment((prev) => ({
            ...prev,
            ...fallbackAssessmentData,
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

  // Helper function for fallback skills
  const applyFallbackSkills = () => {
    setSkills([
      {
        category: "Programming",
        categoryNumId: 1,
        skills: [
          {
            name: "JavaScript",
            numId: 1,
            competencies: [
              { name: "ES6+ Features", numId: 2, selected: true },
              { name: "Asynchronous Patterns", numId: 3, selected: true },
            ],
          },
          {
            name: "TypeScript",
            numId: 2,
            competencies: [
              { name: "Type Definitions", numId: 4, selected: true },
            ],
          },
        ],
      },
      {
        category: "Frontend",
        categoryNumId: 2,
        skills: [
          {
            name: "React",
            numId: 3,
            competencies: [
              { name: "Hooks", numId: 6, selected: true },
              { name: "State Management", numId: 8, selected: true },
            ],
          },
        ],
      },
    ]);
  };

  const regenerateCase = async () => {
    setLoading(true);

    try {
      const result = await generateAssessmentMutation.mutateAsync({
        jobDescription,
        skills,
      });

      if (result && result.context && result.questions) {
        setAssessment((prev) => ({
          ...prev,
          context: result.context,
          questions: result.questions.map((q) => ({
            context: q.context,
            question: q.question,
            skills_assessed: q.skills_assessed || [],
          })),
        }));
      } else {
        console.warn("Invalid assessment regeneration result");
      }
    } catch (error) {
      console.error("Error regenerating assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle assessment changes from the step component
  const handleAssessmentChange = (updatedAssessment: Assessment) => {
    setAssessment(updatedAssessment);
  };

  const handleCreate = async () => {
    try {
      setLoading(true);

      // Process assessment data to ensure it matches the API expectations
      const processedQuestions = assessment.questions.map((q) => ({
        context: q.context,
        question: q.question,
        skills_assessed: q.skills_assessed.map((skill) => ({
          name: skill.name,
          numId: skill.numId === null ? undefined : skill.numId,
        })),
      }));

      // Call the createPosition mutation
      const result = await createPositionMutation.mutateAsync({
        title: assessment.title,
        jobDescription: jobDescription,
        skills: skills,
        assessment: {
          title: assessment.title,
          context: assessment.context,
          questions: processedQuestions,
        },
      });

      if (result.success) {
        toast.success("Position created successfully", {
          description: "Your new position has been created and saved.",
        });

        // Close the dialog and reset the form
        onOpenChange(false);
        setStep(1);

        // Force a refresh of the positions list
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create position:", error);
      toast.error("Failed to create position", {
        description:
          "There was an error creating your position. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col p-0">
        {/* Fixed Dialog Header with Dynamic Content */}
        <div className="p-5">
          <DialogHeader className="text-center sm:text-left">
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
              {currentTitle}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {currentDescription}
            </p>
          </DialogHeader>
        </div>

        <Separator className="shrink-0" />

        {/* Scrollable Dialog Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {step === 1 && !loading && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px] space-y-6"
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
                className="flex min-h-[400px] items-center justify-center"
              >
                <LoadingIndicator
                  step={step}
                  message={
                    step === 1
                      ? "Analyzing job description and extracting relevant skills..."
                      : step === 2
                        ? "Generating assessment case based on required skills..."
                        : "Saving position to database..."
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
                className="min-h-[400px]"
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
                className="min-h-[400px]"
              >
                <AssessmentStep
                  assessment={assessment}
                  onAssessmentChange={handleAssessmentChange}
                  hideHeader={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="shrink-0" />

        {/* Fixed Dialog Footer */}
        <div className="relative flex flex-row items-center justify-between p-4">
          {/* Action buttons on the left */}
          <div className="z-10 flex">
            {step === 2 && !loading && (
              <Popover open={addSkillOpen} onOpenChange={setAddSkillOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1 px-4"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Skill</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] p-0"
                  align="start"
                  side="top"
                  sideOffset={5}
                  alignOffset={0}
                  avoidCollisions
                >
                  <Command className="overflow-hidden">
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No skills found.</CommandEmpty>
                      {getAvailableSkills().map((skillName) => (
                        <CommandItem
                          key={skillName}
                          value={skillName}
                          onSelect={() => addSkill(skillName)}
                          className="text-sm"
                        >
                          {skillName}
                        </CommandItem>
                      ))}
                    </CommandList>
                    <div className="border-t border-border p-0">
                      <CommandInput
                        placeholder="Search skills..."
                        className="h-9"
                      />
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            {step === 3 && !loading && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4"
                onClick={regenerateCase}
                disabled={loading}
              >
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Regenerate Case
              </Button>
            )}
          </div>

          {/* Simplified step indicator in center */}
          <div className="absolute left-0 right-0 z-0 mx-auto w-fit">
            <div className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              Step {step} of 3
            </div>
          </div>

          {/* Navigation buttons on the right */}
          <div className="z-10 flex gap-2">
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
                className="h-9 bg-verbo-purple px-4 hover:bg-verbo-purple/90"
                onClick={handleNext}
                disabled={loading || (step === 1 && !jobDescription.trim())}
              >
                Next
              </Button>
            ) : (
              <Button
                className="h-9 bg-verbo-purple px-4 hover:bg-verbo-purple/90"
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
