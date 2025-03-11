"use client";

import { Link } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { AssessmentStep } from "./AssessmentStep";
import { LoadingIndicator } from "./LoadingIndicator";

interface ViewPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionId: string | null;
}

// Define assessment question type to match AssessmentStep
interface AssessmentQuestion {
  id?: string;
  context: string;
  question: string;
  skills_assessed: Array<{
    numId: number | null;
    name: string;
  }>;
}

// Define assessment type to match AssessmentStep
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

export function ViewPositionDialog({
  open,
  onOpenChange,
  positionId,
}: ViewPositionDialogProps) {
  // State to track loading status
  const [loading, setLoading] = React.useState(true);
  // State to track if any changes have been made
  const [hasChanges, setHasChanges] = React.useState(false);
  // State to track the current assessment
  const [currentAssessment, setCurrentAssessment] =
    React.useState<Assessment | null>(null);
  // State to track saving status
  const [saving, setSaving] = React.useState(false);

  // Get the utils for invalidating queries
  const utils = api.useUtils();

  // Fetch position data when positionId changes or dialog is opened
  const { data: position, isLoading } = api.positions.getPositionById.useQuery(
    { id: positionId || "" },
    {
      enabled: !!positionId && open,
    },
  );

  // Mutation to update position questions
  const updatePositionMutation =
    api.positions.updatePositionQuestions.useMutation({
      onSuccess: () => {
        toast.success("Position updated successfully");
        // Reset changes flag
        setHasChanges(false);
        setSaving(false);
        // Invalidate the query to refresh data
        utils.positions.getPositionById.invalidate({ id: positionId || "" });
        utils.positions.getPositions.invalidate();
      },
      onError: (error) => {
        toast.error("Failed to update position", {
          description: error.message,
        });
        setSaving(false);
      },
    });

  // Use useEffect to handle loading state changes and set initial assessment
  React.useEffect(() => {
    if (!isLoading && open && position) {
      // Format assessment data for AssessmentStep component
      const formattedAssessment = {
        title: position.title,
        difficulty: "medium",
        estimatedTime: "2 hours",
        objectives: [],
        evaluationCriteria: [],
        description: position.jobDescription || "",
        context: position.context || "",
        questions: (position?.questions || []).map((q) => ({
          id: q.id || "",
          context: q.context || "",
          question: q.question || "",
          skills_assessed: (q.competencies || []).map((comp) => ({
            numId: null, // Since we no longer have numId in the new structure
            name: comp.name || comp.skillName || "",
          })),
        })),
      };

      setCurrentAssessment(formattedAssessment);
      setLoading(false);
      setHasChanges(false);
    }
  }, [isLoading, open, position]);

  // Handle assessment changes (reordering, adding, removing questions)
  const handleAssessmentChange = (updatedAssessment: Assessment) => {
    setCurrentAssessment(updatedAssessment);
    setHasChanges(true);
  };

  // Handle saving changes
  const handleSaveChanges = () => {
    if (!currentAssessment || !positionId) return;

    setSaving(true);

    // Format the questions for the API
    const questionsToUpdate = currentAssessment.questions.map((q) => ({
      id: q.id as string, // Use existing ID if present, cast to string
      question: q.question,
      context: q.context,
      skills: q.skills_assessed,
    }));

    // Call the mutation to update position questions
    updatePositionMutation.mutate({
      positionId,
      questions: questionsToUpdate,
    });
  };

  // Function to copy the candidate submission link
  const copyCandidateLink = () => {
    if (!positionId) return;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const candidateLink = `${origin}/candidate/position/${positionId}`;

    navigator.clipboard
      .writeText(candidateLink)
      .then(() => {
        toast.success("Candidate link copied", {
          description:
            "The link has been copied to your clipboard. Share it with your candidates.",
        });
      })
      .catch(() => {
        toast.error("Failed to copy link", {
          description: "Please try again or copy it manually.",
        });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col p-0">
        {/* Dialog Header */}
        <div className="p-5">
          <DialogHeader className="text-center sm:text-left">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                {position?.title || "Position Details"}
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-verbo-purple/20 text-verbo-purple hover:bg-verbo-purple/10"
                onClick={copyCandidateLink}
              >
                <Link className="h-4 w-4" />
                <span>Copy Candidate Link</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Review and edit the assessment case and questions.
            </p>
          </DialogHeader>
        </div>

        <Separator className="shrink-0" />

        {/* Scrollable Dialog Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading || loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <LoadingIndicator
                step={1}
                message="Loading position details..."
              />
            </div>
          ) : (
            currentAssessment && (
              <AssessmentStep
                assessment={currentAssessment}
                onAssessmentChange={handleAssessmentChange}
                hideHeader={true}
              />
            )
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 border-t p-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || saving}
            className="bg-verbo-green hover:bg-verbo-green/90"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
