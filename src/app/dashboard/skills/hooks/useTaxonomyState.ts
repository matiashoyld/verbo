import { useState } from "react";
import type { Category, Skill } from "~/types/skills";

export type TaxonomyState = {
  // State
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  selectedCategory: Category | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category | null>>;
  selectedSkill: Skill | null;
  setSelectedSkill: React.Dispatch<React.SetStateAction<Skill | null>>;
  expandedCriteria: Set<string>;
  setExpandedCriteria: React.Dispatch<React.SetStateAction<Set<string>>>;
  
  // Editing state
  editingCategoryId: string | null;
  setEditingCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
  editingSkillId: string | null;
  setEditingSkillId: React.Dispatch<React.SetStateAction<string | null>>;
  editingCompetencyId: string | null;
  setEditingCompetencyId: React.Dispatch<React.SetStateAction<string | null>>;
  editName: string;
  setEditName: React.Dispatch<React.SetStateAction<string>>;
  previousName: string;
  setPreviousName: React.Dispatch<React.SetStateAction<string>>;
  
  // Delete dialog state
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  itemToDelete: {
    id: string;
    name: string;
    type: "category" | "skill" | "competency";
  } | null;
  setItemToDelete: React.Dispatch<React.SetStateAction<{
    id: string;
    name: string;
    type: "category" | "skill" | "competency";
  } | null>>;
  
  // Actions
  toggleCriterion: (criterionId: string) => void;
};

export function useTaxonomyState(initialCategories: Category[]): TaxonomyState {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());

  // Editing states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingCompetencyId, setEditingCompetencyId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [previousName, setPreviousName] = useState(""); 

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: "category" | "skill" | "competency";
  } | null>(null);

  const toggleCriterion = (criterionId: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criterionId)) {
      newExpanded.delete(criterionId);
    } else {
      newExpanded.add(criterionId);
    }
    setExpandedCriteria(newExpanded);
  };

  return {
    // State
    categories,
    setCategories,
    selectedCategory,
    setSelectedCategory,
    selectedSkill,
    setSelectedSkill,
    expandedCriteria,
    setExpandedCriteria,
    
    // Editing state
    editingCategoryId,
    setEditingCategoryId,
    editingSkillId,
    setEditingSkillId,
    editingCompetencyId,
    setEditingCompetencyId,
    editName,
    setEditName,
    previousName,
    setPreviousName,
    
    // Delete dialog state
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    setItemToDelete,
    
    // Actions
    toggleCriterion,
  };
} 