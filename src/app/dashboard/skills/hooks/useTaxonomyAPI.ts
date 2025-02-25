import { useRef } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

export function useTaxonomyAPI() {
  // Flag to track if a save is in progress
  const savingRef = useRef(false);

  // TRPC mutations
  const updateCategory = api.skills.updateCategory.useMutation({
    onSuccess: (_updatedCategory) => {
      savingRef.current = false;
    },
    onError: () => {
      toast.error("Failed to update category", {
        position: "bottom-right",
        description: "There was an error updating the category. Please try again.",
      });
      savingRef.current = false;
    },
  });

  const updateSkill = api.skills.updateSkill.useMutation({
    onSuccess: (_updatedSkill) => {
      savingRef.current = false;
    },
    onError: () => {
      toast.error("Failed to update skill", {
        position: "bottom-right",
        description: "There was an error updating the skill. Please try again.",
      });
      savingRef.current = false;
    },
  });

  const updateSubSkill = api.skills.updateSubSkill.useMutation({
    onSuccess: (_updatedSubSkill) => {
      savingRef.current = false;
    },
    onError: () => {
      toast.error("Failed to update competency", {
        position: "bottom-right",
        description: "There was an error updating the competency. Please try again.",
      });
      savingRef.current = false;
    },
  });

  // Delete mutations
  const deleteCategory = api.skills.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully", {
        position: "bottom-right",
      });
    },
    onError: () => {
      toast.error("Failed to delete category", {
        position: "bottom-right",
        description: "There was an error deleting the category. Please try again.",
      });
    },
  });

  const deleteSkill = api.skills.deleteSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill deleted successfully", {
        position: "bottom-right",
      });
    },
    onError: () => {
      toast.error("Failed to delete skill", {
        position: "bottom-right",
        description: "There was an error deleting the skill. Please try again.",
      });
    },
  });

  const deleteSubSkill = api.skills.deleteSubSkill.useMutation({
    onSuccess: () => {
      toast.success("Competency deleted successfully", {
        position: "bottom-right",
      });
    },
    onError: () => {
      toast.error("Failed to delete competency", {
        position: "bottom-right",
        description: "There was an error deleting the competency. Please try again.",
      });
    },
  });

  // Create mutations
  const createCategory = api.skills.createCategory.useMutation({
    onError: () => {
      toast.error("Failed to save category to database", {
        position: "bottom-right",
        description: "There was an error saving the category. Changes may not persist on refresh.",
      });
    },
  });

  const createSkill = api.skills.createSkill.useMutation({
    onError: () => {
      toast.error("Failed to save skill to database", {
        position: "bottom-right",
        description: "There was an error saving the skill. Changes may not persist on refresh.",
      });
    },
  });

  const createSubSkill = api.skills.createSubSkill.useMutation({
    onError: () => {
      toast.error("Failed to save competency to database", {
        position: "bottom-right",
        description: "There was an error saving the competency. Changes may not persist on refresh.",
      });
    },
  });

  return {
    savingRef,
    updateCategory,
    updateSkill,
    updateSubSkill,
    deleteCategory,
    deleteSkill,
    deleteSubSkill,
    createCategory,
    createSkill,
    createSubSkill
  };
} 