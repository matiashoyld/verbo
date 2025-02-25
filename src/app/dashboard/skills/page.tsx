"use client";

import { Loader2 } from "lucide-react";
import { SkillTaxonomy } from "~/components/SkillTaxonomy";
import { api } from "~/trpc/react";

export default function SkillsPage() {
  const { data: categories, isLoading, error } = api.skills.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-verbo-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-red-600">Failed to load skills: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-verbo-dark">
          Skills
        </h2>
      </div>
      <SkillTaxonomy categories={categories ?? []} />
    </div>
  );
}
