import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit3,
  Plus,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import type { Category, Skill, SubSkill } from "~/types/skills";
import { SkillsUploadDialog } from "./SkillsUploadDialog";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface SkillTaxonomyProps {
  categories: Category[];
}

// Add Category Dialog Component
const AddCategoryDialog = ({
  onAddCategory,
}: {
  onAddCategory: (name: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleAdd = () => {
    if (name.trim()) {
      onAddCategory(name.trim());
      setName("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-900"
          title="Add Category"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter category name"
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="gap-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim()}
            className="gap-2 bg-black text-white hover:bg-gray-800"
          >
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Skill Dialog Component
const AddSkillDialog = ({
  categoryName,
  onAddSkill,
}: {
  categoryName: string;
  onAddSkill: (name: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleAdd = () => {
    if (name.trim()) {
      onAddSkill(name.trim());
      setName("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-900"
          title="Add Skill"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Skill to {categoryName}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter skill name"
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="gap-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim()}
            className="gap-2 bg-black text-white hover:bg-gray-800"
          >
            Add Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Competency Dialog Component
const AddCompetencyDialog = ({
  skillName,
  onAddCompetency,
}: {
  skillName: string;
  onAddCompetency: (name: string, description: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleAdd = () => {
    if (name.trim()) {
      onAddCompetency(
        name.trim(),
        description.trim() || "Define criteria for this competency",
      );
      setName("");
      setDescription("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-900"
          title="Add Competency"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Competency to {skillName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label
              htmlFor="competency-name"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Competency Name
            </label>
            <Input
              id="competency-name"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter competency name"
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="competency-description"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Criterion Statement
            </label>
            <textarea
              id="competency-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter criterion statement"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="gap-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim()}
            className="gap-2 bg-black text-white hover:bg-gray-800"
          >
            Add Competency
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const SkillTaxonomy: React.FC<SkillTaxonomyProps> = ({
  categories: initialCategories,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Remove the old state for new item inputs since we'll use dialogs instead
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(
    new Set(),
  );

  // Editing states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSubSkillId, setEditingSubSkillId] = useState<string | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [previousName, setPreviousName] = useState(""); // Store the previous name for undo

  // Flag to track if a save is in progress
  const savingRef = useRef(false);

  // Refs for input elements
  const editInputRef = useRef<HTMLInputElement>(null);

  // TRPC mutations
  const updateCategory = api.skills.updateCategory.useMutation({
    onSuccess: (updatedCategory) => {
      const oldName = previousName;
      // Only show toast if there was an actual change
      if (oldName !== updatedCategory.name) {
        toast("Category updated successfully", {
          position: "bottom-right",
          description: `Changed from "${oldName}" to "${updatedCategory.name}"`,
          action: {
            label: "Undo",
            onClick: () => handleUndoCategoryEdit(updatedCategory.id, oldName),
          },
        });
      }
      savingRef.current = false;
    },
    onError: () => {
      toast.error("Failed to update category", {
        position: "bottom-right",
        description:
          "There was an error updating the category. Please try again.",
      });
      savingRef.current = false;
    },
  });

  const updateSkill = api.skills.updateSkill.useMutation({
    onSuccess: (updatedSkill) => {
      const oldName = previousName;
      // Only show toast if there was an actual change
      if (oldName !== updatedSkill.name) {
        toast("Skill updated successfully", {
          position: "bottom-right",
          description: `Changed from "${oldName}" to "${updatedSkill.name}"`,
          action: {
            label: "Undo",
            onClick: () => handleUndoSkillEdit(updatedSkill.id, oldName),
          },
        });
      }
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
    onSuccess: (updatedSubSkill) => {
      const oldName = previousName;
      // Only show toast if there was an actual change
      if (oldName !== updatedSubSkill.name) {
        toast("Competency updated successfully", {
          position: "bottom-right",
          description: `Changed from "${oldName}" to "${updatedSubSkill.name}"`,
          action: {
            label: "Undo",
            onClick: () => handleUndoSubSkillEdit(updatedSubSkill.id, oldName),
          },
        });
      }
      savingRef.current = false;
    },
    onError: () => {
      toast.error("Failed to update competency", {
        position: "bottom-right",
        description:
          "There was an error updating the competency. Please try again.",
      });
      savingRef.current = false;
    },
  });

  // Undo functions
  const handleUndoCategoryEdit = (categoryId: string, oldName: string) => {
    // Find the category in state
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    // Update local state
    const newCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name: oldName } : cat,
    );
    setCategories(newCategories);

    // Update selected category if it's the one being edited
    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory({ ...selectedCategory, name: oldName });
    }

    // Save to database
    updateCategory.mutate({ id: categoryId, name: oldName });

    toast.success("Category name reverted", {
      position: "bottom-right",
      description: `Changed back to "${oldName}"`,
    });
  };

  const handleUndoSkillEdit = (skillId: string, oldName: string) => {
    // Find the skill in state
    let foundSkill: Skill | null = null;
    let foundCategoryIndex = -1;

    // Look through categories to find the skill
    categories.forEach((cat, catIndex) => {
      const skill = cat.skills.find((s) => s.id === skillId);
      if (skill) {
        foundSkill = skill;
        foundCategoryIndex = catIndex;
      }
    });

    if (!foundSkill || foundCategoryIndex === -1) return;

    // Update local state
    const newCategories = categories.map((cat, index) => {
      if (index !== foundCategoryIndex) return cat;
      return {
        ...cat,
        skills: cat.skills.map((skill) =>
          skill.id === skillId ? { ...skill, name: oldName } : skill,
        ),
      };
    });
    setCategories(newCategories);

    // Update selected skill if it's the one being edited
    if (selectedSkill && selectedSkill.id === skillId) {
      setSelectedSkill({ ...selectedSkill, name: oldName });
    }

    // Save to database
    updateSkill.mutate({ id: skillId, name: oldName });

    toast.success("Skill name reverted", {
      position: "bottom-right",
      description: `Changed back to "${oldName}"`,
    });
  };

  const handleUndoSubSkillEdit = (subSkillId: string, oldName: string) => {
    if (!selectedSkill) return;

    // Find the subskill
    const subSkill = selectedSkill.subSkills.find((ss) => ss.id === subSkillId);
    if (!subSkill) return;

    // Update local state
    const updatedSkill = {
      ...selectedSkill,
      subSkills: selectedSkill.subSkills.map((ss) =>
        ss.id === subSkillId ? { ...ss, name: oldName } : ss,
      ),
    };

    setSelectedSkill(updatedSkill);

    // Update in categories
    const newCategories = categories.map((cat) => ({
      ...cat,
      skills: cat.skills.map((skill) =>
        skill.id === selectedSkill.id ? updatedSkill : skill,
      ),
    }));

    setCategories(newCategories);

    // Save to database
    updateSubSkill.mutate({ id: subSkillId, name: oldName });

    toast.success("Competency name reverted", {
      position: "bottom-right",
      description: `Changed back to "${oldName}"`,
    });
  };

  // Effect to focus input when editing starts
  useEffect(() => {
    if (
      editInputRef.current &&
      (editingCategoryId || editingSkillId || editingSubSkillId)
    ) {
      editInputRef.current.focus();
    }
  }, [editingCategoryId, editingSkillId, editingSubSkillId]);

  // Effect to clean up the saving flag when component unmounts
  useEffect(() => {
    return () => {
      savingRef.current = false;
    };
  }, []);

  // Add handlers
  const handleAddCategory = (name: string) => {
    if (!name.trim()) return;

    const newCategory = {
      id: crypto.randomUUID(),
      name: name.trim(),
      skills: [],
    };

    setCategories([...categories, newCategory]);

    // Show success toast
    toast.success("Category added", {
      position: "bottom-right",
      description: `Added category "${name.trim()}"`,
    });
  };

  const handleAddSkill = (name: string) => {
    if (!selectedCategory || !name.trim()) return;

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: name.trim(),
      subSkills: [],
    };

    // Update the categories state
    const newCategories = categories.map((cat) =>
      cat.id === selectedCategory.id
        ? { ...cat, skills: [...cat.skills, newSkill] }
        : cat,
    );
    setCategories(newCategories);

    // Update the selectedCategory state to reflect the new skill
    const updatedCategory = {
      ...selectedCategory,
      skills: [...selectedCategory.skills, newSkill],
    };
    setSelectedCategory(updatedCategory);

    // Show success toast
    toast.success("Skill added", {
      position: "bottom-right",
      description: `Added skill "${name.trim()}" to category "${selectedCategory.name}"`,
    });
  };

  const handleAddCompetency = (name: string, description: string) => {
    if (!selectedSkill || !name.trim()) return;

    const newCompetency: SubSkill = {
      id: crypto.randomUUID(),
      name: name.trim(),
      criteria: [
        {
          id: crypto.randomUUID(),
          description: description || "Define criteria for this competency",
        },
      ],
    };

    // Update the selectedSkill state
    const updatedSkill = {
      ...selectedSkill,
      subSkills: [...selectedSkill.subSkills, newCompetency],
    };
    setSelectedSkill(updatedSkill);

    // Update the categories and selectedCategory state
    const newCategories = categories.map((cat) => ({
      ...cat,
      skills: cat.skills.map((skill) =>
        skill.id === selectedSkill.id ? updatedSkill : skill,
      ),
    }));
    setCategories(newCategories);

    if (selectedCategory) {
      const updatedCategory = {
        ...selectedCategory,
        skills: selectedCategory.skills.map((skill) =>
          skill.id === selectedSkill.id ? updatedSkill : skill,
        ),
      };
      setSelectedCategory(updatedCategory);
    }

    // Show success toast
    toast.success("Competency added", {
      position: "bottom-right",
      description: `Added competency "${name.trim()}" to skill "${selectedSkill.name}"`,
    });
  };

  const handleCategorySelect = (category: Category) => {
    if (editingCategoryId || editingSkillId || editingSubSkillId) return;
    setSelectedCategory(category);
    setSelectedSkill(null);
  };

  const handleSkillSelect = (skill: Skill) => {
    if (editingCategoryId || editingSkillId || editingSubSkillId) return;
    setSelectedSkill(skill);
  };

  const toggleCriterion = (criterionId: string) => {
    if (editingCategoryId || editingSkillId || editingSubSkillId) return;
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criterionId)) {
      newExpanded.delete(criterionId);
    } else {
      newExpanded.add(criterionId);
    }
    setExpandedCriteria(newExpanded);
  };

  // Edit functions
  const startEditingCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setPreviousName(category.name); // Store the original name for undo
  };

  const startEditingSkill = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    setEditingSkillId(skill.id);
    setEditName(skill.name);
    setPreviousName(skill.name); // Store the original name for undo
  };

  const startEditingSubSkill = (e: React.MouseEvent, subSkill: SubSkill) => {
    e.stopPropagation();
    setEditingSubSkillId(subSkill.id);
    setEditName(subSkill.name);
    setPreviousName(subSkill.name); // Store the original name for undo
  };

  const handleSaveCategory = async () => {
    if (!editingCategoryId || !editName.trim() || savingRef.current) {
      setEditingCategoryId(null);
      return;
    }

    // Skip if there's no change
    const category = categories.find((c) => c.id === editingCategoryId);
    if (category && category.name === editName.trim()) {
      setEditingCategoryId(null);
      savingRef.current = false;
      return;
    }

    savingRef.current = true;

    try {
      // Update local state
      const newCategories = categories.map((cat) =>
        cat.id === editingCategoryId ? { ...cat, name: editName.trim() } : cat,
      );
      setCategories(newCategories);

      // Update selected category if it's the one being edited
      if (selectedCategory && selectedCategory.id === editingCategoryId) {
        setSelectedCategory({ ...selectedCategory, name: editName.trim() });
      }

      // Save to database
      await updateCategory.mutateAsync({
        id: editingCategoryId,
        name: editName.trim(),
      });
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
      const skill = category.skills.find((s) => s.id === editingSkillId);
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
      // Create the updated skill with new name
      const updatedSkill = skillToEdit
        ? { ...skillToEdit, name: editName.trim() }
        : null;

      // Update local state first
      const newCategories = categories.map((cat) => ({
        ...cat,
        skills: cat.skills.map((skill) =>
          skill.id === editingSkillId
            ? { ...skill, name: editName.trim() }
            : skill,
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
          skills: selectedCategory.skills.map((skill) =>
            skill.id === editingSkillId
              ? { ...skill, name: editName.trim() }
              : skill,
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
      await updateSkill.mutateAsync({
        id: editingSkillId,
        name: editName.trim(),
      });
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
        (ss) => ss.id === editingSubSkillId,
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
        const updatedSubSkills = selectedSkill.subSkills.map((subSkill) =>
          subSkill.id === editingSubSkillId
            ? { ...subSkill, name: editName.trim() }
            : subSkill,
        );

        const updatedSkill = {
          ...selectedSkill,
          subSkills: updatedSubSkills,
        };

        // Update the selected skill first
        setSelectedSkill(updatedSkill);

        // Then update the skill in categories
        const newCategories = categories.map((cat) => ({
          ...cat,
          skills: cat.skills.map((skill) =>
            skill.id === selectedSkill.id ? updatedSkill : skill,
          ),
        }));

        setCategories(newCategories);
      }

      // Save to database
      await updateSubSkill.mutateAsync({
        id: editingSubSkillId,
        name: editName.trim(),
      });
    } catch (error) {
      console.error("Error saving competency:", error);
      savingRef.current = false;
    } finally {
      setEditingSubSkillId(null);
    }
  };

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
    // Only save on blur if we're not already saving (prevents double save when clicking the check icon)
    if (!savingRef.current) {
      if (editingCategoryId) handleSaveCategory();
      if (editingSkillId) handleSaveSkill();
      if (editingSubSkillId) handleSaveSubSkill();
    }
  };

  return (
    <div>
      <div className="flex h-[calc(100vh-12rem)] gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Categories Column */}
        <div className="flex w-1/3 min-w-[250px] flex-col border-r border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
            <h2 className="font-semibold text-gray-900">Categories</h2>
            <div className="flex gap-2">
              <SkillsUploadDialog />
              <AddCategoryDialog onAddCategory={handleAddCategory} />
            </div>
          </div>
          <div className="overflow-y-auto p-2">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-50 ${
                  selectedCategory?.id === category.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700"
                }`}
              >
                {editingCategoryId === category.id ? (
                  <Input
                    ref={editInputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleEditInputKeyDown}
                    onBlur={handleEditInputBlur}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      height: "auto",
                      minHeight: "unset",
                      padding: 0,
                    }}
                    className="w-full border-none bg-transparent p-0 font-medium text-gray-900 shadow-none outline-none hover:cursor-text focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                ) : (
                  <span className="font-medium">{category.name}</span>
                )}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {editingCategoryId === category.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveCategory();
                      }}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => startEditingCategory(e, category)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills Column */}
        {selectedCategory && (
          <div className="flex w-1/3 min-w-[250px] flex-col border-r border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
              <h2 className="font-semibold text-gray-900">Skills</h2>
              <AddSkillDialog
                categoryName={selectedCategory.name}
                onAddSkill={handleAddSkill}
              />
            </div>
            <div className="overflow-y-auto p-2">
              {selectedCategory.skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillSelect(skill)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-50 ${
                    selectedSkill?.id === skill.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  {editingSkillId === skill.id ? (
                    <Input
                      ref={editInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleEditInputKeyDown}
                      onBlur={handleEditInputBlur}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: "inherit",
                        lineHeight: "inherit",
                        height: "auto",
                        minHeight: "unset",
                        padding: 0,
                      }}
                      className="w-full border-none bg-transparent p-0 font-medium text-gray-900 shadow-none outline-none hover:cursor-text focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  ) : (
                    <span className="font-medium">{skill.name}</span>
                  )}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {editingSkillId === skill.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveSkill();
                        }}
                        className="p-1 text-gray-500 hover:text-gray-900"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => startEditingSkill(e, skill)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
              {selectedCategory.skills.length === 0 && (
                <div className="py-6 text-center text-gray-500">
                  <p>No skills added yet</p>
                  <p className="text-sm">Click the + button to add a skill</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Criteria Column */}
        {selectedSkill && (
          <div className="flex min-w-[300px] flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
              <h2 className="font-semibold text-gray-900">Criteria</h2>
              <AddCompetencyDialog
                skillName={selectedSkill.name}
                onAddCompetency={handleAddCompetency}
              />
            </div>
            <div className="overflow-y-auto p-4">
              <div className="grid gap-4">
                {selectedSkill.subSkills.map((subSkill) => {
                  const criterionId = `${selectedSkill.id}-${subSkill.id}`;
                  const isExpanded = expandedCriteria.has(criterionId);

                  return (
                    <div
                      key={criterionId}
                      className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div
                        className="flex cursor-pointer items-center justify-between p-4"
                        onClick={() => toggleCriterion(criterionId)}
                      >
                        {editingSubSkillId === subSkill.id ? (
                          <Input
                            ref={editInputRef}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={handleEditInputKeyDown}
                            onBlur={handleEditInputBlur}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: "inherit",
                              lineHeight: "inherit",
                              height: "auto",
                              minHeight: "unset",
                              padding: 0,
                            }}
                            className="w-full border-none bg-transparent p-0 font-semibold text-gray-900 shadow-none outline-none hover:cursor-text focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        ) : (
                          <h3 className="font-semibold text-gray-900">
                            {subSkill.name}
                          </h3>
                        )}
                        <div className="flex items-center gap-2">
                          {editingSubSkillId === subSkill.id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveSubSkill();
                              }}
                              className="p-1 text-gray-500 hover:text-gray-900"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              className="p-1 text-gray-500 hover:text-gray-700"
                              onClick={(e) => startEditingSubSkill(e, subSkill)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      {isExpanded && subSkill.criteria[0] && (
                        <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                          <p className="text-gray-700">
                            {subSkill.criteria[0].description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedSkill.subSkills.length === 0 && (
                <div className="py-6 text-center text-gray-500">
                  <p>No criteria added yet</p>
                  <p className="text-sm">Click the + button to add criteria</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
