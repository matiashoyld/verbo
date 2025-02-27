import * as LucideIcons from "lucide-react";
import { HelpCircle, LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { CommonPosition } from "~/types/skills";

interface JobDescriptionStepProps {
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
  hideHeader?: boolean;
}

export function JobDescriptionStep({
  jobDescription,
  onJobDescriptionChange,
  hideHeader = false,
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
    <div className="space-y-6">
      {!hideHeader && (
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Job Description
          </h3>
          <p className="text-sm text-muted-foreground">
            Select from our list of common positions or write your own job
            description.
          </p>
        </div>
      )}

      <div>
        <div className="relative mb-4">
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

        <div className="mt-6 space-y-2">
          <Textarea
            placeholder="Enter job description here..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            className="min-h-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
