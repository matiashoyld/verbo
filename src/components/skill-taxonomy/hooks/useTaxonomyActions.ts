import { toast } from "sonner";
import type { Category, Skill, SubSkill } from "~/types/skills";
import { useTaxonomyAPI } from "./useTaxonomyAPI";
import type { TaxonomyState } from "./useTaxonomyState";

type UseTaxonomyActionsProps = TaxonomyState & {
  editInputRef: React.RefObject<HTMLInputElement>;
};

export function useTaxonomyActions({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  selectedSkill,
  setSelectedSkill,
  editingCategoryId,
  setEditingCategoryId,
  editingSkillId,
  setEditingSkillId,
  editingSubSkillId,
  setEditingSubSkillId,
  editName,
  setEditName,
  previousName,
  setPreviousName,
  deleteDialogOpen,
  setDeleteDialogOpen,
  itemToDelete,
  setItemToDelete,
}: UseTaxonomyActionsProps) {
  const {
    savingRef,
    updateCategory,
    updateSkill,
    updateSubSkill,
    deleteCategory,
    deleteSkill,
    deleteSubSkill,
    createCategory,
    createSkill,
    createSubSkill,
  } = useTaxonomyAPI();

  // We don't use deleteDialogOpen in this function, but it's part of the props
  const _unused = deleteDialogOpen;

  // Handlers for selection
  const handleCategorySelect = (category: Category) => {
    if (editingCategoryId || editingSkillId || editingSubSkillId) return;
    setSelectedCategory(category);
    setSelectedSkill(null);
  };

  const handleSkillSelect = (skill: Skill) => {
    if (editingCategoryId || editingSkillId || editingSubSkillId) return;
    setSelectedSkill(skill);
  };

  // Handlers for editing
  const startEditingCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setPreviousName(category.name);
  };

  const startEditingSkill = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    setEditingSkillId(skill.id);
    setEditName(skill.name);
    setPreviousName(skill.name);
  };

  const startEditingSubSkill = (e: React.MouseEvent, subSkill: SubSkill) => {
    e.stopPropagation();
    setEditingSubSkillId(subSkill.id);
    setEditName(subSkill.name);
    setPreviousName(subSkill.name);
  };

  // Handlers for saving edits
  const handleSaveCategory = async () => {
    if (!editingCategoryId || !editName.trim() || savingRef.current) {
      setEditingCategoryId(null);
      return;
    }

    // Skip if there's no change
    const category = categories.find((c: Category) => c.id === editingCategoryId);
    if (category && category.name === editName.trim()) {
      setEditingCategoryId(null);
      savingRef.current = false;
      return;
    }

    savingRef.current = true;

    try {
      // Update local state
      const newCategories = categories.map((cat: Category) =>
        cat.id === editingCategoryId ? { ...cat, name: editName.trim() } : cat
      );
      setCategories(newCategories);

      // Update selected category if it's the one being edited
      if (selectedCategory && selectedCategory.id === editingCategoryId) {
        setSelectedCategory({ ...selectedCategory, name: editName.trim() });
      }

      // Save to database
      const result = await updateCategory.mutateAsync({
        id: editingCategoryId,
        name: editName.trim(),
      });
      
      const oldName = previousName;
      // Only show toast if there was an actual change
      if (oldName !== result.name) {
        toast("Category updated successfully", {
          position: "bottom-right",
          description: `Changed from "${oldName}" to "${result.name}"`,
          action: {
            label: "Undo",
            onClick: () => handleUndoCategoryEdit(result.id, oldName),
          },
        });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      savingRef.current = false;
    } finally {
      setEditingCategoryId(null);
    }
  };

  const handleSaveSkill = async () => {
    if (!editingSkillId || !editName.trim() || savingRef.current) {
      setEditingSkillId(null);
      return;
    }

    // Find the skill to check if there's a change
    let skillToEdit: Skill | null = null;
    let categoryContainingSkill: Category | null = null;

    for (const category of categories) {
      const skill = category.skills.find((s: Skill) => s.id === editingSkillId);
      if (skill) {
        skillToEdit = skill;
        categoryContainingSkill = category;
        break;
      }
    }

    // Skip if there's no change
    if (skillToEdit && skillToEdit.name === editName.trim()) {
      setEditingSkillId(null);
      savingRef.current = false;
      return;
    }

    savingRef.current = true;

    try {
      // Update local state first
      const newCategories = categories.map((cat: Category) => ({
        ...cat,
        skills: cat.skills.map((skill: Skill) =>
          skill.id === editingSkillId
            ? { ...skill, name: editName.trim() }
            : skill
        ),
      }));

      // Update categories state
      setCategories(newCategories);

      // Update selectedCategory if it contains the edited skill
      if (
        selectedCategory &&
        categoryContainingSkill &&
        selectedCategory.id === categoryContainingSkill.id
      ) {
        const updatedSelectedCategory = {
          ...selectedCategory,
          skills: selectedCategory.skills.map((skill: Skill) =>
            skill.id === editingSkillId
              ? { ...skill, name: editName.trim() }
              : skill
          ),
        };
        setSelectedCategory(updatedSelectedCategory);
      }

      // Update selected skill if it's the one being edited
      if (selectedSkill && selectedSkill.id === editingSkillId) {
        const updatedSelectedSkill = {
          ...selectedSkill,
          name: editName.trim(),
        };
        setSelectedSkill(updatedSelectedSkill);
      }

      // Save to database
      const result = await updateSkill.mutateAsync({
        id: editingSkillId,
        name: editName.trim(),
      });
      
      const oldName = previousName;
      // Only show toast if there was an actual change
      if (oldName !== result.name) {
        toast("Skill updated successfully", {
          position: "bottom-right",
          description: `Changed from "${oldName}" to "${result.name}"`,
          action: {
            label: "Undo",
            onClick: () => handleUndoSkillEdit(result.id, oldName),
          },
        });
      }
    } catch (error) {
      console.error("Error saving skill:", error);
      savingRef.current = false;
    } finally {
      setEditingSkillId(null);
    }
  };

  const handleSaveSubSkill = async () => {
    if (!editingSubSkillId || !editName.trim() || savingRef.current) {
      setEditingSubSkillId(null);
      return;
    }

    // Skip if there's no change
    if (selectedSkill) {
      const subSkill = selectedSkill.subSkills.find(
        (ss: SubSkill) => ss.id === editingSubSkillId
      );
      if (subSkill && subSkill.name === editName.trim()) {
        setEditingSubSkillId(null);
        savingRef.current = false;
        return;
      }
    }

    savingRef.current = true;

    try {
      // First update local state
      if (selectedSkill) {
        const updatedSubSkills = selectedSkill.subSkills.map((subSkill: SubSkill) =>
          subSkill.id === editingSubSkillId
            ? { ...subSkill, name: editName.trim() }
            : subSkill
        );

        const updatedSkill = {
          ...selectedSkill,
          subSkills: updatedSubSkills,
        };

        // Update the selected skill first
        setSelectedSkill(updatedSkill);

        // Then update the skill in categories
        const newCategories = categories.map((cat: Category) => ({
          ...cat,
          skills: cat.skills.map((skill: Skill) =>
            skill.id === selectedSkill.id ? updatedSkill : skill
          ),
        }));

        setCategories(newCategories);
      }

      // Save to database
      const result = await updateSubSkill.mutateAsync({
        id: editingSubSkillId,
        name: editName.trim(),
      });
      
      const oldName = previousName;
      // Only show toast if there was an actual change
      if (oldName !== result.name) {
        toast("Competency updated successfully", {
          position: "bottom-right",
          description: `Changed from "${oldName}" to "${result.name}"`,
          action: {
            label: "Undo",
            onClick: () => handleUndoSubSkillEdit(result.id, oldName),
          },
        });
      }
    } catch (error) {
      console.error("Error saving competency:", error);
      savingRef.current = false;
    } finally {
      setEditingSubSkillId(null);
    }
  };

  // Handlers for edit input events
  const handleEditInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingCategoryId) handleSaveCategory();
      if (editingSkillId) handleSaveSkill();
      if (editingSubSkillId) handleSaveSubSkill();
    } else if (e.key === "Escape") {
      setEditingCategoryId(null);
      setEditingSkillId(null);
      setEditingSubSkillId(null);
      savingRef.current = false;
    }
  };

  const handleEditInputBlur = () => {
    // Only save on blur if we're not already saving
    if (!savingRef.current) {
      if (editingCategoryId) handleSaveCategory();
      if (editingSkillId) handleSaveSkill();
      if (editingSubSkillId) handleSaveSubSkill();
    }
  };

  // Handlers for adding items
  const handleAddCategory = async (name: string) => {
    if (!name.trim()) return;

    const newId = crypto.randomUUID();
    const newCategory = {
      id: newId,
      name: name.trim(),
      skills: [],
    };

    // Update local state
    setCategories([...categories, newCategory]);

    try {
      // Save to database
      await createCategory.mutateAsync({
        id: newId,
        name: name.trim(),
      });

      toast.success("Category added", {
        position: "bottom-right",
        description: `Added category "${name.trim()}"`,
      });
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleAddSkill = async (name: string) => {
    if (!selectedCategory || !name.trim()) return;

    const newId = crypto.randomUUID();
    const newSkill: Skill = {
      id: newId,
      name: name.trim(),
      subSkills: [],
    };

    // Update the categories state
    const newCategories = categories.map((cat: Category) =>
      cat.id === selectedCategory.id
        ? { ...cat, skills: [...cat.skills, newSkill] }
        : cat
    );
    setCategories(newCategories);

    // Update the selectedCategory state
    const updatedCategory = {
      ...selectedCategory,
      skills: [...selectedCategory.skills, newSkill],
    };
    setSelectedCategory(updatedCategory);

    try {
      // Save to database
      await createSkill.mutateAsync({
        id: newId,
        name: name.trim(),
        categoryId: selectedCategory.id,
      });

      toast.success("Skill added", {
        position: "bottom-right",
        description: `Added skill "${name.trim()}" to category "${selectedCategory.name}"`,
      });
    } catch (error) {
      console.error("Error creating skill:", error);
    }
  };

  const handleAddCompetency = async (name: string, description: string) => {
    if (!selectedSkill || !name.trim()) return;

    const newId = crypto.randomUUID();
    const criterionId = crypto.randomUUID();
    const criterionDescription =
      description || "Define criteria for this competency";

    const newCompetency: SubSkill = {
      id: newId,
      name: name.trim(),
      criteria: [
        {
          id: criterionId,
          description: criterionDescription,
        },
      ],
    };

    // Update the selectedSkill state
    const updatedSkill = {
      ...selectedSkill,
      subSkills: [...selectedSkill.subSkills, newCompetency],
    };
    setSelectedSkill(updatedSkill);

    // Update the categories state
    const newCategories = categories.map((cat: Category) => ({
      ...cat,
      skills: cat.skills.map((skill: Skill) =>
        skill.id === selectedSkill.id ? updatedSkill : skill
      ),
    }));
    setCategories(newCategories);

    // Update the selectedCategory state
    if (selectedCategory) {
      const updatedCategory = {
        ...selectedCategory,
        skills: selectedCategory.skills.map((skill: Skill) =>
          skill.id === selectedSkill.id ? updatedSkill : skill
        ),
      };
      setSelectedCategory(updatedCategory);
    }

    try {
      // Save to database
      await createSubSkill.mutateAsync({
        id: newId,
        name: name.trim(),
        skillId: selectedSkill.id,
        criterionDescription,
      });

      toast.success("Competency added", {
        position: "bottom-right",
        description: `Added competency "${name.trim()}" to skill "${selectedSkill.name}"`,
      });
    } catch (error) {
      console.error("Error creating competency:", error);
    }
  };

  // Handlers for deleting items
  const handleDeleteCategory = async (categoryId: string) => {
    const category = categories.find((c: Category) => c.id === categoryId);
    if (!category) return;

    try {
      // Update local state
      const newCategories = categories.filter((cat: Category) => cat.id !== categoryId);
      setCategories(newCategories);

      // Clear selection if needed
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setSelectedSkill(null);
      }

      // Delete from database
      await deleteCategory.mutateAsync({ id: categoryId });
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setEditingCategoryId(null);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    let foundSkill: Skill | null = null;
    let foundCategory: Category | null = null;

    for (const category of categories) {
      const skill = category.skills.find((s: Skill) => s.id === skillId);
      if (skill) {
        foundSkill = skill;
        foundCategory = category;
        break;
      }
    }

    if (!foundSkill || !foundCategory) return;

    try {
      // Update local state
      const newCategories = categories.map((cat: Category) => {
        if (cat.id === foundCategory.id) {
          return {
            ...cat,
            skills: cat.skills.filter((s: Skill) => s.id !== skillId),
          };
        }
        return cat;
      });
      setCategories(newCategories);

      // Update selectedCategory if needed
      if (selectedCategory?.id === foundCategory.id) {
        const updatedCategory = {
          ...selectedCategory,
          skills: selectedCategory.skills.filter((s: Skill) => s.id !== skillId),
        };
        setSelectedCategory(updatedCategory);
      }

      // Clear selection if needed
      if (selectedSkill?.id === skillId) {
        setSelectedSkill(null);
      }

      // Delete from database
      await deleteSkill.mutateAsync({ id: skillId });
    } catch (error) {
      console.error("Error deleting skill:", error);
    } finally {
      setEditingSkillId(null);
    }
  };

  const handleDeleteSubSkill = async (subSkillId: string) => {
    if (!selectedSkill) return;

    const subSkill = selectedSkill.subSkills.find((ss: SubSkill) => ss.id === subSkillId);
    if (!subSkill) return;

    try {
      // Update local state
      const updatedSkill = {
        ...selectedSkill,
        subSkills: selectedSkill.subSkills.filter((ss: SubSkill) => ss.id !== subSkillId),
      };
      setSelectedSkill(updatedSkill);

      // Update the skills in categories
      const newCategories = categories.map((cat: Category) => ({
        ...cat,
        skills: cat.skills.map((skill: Skill) =>
          skill.id === selectedSkill.id ? updatedSkill : skill
        ),
      }));
      setCategories(newCategories);

      // Delete from database
      await deleteSubSkill.mutateAsync({ id: subSkillId });
    } catch (error) {
      console.error("Error deleting competency:", error);
    } finally {
      setEditingSubSkillId(null);
    }
  };

  // Function to open delete dialog
  const openDeleteDialog = (
    e: React.MouseEvent,
    id: string,
    name: string,
    type: "category" | "skill" | "competency"
  ) => {
    e.stopPropagation();
    e.preventDefault();

    setItemToDelete({ id, name, type });
    setDeleteDialogOpen(true);
  };

  // Handle confirmation from delete dialog
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case "category":
        void handleDeleteCategory(itemToDelete.id);
        break;
      case "skill":
        void handleDeleteSkill(itemToDelete.id);
        break;
      case "competency":
        void handleDeleteSubSkill(itemToDelete.id);
        break;
    }
  };

  // Undo handlers
  const handleUndoCategoryEdit = (categoryId: string, oldName: string) => {
    // Find the category in state
    const category = categories.find((cat: Category) => cat.id === categoryId);
    if (!category) return;

    // Update local state
    const newCategories = categories.map((cat: Category) =>
      cat.id === categoryId ? { ...cat, name: oldName } : cat
    );
    setCategories(newCategories);

    // Update selected category if needed
    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory({ ...selectedCategory, name: oldName });
    }

    // Save to database
    void updateCategory.mutate({ id: categoryId, name: oldName });

    toast.success("Category name reverted", {
      position: "bottom-right",
      description: `Changed back to "${oldName}"`,
    });
  };

  const handleUndoSkillEdit = (skillId: string, oldName: string) => {
    // Find the skill in state
    let foundSkill: Skill | null = null;
    let foundCategoryIndex = -1;

    categories.forEach((cat: Category, catIndex: number) => {
      const skill = cat.skills.find((s: Skill) => s.id === skillId);
      if (skill) {
        foundSkill = skill;
        foundCategoryIndex = catIndex;
      }
    });

    if (!foundSkill || foundCategoryIndex === -1) return;

    // Update local state
    const newCategories = categories.map((cat: Category, index: number) => {
      if (index !== foundCategoryIndex) return cat;
      return {
        ...cat,
        skills: cat.skills.map((skill: Skill) =>
          skill.id === skillId ? { ...skill, name: oldName } : skill
        ),
      };
    });
    setCategories(newCategories);

    // Update selected skill if needed
    if (selectedSkill && selectedSkill.id === skillId) {
      setSelectedSkill({ ...selectedSkill, name: oldName });
    }

    // Save to database
    void updateSkill.mutate({ id: skillId, name: oldName });

    toast.success("Skill name reverted", {
      position: "bottom-right",
      description: `Changed back to "${oldName}"`,
    });
  };

  const handleUndoSubSkillEdit = (subSkillId: string, oldName: string) => {
    if (!selectedSkill) return;

    // Find the subskill
    const subSkill = selectedSkill.subSkills.find((ss: SubSkill) => ss.id === subSkillId);
    if (!subSkill) return;

    // Update local state
    const updatedSkill = {
      ...selectedSkill,
      subSkills: selectedSkill.subSkills.map((ss: SubSkill) =>
        ss.id === subSkillId ? { ...ss, name: oldName } : ss
      ),
    };

    setSelectedSkill(updatedSkill);

    // Update in categories
    const newCategories = categories.map((cat: Category) => ({
      ...cat,
      skills: cat.skills.map((skill: Skill) =>
        skill.id === selectedSkill.id ? updatedSkill : skill
      ),
    }));

    setCategories(newCategories);

    // Save to database
    void updateSubSkill.mutate({ id: subSkillId, name: oldName });

    toast.success("Competency name reverted", {
      position: "bottom-right",
      description: `Changed back to "${oldName}"`,
    });
  };

  return {
    // Selection handlers
    handleCategorySelect,
    handleSkillSelect,
    
    // Edit handlers
    startEditingCategory,
    startEditingSkill,
    startEditingSubSkill,
    handleSaveCategory,
    handleSaveSkill,
    handleSaveSubSkill,
    handleEditInputKeyDown,
    handleEditInputBlur,
    
    // Add handlers
    handleAddCategory,
    handleAddSkill,
    handleAddCompetency,
    
    // Delete handlers
    handleDeleteCategory,
    handleDeleteSkill,
    handleDeleteSubSkill,
    openDeleteDialog,
    handleDeleteConfirm,
    
    // Undo handlers
    handleUndoCategoryEdit,
    handleUndoSkillEdit,
    handleUndoSubSkillEdit,
  };
} 