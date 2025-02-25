import { Check, RefreshCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

interface Assessment {
  title: string;
  difficulty: string;
  estimatedTime: string;
  objectives: string[];
  evaluationCriteria: string[];
  description: string;
}

interface AssessmentStepProps {
  assessment: Assessment;
  onAssessmentChange: (assessment: Assessment) => void;
  onRegenerateCase: () => void;
  loading?: boolean;
}

export function AssessmentStep({
  assessment,
  onAssessmentChange,
  onRegenerateCase,
  loading = false,
}: AssessmentStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{assessment.title || "Technical Assessment Case"}</CardTitle>
        <CardDescription>
          Review and customize the assessment case.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Difficulty</Label>
            <Select
              value={assessment.difficulty}
              onValueChange={(v) =>
                onAssessmentChange({ ...assessment, difficulty: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label>Estimated Time</Label>
            <Select
              value={assessment.estimatedTime}
              onValueChange={(v) =>
                onAssessmentChange({ ...assessment, estimatedTime: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="2 hours">2 hours</SelectItem>
                <SelectItem value="4 hours">4 hours</SelectItem>
                <SelectItem value="8 hours">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Main Objectives</Label>
          <ul className="mt-2 space-y-2">
            {assessment.objectives.map((objective, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label>Evaluation Criteria</Label>
          <ul className="mt-2 space-y-2">
            {assessment.evaluationCriteria.map((criteria, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">{criteria}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label>Case Description</Label>
          <Textarea
            value={assessment.description}
            onChange={(e) =>
              onAssessmentChange({
                ...assessment,
                description: e.target.value,
              })
            }
            className="mt-2 min-h-[200px]"
          />
        </div>

        <Button
          variant="outline"
          onClick={onRegenerateCase}
          disabled={loading}
          className="w-full"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Regenerate Case
        </Button>
      </CardContent>
    </Card>
  );
}
