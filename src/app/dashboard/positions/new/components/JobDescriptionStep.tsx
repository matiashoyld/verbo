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
import { CommonPosition, iconMap } from "./data";

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
                  {commonPositions
                    .slice(0, Math.ceil(commonPositions.length / 2))
                    .map((position: CommonPosition) => {
                      const Icon = iconMap[position.icon];
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
                  {commonPositions
                    .slice(Math.ceil(commonPositions.length / 2))
                    .map((position: CommonPosition) => {
                      const Icon = iconMap[position.icon];
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="grid gap-2">
          <Textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste your job description here..."
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
