import { ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import MarkdownRenderer from "./MarkdownRenderer";

interface ContextAccordionProps {
  title: string;
  context: string | null;
}

export default function ContextAccordion({
  title,
  context,
}: ContextAccordionProps) {
  // Add state to track the open/closed state of the accordion
  const [isOpen, setIsOpen] = useState<string | undefined>("context");

  // Handler to close the accordion
  const handleClose = (e: React.MouseEvent) => {
    // Prevent event from propagating up to the AccordionContent
    e.stopPropagation();
    // Close the accordion
    setIsOpen(undefined);
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={isOpen}
        onValueChange={setIsOpen}
      >
        <AccordionItem value="context">
          <AccordionTrigger className="px-4 py-3 text-left font-medium text-verbo-dark">
            <div className="flex items-center">
              <span className="mr-2 text-verbo-purple">📋</span>
              <span>
                Case Context{" "}
                <span className="font-bold text-verbo-dark">(Must read)</span>
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            <h2 className="mb-3 text-xl font-bold text-verbo-dark">{title}</h2>
            <p className="mb-4 text-sm text-gray-600">
              Review and understand the assessment case and questions.
            </p>

            {context ? (
              <div className="w-full space-y-4 overflow-visible whitespace-normal break-words text-sm">
                <MarkdownRenderer content={context} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No context provided for this position.
              </p>
            )}

            {/* Close button at the bottom */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1.5 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-verbo-dark transition-colors hover:bg-gray-200 active:bg-gray-300"
              >
                <ChevronUp className="h-4 w-4" />
                Close Case Context
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
