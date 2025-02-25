"use client";

import { Loader2 } from "lucide-react";
import { useRef } from "react";
import { api } from "~/trpc/react";
import { CategoryItem } from "./components/CategoryItem";
import { CompetencyItem } from "./components/CompetencyItem";
import { SkillItem } from "./components/SkillItem";
import { AddCategoryDialog } from "./dialogs/AddCategoryDialog";
import { AddCompetencyDialog } from "./dialogs/AddCompetencyDialog";
import { AddSkillDialog } from "./dialogs/AddSkillDialog";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { SkillsUploadDialog } from "./dialogs/SkillsUploadDialog";
import { useTaxonomyActions } from "./hooks/useTaxonomyActions";
import { useTaxonomyState } from "./hooks/useTaxonomyState";

export default function SkillsPage() {
  // All hooks must be at the top level before any conditional returns
  const { data: categories, isLoading } = api.skills.getAll.useQuery();

  // Refs
  const editInputRef = useRef<HTMLInputElement>(null);

  // Get state from hook - using an empty array for initial state if categories is undefined
  const taxonomyState = useTaxonomyState(categories ?? []);

  // Get actions from hook
  const actions = useTaxonomyActions({
    ...taxonomyState,
    editInputRef,
  });

  const {
    categories: stateCategories,
    selectedCategory,
    selectedSkill,
    expandedCriteria,
    editingCategoryId,
    editingSkillId,
    editingSubSkillId,
    editName,
    deleteDialogOpen,
    itemToDelete,
  } = taxonomyState;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-verbo-purple" />
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

      <div>
        <div className="flex h-[calc(100vh-12rem)] gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Categories Column */}
          <div className="flex w-1/3 min-w-[250px] flex-col border-r border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-2 pl-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Categories
              </h2>
              <div className="flex gap-1">
                <SkillsUploadDialog />
                <AddCategoryDialog onAddCategory={actions.handleAddCategory} />
              </div>
            </div>
            <div className="overflow-y-auto p-1.5">
              {stateCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory?.id === category.id}
                  isEditing={editingCategoryId === category.id}
                  editName={editName}
                  editInputRef={editInputRef}
                  onCategorySelect={actions.handleCategorySelect}
                  onStartEditing={actions.startEditingCategory}
                  onOpenDeleteDialog={actions.openDeleteDialog}
                  onEditSave={actions.handleSaveCategory}
                  onEditInputChange={(e) =>
                    taxonomyState.setEditName(e.target.value)
                  }
                  onEditInputKeyDown={actions.handleEditInputKeyDown}
                  onEditInputBlur={actions.handleEditInputBlur}
                />
              ))}
              {stateCategories.length === 0 && (
                <div className="py-4 text-center text-sm text-gray-500">
                  <p>No categories found</p>
                  <p className="text-xs">
                    Click the + button to add a category
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Skills Column */}
          {selectedCategory && (
            <div className="flex w-1/3 min-w-[250px] flex-col border-r border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-2 pl-3">
                <h2 className="text-sm font-semibold text-gray-900">Skills</h2>
                <AddSkillDialog
                  categoryName={selectedCategory.name}
                  onAddSkill={actions.handleAddSkill}
                />
              </div>
              <div className="overflow-y-auto p-1.5">
                {selectedCategory.skills.map((skill) => (
                  <SkillItem
                    key={skill.id}
                    skill={skill}
                    isSelected={selectedSkill?.id === skill.id}
                    isEditing={editingSkillId === skill.id}
                    editName={editName}
                    editInputRef={editInputRef}
                    onSkillSelect={actions.handleSkillSelect}
                    onStartEditing={actions.startEditingSkill}
                    onOpenDeleteDialog={actions.openDeleteDialog}
                    onEditSave={actions.handleSaveSkill}
                    onEditInputChange={(e) =>
                      taxonomyState.setEditName(e.target.value)
                    }
                    onEditInputKeyDown={actions.handleEditInputKeyDown}
                    onEditInputBlur={actions.handleEditInputBlur}
                  />
                ))}
                {selectedCategory.skills.length === 0 && (
                  <div className="py-4 text-center text-sm text-gray-500">
                    <p>No skills added yet</p>
                    <p className="text-xs">Click the + button to add a skill</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Criteria Column */}
          {selectedSkill && (
            <div className="flex min-w-[300px] flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-2 pl-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  Criteria
                </h2>
                <AddCompetencyDialog
                  skillName={selectedSkill.name}
                  onAddCompetency={actions.handleAddCompetency}
                />
              </div>
              <div className="overflow-y-auto p-2.5">
                <div className="grid gap-2.5">
                  {selectedSkill.subSkills.map((subSkill) => {
                    const criterionId = `${selectedSkill.id}-${subSkill.id}`;
                    const isExpanded = expandedCriteria.has(criterionId);

                    return (
                      <CompetencyItem
                        key={subSkill.id}
                        subSkill={subSkill}
                        skillId={selectedSkill.id}
                        isExpanded={isExpanded}
                        isEditing={editingSubSkillId === subSkill.id}
                        editName={editName}
                        editInputRef={editInputRef}
                        onToggleCriterion={taxonomyState.toggleCriterion}
                        onStartEditing={actions.startEditingSubSkill}
                        onOpenDeleteDialog={actions.openDeleteDialog}
                        onEditSave={actions.handleSaveSubSkill}
                        onEditInputChange={(e) =>
                          taxonomyState.setEditName(e.target.value)
                        }
                        onEditInputKeyDown={actions.handleEditInputKeyDown}
                        onEditInputBlur={actions.handleEditInputBlur}
                      />
                    );
                  })}
                </div>
                {selectedSkill.subSkills.length === 0 && (
                  <div className="py-4 text-center text-sm text-gray-500">
                    <p>No criteria added yet</p>
                    <p className="text-xs">
                      Click the + button to add criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          setOpen={taxonomyState.setDeleteDialogOpen}
          itemName={itemToDelete?.name ?? ""}
          itemType={itemToDelete?.type ?? "category"}
          onConfirm={actions.handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
