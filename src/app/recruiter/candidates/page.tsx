"use client";

import { ArrowRight, FilterX, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { CandidateCard } from "./components/CandidateCard";
import { SearchBar } from "./components/SearchBar";

interface FilterOptions {
  role?: string;
  location?: string;
  minExperience?: number;
  skillNames?: string[];
  minSkillLevel?: number;
}

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});

  // Fetch all candidates
  const { data: candidates, isLoading } = api.user.getCandidates.useQuery();

  // Get unique competency names, role names (based on email domains as placeholder), and locations
  const { uniqueRoles, uniqueSkills, uniqueLocations } = useMemo(() => {
    if (!candidates)
      return { uniqueRoles: [], uniqueSkills: [], uniqueLocations: [] };

    // Extract unique skill names
    const skillSet = new Set<string>();
    candidates.forEach((candidate) => {
      candidate.topCompetencies.forEach((comp) => {
        skillSet.add(comp.name);
      });
    });

    // Extract email domains as role placeholders
    const roleSet = new Set<string>();
    candidates.forEach((candidate) => {
      // Using email domain as a placeholder for role
      const emailParts = candidate.email.split("@");
      if (emailParts.length > 1 && emailParts[1]) {
        const domainParts = emailParts[1].split(".");
        if (domainParts.length > 0 && domainParts[0]) {
          roleSet.add(domainParts[0]); // Using domain as role
        }
      }
    });

    // Extract email domains as location placeholders
    const locationSet = new Set<string>();
    candidates.forEach((candidate) => {
      const emailParts = candidate.email.split("@");
      if (emailParts.length > 1 && emailParts[1]) {
        locationSet.add(emailParts[1]); // Using full domain as location
      }
    });

    return {
      uniqueRoles: Array.from(roleSet),
      uniqueSkills: Array.from(skillSet),
      uniqueLocations: Array.from(locationSet),
    };
  }, [candidates]);

  // Filter candidates based on search query and filters
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];

    return candidates.filter((candidate) => {
      let passesSearch = true;
      let passesFilters = true;

      // Apply search filter
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();

        const nameMatch = candidate.name
          ?.toLowerCase()
          .includes(lowerCaseQuery);
        const emailMatch = candidate.email
          .toLowerCase()
          .includes(lowerCaseQuery);
        const competencyMatch = candidate.topCompetencies.some(
          (comp) =>
            comp.name.toLowerCase().includes(lowerCaseQuery) ||
            comp.skillName.toLowerCase().includes(lowerCaseQuery),
        );

        passesSearch = Boolean(nameMatch || emailMatch || competencyMatch);
      }

      // Apply role filter (using email domain as placeholder)
      if (filters.role && passesFilters) {
        const emailParts = candidate.email.split("@");
        let domain = "";
        if (emailParts.length > 1 && emailParts[1]) {
          const domainParts = emailParts[1].split(".");
          if (domainParts.length > 0 && domainParts[0]) {
            domain = domainParts[0];
          }
        }
        passesFilters = domain === filters.role;
      }

      // Apply location filter (using email domain as placeholder)
      if (filters.location && passesFilters) {
        const emailParts = candidate.email.split("@");
        let location = "";
        if (emailParts.length > 1 && emailParts[1]) {
          location = emailParts[1];
        }
        passesFilters = location === filters.location;
      }

      // Apply skill filter
      if (
        filters.skillNames &&
        filters.skillNames.length > 0 &&
        passesFilters
      ) {
        passesFilters = filters.skillNames.some((skillName) =>
          candidate.topCompetencies.some((comp) => comp.name === skillName),
        );
      }

      // Apply minimum skill level filter
      if (filters.minSkillLevel !== undefined && passesFilters) {
        passesFilters = candidate.topCompetencies.some(
          (comp) => comp.level >= filters.minSkillLevel!,
        );
      }

      return passesSearch && passesFilters;
    });
  }, [candidates, searchQuery, filters]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  const hasActiveFilters =
    Object.keys(filters).length > 0 || searchQuery !== "";

  // Render skeleton cards for loading state
  const renderSkeletonCards = () => {
    return Array(8)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="mb-2 h-4 w-2/3 rounded bg-gray-200"></div>
              <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>

              <div className="space-y-3">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="h-2 w-1/3 rounded bg-gray-200"></div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-gray-200"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="h-2 w-1/4 rounded bg-gray-200"></div>
            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
          </div>
        </div>
      ));
  };

  return (
    <div className="flex-1 space-y-6 bg-gray-50/30 p-6">
      <div className="mb-6 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-verbo-dark">Candidates</h2>
        </div>

        <div className="mt-4 md:mt-0">
          <Button className="inline-flex items-center rounded-lg bg-verbo-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-verbo-purple/90">
            <UserPlus size={16} className="mr-2" />
            Add New Candidate
          </Button>
        </div>
      </div>

      <SearchBar
        onSearch={setSearchQuery}
        onFilter={setFilters}
        roles={uniqueRoles}
        locations={uniqueLocations}
        skills={uniqueSkills}
      />

      {hasActiveFilters && (
        <div className="mb-6 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="border-verbo-purple/20 text-xs text-verbo-purple hover:bg-verbo-purple/5"
          >
            <FilterX size={14} className="mr-1" />
            Clear all filters
          </Button>

          {Object.keys(filters).length > 0 && (
            <span className="ml-3 text-xs text-muted-foreground">
              Active filters: {Object.keys(filters).length}
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {renderSkeletonCards()}
        </div>
      ) : filteredCandidates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-verbo-dark">
            No candidates found
          </h3>
          <p className="mb-4 text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            className="text-sm font-medium text-verbo-purple"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                index={index}
              />
            ))}
          </div>

          {filteredCandidates.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="ghost"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-verbo-purple transition-colors hover:text-verbo-purple/80"
              >
                View More Candidates
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
