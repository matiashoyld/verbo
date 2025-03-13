import * as LucideIcons from "lucide-react";
import { HelpCircle, LucideIcon, Terminal } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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

  // State for the diagnostics data
  const [diagnosticsResult, setDiagnosticsResult] = useState<{
    success?: boolean;
    response?: string;
    error?: string;
    environment?: string;
    responseTime?: number;
    apiKeyLength?: number;
    modelName?: string;
  } | null>(null);

  // Loading state for diagnostics button
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Get the test API function
  const testGeminiConnection = api.positions.testGeminiConnection.useMutation();

  // Helper function to safely get an icon component
  const getIconComponent = (iconName: string): LucideIcon => {
    const IconComponent = LucideIcons[
      iconName as keyof typeof LucideIcons
    ] as LucideIcon;
    return IconComponent || HelpCircle;
  };

  // Function to test the Gemini API connection
  const handleTestGeminiApi = async () => {
    setIsTestingApi(true);
    setDiagnosticsResult(null);

    try {
      const result = await testGeminiConnection.mutateAsync();
      setDiagnosticsResult(result);
    } catch (error) {
      setDiagnosticsResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Connection Test Button - Always visible regardless of hideHeader */}
      <div className="flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestGeminiApi}
                disabled={isTestingApi}
                className="flex items-center gap-1.5"
              >
                <Terminal className="h-3.5 w-3.5" />
                {isTestingApi ? "Testing..." : "Test AI Connection"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Check if the AI service is working correctly</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Display diagnostic results - Always visible when available */}
      {diagnosticsResult && (
        <div
          className={`rounded-md p-3 text-sm ${
            diagnosticsResult.success
              ? "bg-green-50 text-green-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          <div className="font-semibold">
            {diagnosticsResult.success
              ? "AI Connection: OK"
              : "AI Connection: Failed"}
          </div>
          <div className="mt-1 space-y-1">
            {diagnosticsResult.environment && (
              <div>Environment: {diagnosticsResult.environment}</div>
            )}
            {diagnosticsResult.modelName && (
              <div>Model: {diagnosticsResult.modelName}</div>
            )}
            {diagnosticsResult.responseTime && (
              <div>Response Time: {diagnosticsResult.responseTime}ms</div>
            )}
            {diagnosticsResult.apiKeyLength && (
              <div>API Key Length: {diagnosticsResult.apiKeyLength} chars</div>
            )}
            {diagnosticsResult.response && (
              <div>AI Response: {diagnosticsResult.response}</div>
            )}
            {diagnosticsResult.error && (
              <div className="text-rose-700">
                Error: {diagnosticsResult.error}
              </div>
            )}
          </div>
        </div>
      )}

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
