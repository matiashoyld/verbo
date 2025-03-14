import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import * as React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/trpc/react";

// Define type for code component props
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Define the DBSkillData interface locally
interface DBSkillData {
  skillName: string;
  skillNumId: number | null;
  categoryName: string;
  categoryNumId: number | null;
  competencies?: Array<{ name: string; numId: number | null }>;
}

interface AssessmentQuestion {
  context: string;
  question: string;
  skills_assessed: Array<{
    numId: number | null;
    name: string;
  }>;
  competencies_assessed?: Array<{
    numId: number | null;
    name: string;
    skillNumId?: number | null;
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

// Define a new type for displaying competencies with their skill context
interface CompetencyOption {
  numId: number | null;
  name: string;
  skillName: string;
  skillNumId: number | null;
  categoryName: string;
}

interface AssessmentStepProps {
  assessment: Assessment;
  onAssessmentChange: (assessment: Assessment) => void;
  hideHeader?: boolean;
}

export function AssessmentStep({
  assessment,
  onAssessmentChange,
  hideHeader = false,
}: AssessmentStepProps) {
  // State for new question
  const [showNewQuestion, setShowNewQuestion] = React.useState(false);
  const [newQuestionContext, setNewQuestionContext] = React.useState("");
  const [newQuestion, setNewQuestion] = React.useState("");
  const [newQuestionCompetencies, setNewQuestionCompetencies] = React.useState<
    Array<{ numId: number | null; name: string; skillNumId?: number | null }>
  >([]);
  const [competencyComboboxOpen, setCompetencyComboboxOpen] =
    React.useState(false);

  // State for tracking question movement animation
  const [movingQuestionIndex, setMovingQuestionIndex] = React.useState<
    number | null
  >(null);
  const [moveDirection, setMoveDirection] = React.useState<
    "up" | "down" | null
  >(null);

  // Fetch skills data for the combobox
  const { data: dbSkillsData } =
    api.positions.getAllSkillsAndCategories.useQuery();

  // Function to handle adding a new question
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;

    const competenciesData = newQuestionCompetencies.map((c) => ({
      numId: c.numId,
      name: c.name,
      skillNumId: c.skillNumId,
    }));

    const newQuestionObj: AssessmentQuestion = {
      context: newQuestionContext || "",
      question: newQuestion,
      skills_assessed: competenciesData.map((comp) => ({
        name: comp.name,
        numId: comp.numId,
      })),
      competencies_assessed: competenciesData, // Include competencies_assessed for backward compatibility
    };

    const updatedQuestions = [...assessment.questions, newQuestionObj];

    const updatedAssessment = {
      ...assessment,
      questions: updatedQuestions,
    };

    onAssessmentChange(updatedAssessment);

    // Reset form fields
    setNewQuestionContext("");
    setNewQuestion("");
    setNewQuestionCompetencies([]);
    setShowNewQuestion(false);
  };

  // Function to get all available competencies grouped by skill
  const getAvailableCompetencies = React.useCallback(() => {
    if (!dbSkillsData) return [];

    const competencies: CompetencyOption[] = [];

    // Flatten the skills data to get all competencies with their context
    dbSkillsData.forEach((skillData: DBSkillData) => {
      if (skillData.competencies && skillData.competencies.length > 0) {
        skillData.competencies.forEach(
          (comp: { name: string; numId: number | null }) => {
            competencies.push({
              numId: comp.numId,
              name: comp.name,
              skillName: skillData.skillName,
              skillNumId: skillData.skillNumId,
              categoryName: skillData.categoryName,
            });
          },
        );
      }
    });

    return competencies;
  }, [dbSkillsData]);

  // Function to add a competency to the new question
  const addCompetencyToQuestion = (competency: CompetencyOption) => {
    if (newQuestionCompetencies.some((c) => c.numId === competency.numId))
      return;

    console.log(
      `Adding competency: ${competency.name} (numId: ${competency.numId}) from skill: ${competency.skillName} (numId: ${competency.skillNumId})`,
    );

    setNewQuestionCompetencies((prev) => [
      ...prev,
      {
        numId: competency.numId,
        skillNumId: competency.skillNumId,
        name: `${competency.name} (${competency.skillName})`,
      },
    ]);
    setCompetencyComboboxOpen(false);
  };

  // Function to remove a competency from new question
  const removeCompetencyFromQuestion = (competencyToRemove: string) => {
    setNewQuestionCompetencies((prev) =>
      prev.filter((competency) => competency.name !== competencyToRemove),
    );
  };

  // Function to replace \n with actual newlines for markdown rendering
  const formatMarkdown = (text: string) => {
    // Handle both \n and \\n newline formats
    return text.replace(/\\n/g, "\n");
  };

  // Function to handle removing a question
  const handleRemoveQuestion = (indexToRemove: number) => {
    const updatedQuestions = assessment.questions.filter(
      (_, index) => index !== indexToRemove,
    );

    const updatedAssessment = {
      ...assessment,
      questions: updatedQuestions,
    };

    onAssessmentChange(updatedAssessment);
  };

  // Function to handle moving a question up
  const handleMoveQuestionUp = (index: number) => {
    if (index <= 0) return; // Can't move up if it's the first question

    // Set animation state
    setMovingQuestionIndex(index);
    setMoveDirection("up");

    const updatedQuestions = [...assessment.questions];

    // We already checked index bounds above, so we can safely assert these exist
    const currentQuestion = updatedQuestions[index] as AssessmentQuestion;
    const previousQuestion = updatedQuestions[index - 1] as AssessmentQuestion;

    // Swap the questions
    updatedQuestions[index] = previousQuestion;
    updatedQuestions[index - 1] = currentQuestion;

    // Update with slight delay to allow animation to show
    setTimeout(() => {
      const updatedAssessment = {
        ...assessment,
        questions: updatedQuestions,
      };
      onAssessmentChange(updatedAssessment);

      // Clear animation state after a delay
      setTimeout(() => {
        setMovingQuestionIndex(null);
        setMoveDirection(null);
      }, 300);
    }, 200);
  };

  // Function to handle moving a question down
  const handleMoveQuestionDown = (index: number) => {
    if (index >= assessment.questions.length - 1) return; // Can't move down if it's the last question

    // Set animation state
    setMovingQuestionIndex(index);
    setMoveDirection("down");

    const updatedQuestions = [...assessment.questions];

    // We already checked index bounds above, so we can safely assert these exist
    const currentQuestion = updatedQuestions[index] as AssessmentQuestion;
    const nextQuestion = updatedQuestions[index + 1] as AssessmentQuestion;

    // Swap the questions
    updatedQuestions[index] = nextQuestion;
    updatedQuestions[index + 1] = currentQuestion;

    // Update with slight delay to allow animation to show
    setTimeout(() => {
      const updatedAssessment = {
        ...assessment,
        questions: updatedQuestions,
      };
      onAssessmentChange(updatedAssessment);

      // Clear animation state after a delay
      setTimeout(() => {
        setMovingQuestionIndex(null);
        setMoveDirection(null);
      }, 300);
    }, 200);
  };

  // Custom components for markdown rendering - Using a single styling for both questions and context
  const MarkdownComponents: Components = {
    // Style headings
    h1: ({ ...props }) => (
      <h1
        className="mb-1.5 text-[14px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h2: ({ ...props }) => (
      <h2
        className="mb-1.5 mt-2.5 text-[13px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h3: ({ ...props }) => (
      <h3
        className="mb-1 mt-2 text-[12px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h4: ({ ...props }) => (
      <h4
        className="mb-1 mt-2 text-[11px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h5: ({ ...props }) => (
      <h5
        className="mb-1 mt-2 text-[10px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h6: ({ ...props }) => (
      <h6
        className="mb-1 mt-2 text-xs font-medium text-verbo-dark"
        {...props}
      />
    ),
    // Style paragraphs
    p: ({ ...props }) => (
      <p className="mb-1.5 text-xs text-foreground/80" {...props} />
    ),
    // Style links
    a: ({ ...props }) => (
      <a
        className="font-medium text-verbo-blue no-underline hover:underline"
        {...props}
      />
    ),
    // Style emphasis and strong
    em: ({ ...props }) => (
      <em className="italic text-foreground/80" {...props} />
    ),
    strong: ({ ...props }) => (
      <strong className="font-medium text-foreground/90" {...props} />
    ),
    // Style lists
    ul: ({ ...props }) => <ul className="mb-1.5 list-disc pl-4" {...props} />,
    ol: ({ ...props }) => (
      <ol className="mb-1.5 list-decimal pl-4" {...props} />
    ),
    li: ({ ...props }) => (
      <li
        className="mb-0.5 text-xs text-foreground/80 marker:text-foreground"
        {...props}
      />
    ),
    // Style code blocks and inline code
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <code
          className={`block w-full overflow-visible whitespace-pre-wrap break-words rounded-md border border-border/10 bg-muted/20 p-1.5 text-xs font-medium ${match[1] ? `language-${match[1]}` : ""}`}
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className="rounded bg-verbo-purple/5 px-1 py-0 text-xs font-medium text-verbo-purple/80"
          {...props}
        >
          {children}
        </code>
      );
    },
    // Style blockquotes
    blockquote: ({ ...props }) => (
      <blockquote
        className="my-1.5 border-l-2 border-verbo-purple/30 pl-2 text-foreground/70"
        {...props}
      />
    ),
    // Style horizontal rules
    hr: ({ ...props }) => <hr className="my-2 border-border/50" {...props} />,
    // Style tables
    table: ({ ...props }) => (
      <div className="my-1.5 w-full overflow-visible">
        <table
          className="w-full border-collapse border border-border/30 text-left text-xs"
          {...props}
        />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead className="bg-muted/30 text-foreground/90" {...props} />
    ),
    tbody: ({ ...props }) => <tbody {...props} />,
    tr: ({ ...props }) => (
      <tr className="border-b border-border/30 even:bg-muted/10" {...props} />
    ),
    th: ({ ...props }) => (
      <th
        className="break-words border border-border/30 p-1 text-[10px] font-medium"
        {...props}
      />
    ),
    td: ({ ...props }) => (
      <td
        className="whitespace-normal break-words border border-border/30 p-1 text-[10px]"
        {...props}
      />
    ),
    pre: ({ ...props }) => (
      <pre
        className="my-1.5 overflow-visible whitespace-pre-wrap rounded-md border border-border/10 bg-muted/20 p-0"
        {...props}
      />
    ),
  };

  const availableCompetencies = getAvailableCompetencies();

  // Add display functions to better format competency information in badges

  // Function to extract the skill name and competency name from a formatted competency string
  // Format is expected to be "CompetencyName (SkillName)"
  const extractCompetencyInfo = (
    formattedName: string,
  ): { competencyName: string; skillName: string | null } => {
    const match = formattedName.match(/^(.+?) \((.+?)\)$/);
    if (match && match.length >= 3) {
      return {
        competencyName: match[1]!,
        skillName: match[2] || null,
      };
    }
    return {
      competencyName: formattedName,
      skillName: null,
    };
  };

  // Helper function to get competencies from a question
  const getCompetenciesFromQuestion = (
    question: AssessmentQuestion,
  ): Array<{
    numId: number | null;
    name: string;
    skillNumId?: number | null;
  }> => {
    return (
      question.competencies_assessed ||
      question.skills_assessed.map((skill) => ({
        ...skill,
        skillNumId: null,
      })) ||
      []
    );
  };

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            {assessment.title || "Technical Assessment Case"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Review the assessment case and questions.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Left Column: Case Context */}
        <div className="overflow-hidden">
          <ScrollArea className="h-[500px] w-full">
            <div className="w-full overflow-visible whitespace-normal break-words text-xs">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {formatMarkdown(assessment.context || assessment.description)}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Questions */}
        <div>
          <ScrollArea className="h-[500px]">
            {assessment.questions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No questions available. Click "Regenerate Case" to create
                questions.
              </div>
            ) : (
              <div className="space-y-4">
                {assessment.questions.map((question, index) => (
                  <div
                    key={index}
                    className={`group relative rounded-lg border bg-card p-3 transition-all duration-300 ${
                      movingQuestionIndex === index && moveDirection === "up"
                        ? "-translate-y-2 transform border-verbo-purple/30 shadow-lg"
                        : movingQuestionIndex === index &&
                            moveDirection === "down"
                          ? "translate-y-2 transform border-verbo-purple/30 shadow-lg"
                          : movingQuestionIndex === index - 1 &&
                              moveDirection === "down"
                            ? "-translate-y-2 transform border-verbo-green/20"
                            : movingQuestionIndex === index + 1 &&
                                moveDirection === "up"
                              ? "translate-y-2 transform border-verbo-green/20"
                              : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-medium text-verbo-dark">
                        Question {index + 1}
                      </div>
                      <div className="flex items-center space-x-1">
                        {/* Move up button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMoveQuestionUp(index)}
                                disabled={index === 0}
                                className={`invisible rounded-full p-1 group-hover:visible ${
                                  index === 0
                                    ? "cursor-not-allowed text-muted-foreground/30"
                                    : "text-muted-foreground hover:bg-muted/20 hover:text-foreground focus:outline-none focus:ring-0"
                                }`}
                                aria-label={`Move question ${index + 1} up`}
                              >
                                <ChevronUp size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Move up</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Move down button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMoveQuestionDown(index)}
                                disabled={
                                  index === assessment.questions.length - 1
                                }
                                className={`invisible rounded-full p-1 group-hover:visible ${
                                  index === assessment.questions.length - 1
                                    ? "cursor-not-allowed text-muted-foreground/30"
                                    : "text-muted-foreground hover:bg-muted/20 hover:text-foreground focus:outline-none focus:ring-0"
                                }`}
                                aria-label={`Move question ${index + 1} down`}
                              >
                                <ChevronDown size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Move down</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Remove button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleRemoveQuestion(index)}
                                className="invisible rounded-full p-1 text-muted-foreground hover:bg-muted/20 hover:text-foreground focus:outline-none focus:ring-0 group-hover:visible"
                                aria-label={`Remove question ${index + 1}`}
                              >
                                <X size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Remove this question</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Rest of the question card */}
                    {question.context && (
                      <div className="mb-2 rounded-md bg-muted/70 p-2 text-xs text-muted-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {formatMarkdown(question.context)}
                        </ReactMarkdown>
                      </div>
                    )}

                    <div className="mb-2 text-xs">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {formatMarkdown(question.question)}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {getCompetenciesFromQuestion(question).map(
                        (competency, idx) => {
                          const info = extractCompetencyInfo(competency.name);
                          return (
                            <Badge
                              key={`${competency.numId || idx}`}
                              variant="outline"
                              className="h-5 border-verbo-purple/20 bg-verbo-purple/10 px-1.5 py-0 text-[10px] text-verbo-purple"
                            >
                              <span className="font-medium">
                                {info.competencyName}
                              </span>
                              {info.skillName && (
                                <>
                                  <span className="mx-0.5 text-[8px] text-verbo-purple/60">
                                    in
                                  </span>
                                  <span className="text-[9px] text-verbo-purple/80">
                                    {info.skillName}
                                  </span>
                                </>
                              )}
                            </Badge>
                          );
                        },
                      )}
                    </div>
                  </div>
                ))}

                {/* New Question Form */}
                {showNewQuestion && (
                  <div className="group relative rounded-lg border bg-card p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-medium text-verbo-dark">
                        Question {assessment.questions.length + 1}
                      </div>
                      <div className="flex items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={handleAddQuestion}
                                disabled={
                                  !newQuestion.trim() ||
                                  newQuestionCompetencies.length === 0
                                }
                                className={`rounded-full p-1 ${
                                  newQuestion.trim() &&
                                  newQuestionCompetencies.length > 0
                                    ? "text-verbo-green hover:bg-muted/20 hover:text-verbo-green"
                                    : "cursor-not-allowed text-muted-foreground"
                                } focus:outline-none focus:ring-0`}
                                aria-label="Save question"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {!newQuestion.trim() &&
                                newQuestionCompetencies.length === 0
                                  ? "Question text and at least one competency required"
                                  : !newQuestion.trim()
                                    ? "Question text required"
                                    : newQuestionCompetencies.length === 0
                                      ? "At least one competency required"
                                      : "Save this question"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  setShowNewQuestion(false);
                                  setNewQuestionContext("");
                                  setNewQuestion("");
                                  setNewQuestionCompetencies([]);
                                }}
                                className="rounded-full p-1 text-muted-foreground hover:bg-muted/20 hover:text-foreground focus:outline-none focus:ring-0"
                                aria-label="Cancel new question"
                              >
                                <X size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Cancel new question</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="mb-2 space-y-1.5">
                      <label className="block text-xs text-muted-foreground">
                        Context (optional)
                      </label>
                      <Textarea
                        value={newQuestionContext}
                        onChange={(e) => setNewQuestionContext(e.target.value)}
                        placeholder="Provide any additional context for this question"
                        className="h-20 resize-none text-xs leading-normal placeholder:text-xs"
                      />
                    </div>

                    <div className="mb-3 space-y-1.5">
                      <label className="block text-xs text-muted-foreground">
                        Question
                      </label>
                      <Textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Enter your question here"
                        className="h-20 resize-none text-xs leading-normal placeholder:text-xs"
                      />
                    </div>

                    <div className="mb-2 space-y-1.5">
                      <label className="block text-xs text-muted-foreground">
                        Competencies assessed
                      </label>

                      <div className="flex flex-wrap gap-1.5">
                        {newQuestionCompetencies.map((competency, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="flex h-5 items-center gap-1 border-verbo-purple/20 bg-verbo-purple/10 px-1.5 py-0 text-[10px] text-verbo-purple"
                          >
                            {competency.name}
                            <button
                              onClick={() =>
                                removeCompetencyFromQuestion(competency.name)
                              }
                              className="text-verbo-purple/70 hover:text-verbo-purple"
                            >
                              <X size={10} />
                            </button>
                          </Badge>
                        ))}

                        <Popover
                          open={competencyComboboxOpen}
                          onOpenChange={setCompetencyComboboxOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-5 gap-1 rounded-md border-dashed border-verbo-purple/20 bg-transparent px-1.5 text-[10px] text-verbo-purple hover:bg-verbo-purple/5"
                            >
                              <Plus size={10} />
                              <span>Add competency</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[280px] p-0"
                            align="start"
                            side="top"
                          >
                            <Command className="flex flex-col overflow-hidden rounded-md">
                              <CommandInput
                                placeholder="Search competencies..."
                                className="h-8 border-0 text-[10px] placeholder:text-[10px]"
                              />
                              <CommandList className="max-h-[200px] overflow-y-auto">
                                <CommandEmpty className="p-2 text-xs text-muted-foreground">
                                  No competencies found.
                                </CommandEmpty>
                                {availableCompetencies.map((competency) => (
                                  <CommandItem
                                    key={
                                      competency.numId?.toString() ||
                                      competency.name
                                    }
                                    value={`${competency.name} ${competency.skillName} ${competency.categoryName}`}
                                    onSelect={() =>
                                      addCompetencyToQuestion(competency)
                                    }
                                    className="flex items-center gap-2 text-[10px]"
                                  >
                                    <span className="font-medium">
                                      {competency.name}
                                    </span>
                                    <span className="text-muted-foreground">
                                      in
                                    </span>
                                    <span>{competency.skillName}</span>
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Question Button */}
                {!showNewQuestion && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewQuestion(true)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add custom question
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
