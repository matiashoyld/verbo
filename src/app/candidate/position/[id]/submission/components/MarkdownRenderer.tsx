import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Interface for code component props
interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Function to replace \n with actual newlines for markdown rendering
export const formatMarkdown = (text: string) => {
  // Handle both \n and \\n newline formats
  return text?.replace(/\\n/g, "\n") || "";
};

// Custom components for markdown rendering
export const MarkdownComponents: Components = {
  // Style headings
  h1: ({ ...props }) => (
    <h1
      className="mb-4 mt-6 text-base font-medium text-verbo-dark last:mb-0"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="mb-3 mt-5 text-[15px] font-medium text-verbo-dark last:mb-0"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="mb-2 mt-4 text-sm font-medium text-verbo-dark last:mb-0"
      {...props}
    />
  ),
  h4: ({ ...props }) => (
    <h4
      className="mb-2 mt-3 text-[13px] font-medium text-verbo-dark last:mb-0"
      {...props}
    />
  ),
  h5: ({ ...props }) => (
    <h5
      className="mb-2 mt-3 text-xs font-medium text-verbo-dark last:mb-0"
      {...props}
    />
  ),
  h6: ({ ...props }) => (
    <h6
      className="mb-2 mt-3 text-xs font-medium text-verbo-dark last:mb-0"
      {...props}
    />
  ),
  // Style paragraphs
  p: ({ ...props }) => (
    <p className="mb-4 text-sm text-foreground/80 last:mb-0" {...props} />
  ),
  // Style links
  a: ({ ...props }) => (
    <a
      className="font-medium text-verbo-blue no-underline hover:underline"
      {...props}
    />
  ),
  // Style emphasis and strong
  em: ({ ...props }) => <em className="italic text-foreground/80" {...props} />,
  strong: ({ ...props }) => (
    <strong className="font-medium text-foreground/90" {...props} />
  ),
  // Style lists
  ul: ({ ...props }) => (
    <ul className="mb-4 list-disc pl-5 last:mb-0" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mb-4 list-decimal pl-5 last:mb-0" {...props} />
  ),
  li: ({ ...props }) => (
    <li
      className="mb-2 text-sm text-foreground/80 marker:text-foreground last:mb-0"
      {...props}
    />
  ),
  // Style code blocks and inline code
  code: ({ inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <code
        className={`my-4 block w-full overflow-visible whitespace-pre-wrap break-words rounded-md border border-border/10 bg-muted/20 p-3 text-sm font-medium last:mb-0 ${match[1] ? `language-${match[1]}` : ""}`}
        {...props}
      >
        {children}
      </code>
    ) : (
      <code
        className="rounded bg-verbo-purple/5 px-1.5 py-0.5 text-sm font-medium text-verbo-purple/80"
        {...props}
      >
        {children}
      </code>
    );
  },
  // Style blockquotes
  blockquote: ({ ...props }) => (
    <blockquote
      className="my-4 border-l-2 border-verbo-purple/30 pl-4 text-foreground/70 last:mb-0"
      {...props}
    />
  ),
  // Style horizontal rules
  hr: ({ ...props }) => (
    <hr className="my-6 border-border/50 last:mb-0" {...props} />
  ),
  // Style tables
  table: ({ ...props }) => (
    <div className="my-5 w-full overflow-visible last:mb-0">
      <table
        className="w-full border-collapse border border-border/30 text-left text-sm"
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
      className="break-words border border-border/30 p-2 text-xs font-medium"
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className="whitespace-normal break-words border border-border/30 p-2 text-xs"
      {...props}
    />
  ),
  pre: ({ ...props }) => (
    <pre
      className="my-4 overflow-visible whitespace-pre-wrap rounded-md border border-border/10 bg-muted/20 p-0"
      {...props}
    />
  ),
};

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <div className="w-full overflow-visible whitespace-normal break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={MarkdownComponents}
      >
        {formatMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
