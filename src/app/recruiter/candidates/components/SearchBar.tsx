"use client";

import { Check, Search, Sliders } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";

interface FilterOptions {
  role?: string;
  location?: string;
  minExperience?: number;
  skillNames?: string[];
  minSkillLevel?: number;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  roles: string[];
  locations: string[];
  skills: string[];
}

export function SearchBar({
  onSearch,
  onFilter,
  roles = [],
  locations = [],
  skills = [],
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(
      (value) =>
        value !== undefined && (Array.isArray(value) ? value.length > 0 : true),
    ).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="animate-fade-in mb-8 flex items-center">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search candidates by name, skill or role..."
          className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm transition-all focus:border-verbo-purple focus:outline-none focus:ring-2 focus:ring-verbo-purple/20"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "relative ml-3 rounded-xl border border-border bg-white p-3 transition-colors hover:bg-secondary",
              activeFilterCount > 0 &&
                "border-verbo-purple/20 bg-verbo-purple/5",
            )}
          >
            <Sliders
              size={18}
              className={cn(
                "text-muted-foreground",
                activeFilterCount > 0 && "text-verbo-purple",
              )}
            />
            {activeFilterCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-verbo-purple text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Filter Candidates</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-verbo-purple"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {/* Role Filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/70">
                Role
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-verbo-purple/5",
                      filters.role === role &&
                        "border-verbo-purple/20 bg-verbo-purple/10 text-verbo-purple",
                    )}
                    onClick={() =>
                      updateFilters({
                        role: filters.role === role ? undefined : role,
                      })
                    }
                  >
                    {role}
                    {filters.role === role && (
                      <Check size={12} className="ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Location Filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/70">
                Location
              </label>
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <Badge
                    key={location}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-verbo-purple/5",
                      filters.location === location &&
                        "border-verbo-purple/20 bg-verbo-purple/10 text-verbo-purple",
                    )}
                    onClick={() =>
                      updateFilters({
                        location:
                          filters.location === location ? undefined : location,
                      })
                    }
                  >
                    {location}
                    {filters.location === location && (
                      <Check size={12} className="ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Experience Filter */}
            <div>
              <div className="mb-1 flex justify-between">
                <label className="text-xs font-medium text-foreground/70">
                  Experience (years)
                </label>
                {filters.minExperience !== undefined && (
                  <span className="text-xs font-medium text-verbo-purple">
                    {filters.minExperience}+ years
                  </span>
                )}
              </div>
              <Slider
                defaultValue={[0]}
                max={10}
                step={1}
                value={
                  filters.minExperience !== undefined
                    ? [filters.minExperience]
                    : [0]
                }
                onValueChange={(value) =>
                  updateFilters({
                    minExperience:
                      value && value[0] !== undefined && value[0] > 0
                        ? value[0]
                        : undefined,
                  })
                }
                className="my-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Any</span>
                <span>10+ years</span>
              </div>
            </div>

            <Separator />

            {/* Skills Filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/70">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-verbo-purple/5",
                      filters.skillNames?.includes(skill) &&
                        "border-verbo-purple/20 bg-verbo-purple/10 text-verbo-purple",
                    )}
                    onClick={() => {
                      const currentSkills = filters.skillNames || [];
                      const updatedSkills = currentSkills.includes(skill)
                        ? currentSkills.filter((s) => s !== skill)
                        : [...currentSkills, skill];

                      updateFilters({
                        skillNames:
                          updatedSkills.length > 0 ? updatedSkills : undefined,
                      });
                    }}
                  >
                    {skill}
                    {filters.skillNames?.includes(skill) && (
                      <Check size={12} className="ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between">
                <label className="text-xs font-medium text-foreground/70">
                  Minimum Skill Level
                </label>
                {filters.minSkillLevel !== undefined && (
                  <span className="text-xs font-medium text-verbo-purple">
                    Level {filters.minSkillLevel}+
                  </span>
                )}
              </div>
              <Slider
                defaultValue={[0]}
                max={5}
                step={1}
                value={
                  filters.minSkillLevel !== undefined
                    ? [filters.minSkillLevel]
                    : [0]
                }
                onValueChange={(value) =>
                  updateFilters({
                    minSkillLevel:
                      value && value[0] !== undefined && value[0] > 0
                        ? value[0]
                        : undefined,
                  })
                }
                className="my-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Any</span>
                <span>Expert (5)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="bg-verbo-purple text-white hover:bg-verbo-purple/90"
            >
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
