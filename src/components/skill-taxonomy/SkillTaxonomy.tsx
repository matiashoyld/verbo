import React from "react";
import type { Category } from "~/types/skills";
import { TaxonomyContainer } from "./components/TaxonomyContainer";

interface SkillTaxonomyProps {
  categories: Category[];
}

export const SkillTaxonomy: React.FC<SkillTaxonomyProps> = ({
  categories: initialCategories,
}) => {
  return <TaxonomyContainer categories={initialCategories} />;
};
