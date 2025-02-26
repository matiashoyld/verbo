import { X } from "lucide-react";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { CategoryGroup, CategoryName, SkillName } from "~/types/skills";

// Type definition for database skills data
interface DBSkillData {
  skillName: string;
  categoryName: string;
  competencies?: Array<{ name: string }>;
}

interface SkillsStepProps {
  skills: CategoryGroup[];
  onSkillsChange: (
    updater: (currentSkills: CategoryGroup[]) => CategoryGroup[],
  ) => void;
  hideHeader?: boolean;
}

export function SkillsStep({
  skills,
  onSkillsChange,
  hideHeader = false,
}: SkillsStepProps) {
  // Use our new database endpoint to fetch skills and categories
  const { data: dbSkillsData, isLoading } =
    api.positions.getAllSkillsAndCategories.useQuery();

  // An object to map skills to their respective categories
  const skillToCategoryMap = React.useMemo(() => {
    if (!dbSkillsData) return {};

    const map: Record<string, string> = {};
    dbSkillsData.forEach((item: DBSkillData) => {
      map[item.skillName] = item.categoryName;
    });
    return map;
  }, [dbSkillsData]);

  // Competencies mapping from the database
  const competenciesMap = React.useMemo(() => {
    if (!dbSkillsData) return {};

    const map: Record<string, string[]> = {};
    dbSkillsData.forEach((item: DBSkillData) => {
      if (item.competencies) {
        map[item.skillName] = item.competencies.map((c) => c.name);
      }
    });
    return map;
  }, [dbSkillsData]);

  const addSkill = (skillName: SkillName) => {
    // Get the category from our database mapping
    const category = skillToCategoryMap[skillName] || "Other";

    // Get competencies from our database or use a default
    const defaultCompetencies = (
      competenciesMap[skillName] || ["General Knowledge"]
    ).map((name) => ({
      name,
      selected: true,
    }));

    onSkillsChange((currentSkills: CategoryGroup[]) => {
      const categoryIndex = currentSkills.findIndex(
        (c: CategoryGroup) => c.category === category,
      );
      if (categoryIndex >= 0) {
        const newSkills = [...currentSkills];
        if (
          !newSkills[categoryIndex]?.skills.some((s) => s.name === skillName)
        ) {
          newSkills[categoryIndex] = {
            category,
            skills: [
              ...(newSkills[categoryIndex]?.skills || []),
              {
                name: skillName,
                competencies: defaultCompetencies,
              },
            ],
          };
          return newSkills;
        }
        return currentSkills;
      }
      return [
        ...currentSkills,
        {
          category,
          skills: [
            {
              name: skillName,
              competencies: defaultCompetencies,
            },
          ],
        },
      ];
    });
  };

  const removeSkill = (category: CategoryName, skillName: SkillName) => {
    onSkillsChange((currentSkills: CategoryGroup[]) => {
      const categoryIndex = currentSkills.findIndex(
        (c: CategoryGroup) => c.category === category,
      );
      if (categoryIndex >= 0 && currentSkills[categoryIndex]) {
        const newSkills = [...currentSkills];
        const updatedSkills = newSkills[categoryIndex]?.skills.filter(
          (s) => s.name !== skillName,
        );
        if (updatedSkills && updatedSkills.length === 0) {
          return newSkills.filter((c) => c.category !== category);
        }
        if (newSkills[categoryIndex]) {
          newSkills[categoryIndex] = {
            category,
            skills: updatedSkills || [],
          };
        }
        return newSkills;
      }
      return currentSkills;
    });
  };

  const toggleCompetency = (
    categoryIndex: number,
    skillIndex: number,
    competencyIndex: number,
  ) => {
    onSkillsChange((currentSkills: CategoryGroup[]) => {
      const newSkills = [...currentSkills];
      if (
        newSkills[categoryIndex]?.skills[skillIndex]?.competencies[
          competencyIndex
        ]
      ) {
        newSkills[categoryIndex].skills[skillIndex].competencies[
          competencyIndex
        ].selected =
          !newSkills[categoryIndex].skills[skillIndex].competencies[
            competencyIndex
          ].selected;
      }
      return newSkills;
    });
  };

  // Use the Card layout only when not hiding the header (when used standalone)
  if (!hideHeader) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Skills</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the skills and competencies required for this position.
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px] pr-4">
            <SkillsContent
              skills={skills}
              removeSkill={removeSkill}
              toggleCompetency={toggleCompetency}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // When used within the dialog (hideHeader=true), don't use the Card wrapper
  return (
    <ScrollArea className="">
      <SkillsContent
        skills={skills}
        removeSkill={removeSkill}
        toggleCompetency={toggleCompetency}
      />
    </ScrollArea>
  );
}

// Extract skills content to avoid duplication
function SkillsContent({
  skills,
  removeSkill,
  toggleCompetency,
}: {
  skills: CategoryGroup[];
  removeSkill: (category: CategoryName, skillName: SkillName) => void;
  toggleCompetency: (
    categoryIndex: number,
    skillIndex: number,
    competencyIndex: number,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      {skills.map((category, categoryIndex) => (
        <div key={category.category}>
          {categoryIndex > 0 && <Separator className="my-4" />}
          <div className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {category.category}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {category.skills.map((skill, skillIndex) => (
                <Popover key={skill.name}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="flex cursor-pointer items-center gap-1 rounded-md py-0.5 pl-2 pr-1 text-xs font-medium hover:bg-secondary/80"
                          >
                            {skill.name}
                            <span className="inline-flex items-center justify-center rounded-md bg-verbo-purple/10 px-1 py-0.5 text-xs font-medium text-verbo-purple">
                              {skill.competencies.length}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSkill(category.category, skill.name);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </Badge>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to view and select competencies</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <PopoverContent className="w-[320px] p-3">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-verbo-dark">
                          {skill.name} Competencies
                        </h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Select the specific competencies required for this
                          position.
                        </p>
                      </div>
                      <div className="space-y-1">
                        {skill.competencies.map(
                          (competency, competencyIndex) => (
                            <div
                              key={competency.name}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`competency-${categoryIndex}-${skillIndex}-${competencyIndex}`}
                                checked={competency.selected}
                                onCheckedChange={() =>
                                  toggleCompetency(
                                    categoryIndex,
                                    skillIndex,
                                    competencyIndex,
                                  )
                                }
                              />
                              <label
                                htmlFor={`competency-${categoryIndex}-${skillIndex}-${competencyIndex}`}
                                className={cn(
                                  "flex-1 cursor-pointer text-sm",
                                  !competency.selected &&
                                    "text-muted-foreground",
                                )}
                              >
                                {competency.name}
                              </label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
