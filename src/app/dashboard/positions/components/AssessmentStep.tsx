import { RefreshCcw } from "lucide-react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";

// Define type for code component props
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface AssessmentQuestion {
  context: string;
  question: string;
  skills_assessed: Array<{
    id: number;
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

interface AssessmentStepProps {
  assessment: Assessment;
  onAssessmentChange: (assessment: Assessment) => void;
  onRegenerateCase: () => void;
  loading?: boolean;
  hideHeader?: boolean;
}

export function AssessmentStep({
  assessment,
  onAssessmentChange,
  onRegenerateCase,
  loading = false,
  hideHeader = false,
}: AssessmentStepProps) {
  // Function to replace \n with actual newlines for markdown rendering
  const formatMarkdown = (text: string) => {
    // Handle both \n and \\n newline formats
    return text.replace(/\\n/g, "\n");
  };

  // Custom components for markdown rendering
  const MarkdownComponents: Components = {
    // Style headings
    h1: ({ node, ...props }) => (
      <h1 className="mb-3 text-[14px] font-medium text-verbo-dark" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="mb-2.5 mt-4 text-[13px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        className="mb-2 mt-3.5 text-[12px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h4: ({ node, ...props }) => (
      <h4
        className="mb-2 mt-3 text-[11px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    // Style paragraphs
    p: ({ node, ...props }) => (
      <p className="mb-2.5 text-xs text-foreground/80" {...props} />
    ),
    // Style links
    a: ({ node, ...props }) => (
      <a
        className="font-medium text-verbo-blue no-underline hover:underline"
        {...props}
      />
    ),
    // Style emphasis and strong
    em: ({ node, ...props }) => (
      <em className="italic text-foreground/80" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-medium text-foreground/90" {...props} />
    ),
    // Style lists
    ul: ({ node, ...props }) => (
      <ul className="mb-2.5 list-disc pl-5" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="mb-2.5 list-decimal pl-5" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li
        className="mb-1 text-xs text-foreground/80 marker:text-foreground"
        {...props}
      />
    ),
    // Style code blocks and inline code
    code: ({ inline, ...props }: CodeProps) => (
      <code
        className={`${
          inline
            ? "mx-0.5 rounded-sm bg-muted/50 px-1 py-0.5 text-[11px] font-medium text-foreground/80"
            : "block overflow-auto rounded-md bg-muted/50 p-2 text-[11px] text-foreground/80"
        }`}
        {...props}
      />
    ),
    // Style blockquotes
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="my-2.5 border-l-2 border-border pl-3 text-foreground/70"
        {...props}
      />
    ),
    // Style horizontal rules
    hr: ({ node, ...props }) => (
      <hr className="my-3 border-border/50" {...props} />
    ),
    // Style tables
    table: ({ node, ...props }) => (
      <div className="my-2.5 overflow-auto">
        <table
          className="w-full min-w-full border-collapse border border-border/30 text-left text-xs"
          {...props}
        />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-muted/30 text-foreground/90" {...props} />
    ),
    tbody: ({ node, ...props }) => <tbody {...props} />,
    tr: ({ node, ...props }) => (
      <tr className="border-b border-border/30 even:bg-muted/10" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th
        className="border border-border/30 p-1 text-[10px] font-medium"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-border/30 p-1 text-[10px]" {...props} />
    ),
    pre: ({ node, ...props }) => (
      <pre
        className="my-2.5 overflow-auto rounded-md border border-border/10 bg-muted/20 p-0"
        {...props}
      />
    ),
  };

  // Smaller components for question context and content
  const QuestionMarkdownComponents: Components = {
    // Style headings
    h1: ({ node, ...props }) => (
      <h1
        className="mb-1.5 text-[14px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="mb-1.5 mt-2.5 text-[13px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        className="mb-1 mt-2 text-[12px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    h4: ({ node, ...props }) => (
      <h4
        className="mb-1 mt-2 text-[11px] font-medium text-verbo-dark"
        {...props}
      />
    ),
    // Style paragraphs
    p: ({ node, ...props }) => (
      <p className="mb-1.5 text-xs text-foreground/80" {...props} />
    ),
    // Style links
    a: ({ node, ...props }) => (
      <a
        className="font-medium text-verbo-blue no-underline hover:underline"
        {...props}
      />
    ),
    // Style emphasis and strong
    em: ({ node, ...props }) => (
      <em className="italic text-foreground/80" {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-medium text-foreground/90" {...props} />
    ),
    // Style lists
    ul: ({ node, ...props }) => (
      <ul className="mb-1.5 list-disc pl-4" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="mb-1.5 list-decimal pl-4" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li
        className="mb-0.5 text-xs text-foreground/80 marker:text-foreground"
        {...props}
      />
    ),
    // Style code blocks and inline code
    code: ({ inline, ...props }: CodeProps) => (
      <code
        className={`${
          inline
            ? "mx-0.5 rounded-sm bg-muted/50 px-1 py-0.5 text-[10px] font-medium text-foreground/80"
            : "block overflow-auto rounded-md bg-muted/50 p-1.5 text-[10px] text-foreground/80"
        }`}
        {...props}
      />
    ),
    // Style blockquotes
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="my-1.5 border-l-2 border-border pl-2 text-foreground/70"
        {...props}
      />
    ),
    // Style horizontal rules
    hr: ({ node, ...props }) => (
      <hr className="my-2 border-border/50" {...props} />
    ),
    // Style tables
    table: ({ node, ...props }) => (
      <div className="my-1.5 overflow-auto">
        <table
          className="w-full min-w-full border-collapse border border-border/30 text-left text-xs"
          {...props}
        />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-muted/30 text-foreground/90" {...props} />
    ),
    tbody: ({ node, ...props }) => <tbody {...props} />,
    tr: ({ node, ...props }) => (
      <tr className="border-b border-border/30 even:bg-muted/10" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th
        className="border border-border/30 p-1 text-[10px] font-medium"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-border/30 p-1 text-[10px]" {...props} />
    ),
  };

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex flex-row items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {assessment.title || "Technical Assessment Case"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Review the assessment case and questions.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onRegenerateCase}
            disabled={loading}
            className="h-8 text-xs"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate Case
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left Column: Case Context */}
        <div>
          <div>
            <h3 className="mb-1.5 text-sm font-medium text-verbo-dark">
              Case Context
            </h3>
            <ScrollArea className="h-[500px] rounded-md border bg-muted/10 p-3">
              <div className="text-xs">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {formatMarkdown(assessment.context || assessment.description)}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Column: Questions */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-verbo-dark">
            Assessment Questions
          </h3>

          <ScrollArea className="h-[500px] pr-3">
            {assessment.questions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No questions available. Click "Regenerate Case" to create
                questions.
              </div>
            ) : (
              <div className="space-y-4">
                {assessment.questions.map((question, index) => (
                  <div key={index} className="rounded-lg border bg-card p-3">
                    <div className="mb-2 text-xs font-medium text-verbo-dark">
                      Question {index + 1}
                    </div>

                    {question.context && (
                      <div className="mb-2 rounded-md bg-muted/30 p-2 text-xs text-muted-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={QuestionMarkdownComponents}
                        >
                          {formatMarkdown(question.context)}
                        </ReactMarkdown>
                      </div>
                    )}

                    <div className="mb-2 text-xs">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={QuestionMarkdownComponents}
                      >
                        {formatMarkdown(question.question)}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {question.skills_assessed.map((skill, skillIdx) => (
                        <Badge
                          key={skillIdx}
                          variant="outline"
                          className="h-5 border-verbo-purple/20 bg-verbo-purple/10 px-1.5 py-0 text-[10px] text-verbo-purple"
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
