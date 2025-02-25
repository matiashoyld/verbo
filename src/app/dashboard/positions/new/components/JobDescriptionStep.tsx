import * as LucideIcons from "lucide-react";
import { HelpCircle, LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { CommonPosition } from "~/types/skills";

interface JobDescriptionStepProps {
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
}

export function JobDescriptionStep({
  jobDescription,
  onJobDescriptionChange,
}: JobDescriptionStepProps) {
  const { data: commonPositions = [], isLoading: isLoadingPositions } =
    api.positions.getCommonPositions.useQuery();

  // Helper function to safely get an icon component
  const getIconComponent = (iconName: string): LucideIcon => {
    const IconComponent = LucideIcons[
      iconName as keyof typeof LucideIcons
    ] as LucideIcon;
    return IconComponent || HelpCircle;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <CardDescription>
          Select from our list of common positions or write your own job
          description.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          {isLoadingPositions ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/50 hover:scrollbar-thumb-muted-foreground overflow-x-auto overflow-y-hidden pb-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  {(commonPositions as CommonPosition[])
                    .slice(
                      0,
                      Math.ceil(
                        (commonPositions as CommonPosition[]).length / 2,
                      ),
                    )
                    .map((position: CommonPosition) => {
                      const Icon = getIconComponent(position.icon);
                      return (
                        <Button
                          key={position.title}
                          variant="outline"
                          onClick={() => {
                            onJobDescriptionChange(position.description);
                          }}
                          className="h-10 w-fit shrink-0 whitespace-nowrap"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {position.title}
                        </Button>
                      );
                    })}
                </div>
                <div className="flex gap-2">
                  {(commonPositions as CommonPosition[])
                    .slice(
                      Math.ceil(
                        (commonPositions as CommonPosition[]).length / 2,
                      ),
                    )
                    .map((position: CommonPosition) => {
                      const Icon = getIconComponent(position.icon);
                      return (
                        <Button
                          key={position.title}
                          variant="outline"
                          onClick={() => {
                            onJobDescriptionChange(position.description);
                          }}
                          className="h-10 w-fit shrink-0 whitespace-nowrap"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {position.title}
                        </Button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <Textarea
            placeholder="Enter job description here..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            className="min-h-[300px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
