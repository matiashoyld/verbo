import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit2,
  Plus,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import type { Category, Skill } from "~/types/skills";
import { SkillsUploadDialog } from "./SkillsUploadDialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SkillTaxonomyProps {
  categories: Category[];
}

export const SkillTaxonomy: React.FC<SkillTaxonomyProps> = ({
  categories: initialCategories,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(
    new Set(),
  );

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([
        ...categories,
        { id: crypto.randomUUID(), name: newCategoryName, skills: [] },
      ]);
      setNewCategoryName("");
      setShowNewCategoryInput(false);
    }
  };

  const handleAddSkill = (categoryIndex: number) => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: "New Skill",
      subSkills: [],
    };
    const newCategories = [...categories];
    if (newCategories[categoryIndex]) {
      newCategories[categoryIndex].skills.push(newSkill);
      setCategories(newCategories);
    }
  };

  const handleGenerateWithAI = (categoryIndex: number) => {
    // This would integrate with an AI service to generate skills and criteria
    const category = categories[categoryIndex];
    if (!category) return;

    console.log("AI generation for category:", category.name);
    const aiGeneratedSkill: Skill = {
      id: crypto.randomUUID(),
      name: "AI Generated Skill",
      subSkills: [
        {
          id: crypto.randomUUID(),
          name: "AI Generated SubSkill",
          criteria: [
            {
              id: crypto.randomUUID(),
              description: "This would be an AI-generated criterion",
            },
          ],
        },
      ],
    };
    const newCategories = [...categories];
    if (newCategories[categoryIndex]) {
      newCategories[categoryIndex].skills.push(aiGeneratedSkill);
      setCategories(newCategories);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSkill(null);
  };

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const toggleCriterion = (criterionId: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criterionId)) {
      newExpanded.delete(criterionId);
    } else {
      newExpanded.add(criterionId);
    }
    setExpandedCriteria(newExpanded);
  };

  return (
    <div className="p-6">
      <div className="flex h-[calc(100vh-12rem)] gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Categories Column */}
        <div className="flex w-1/3 min-w-[250px] flex-col border-r border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
            <h2 className="font-semibold text-verbo-dark">Categories</h2>
            <div className="flex gap-2">
              <SkillsUploadDialog />
              <Button
                onClick={() => setShowNewCategoryInput(true)}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-verbo-purple"
                title="Add Category"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="overflow-y-auto p-2">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-50 ${
                  selectedCategory?.id === category.id
                    ? "bg-verbo-purple/10 text-verbo-purple"
                    : "text-verbo-dark"
                }`}
              >
                <span className="font-medium">{category.name}</span>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateWithAI(index);
                    }}
                    className="p-1 text-gray-500 hover:text-verbo-blue"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSkill(index);
                    }}
                    className="p-1 text-gray-500 hover:text-verbo-green"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
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
              <h2 className="font-semibold text-verbo-dark">Skills</h2>
              <Button
                onClick={() =>
                  handleAddSkill(categories.indexOf(selectedCategory))
                }
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-verbo-green"
                title="Add Skill"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto p-2">
              {selectedCategory.skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillSelect(skill)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-50 ${
                    selectedSkill?.id === skill.id
                      ? "bg-verbo-purple/10 text-verbo-purple"
                      : "text-verbo-dark"
                  }`}
                >
                  <span className="font-medium">{skill.name}</span>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="p-1 text-gray-500 hover:text-verbo-blue">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
              {selectedCategory.skills.length === 0 && (
                <div className="py-6 text-center text-gray-500">
                  <p>No skills added yet</p>
                  <p className="text-sm">
                    Click the + button to add a skill or use AI to generate
                    skills
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Criteria Column */}
        {selectedSkill && (
          <div className="flex min-w-[300px] flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-3">
              <h2 className="font-semibold text-verbo-dark">Criteria</h2>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-verbo-green"
                title="Add Criteria"
              >
                <Plus className="h-4 w-4" />
              </Button>
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
                        <h3 className="font-semibold text-verbo-dark">
                          {subSkill.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 text-gray-500 hover:text-verbo-blue"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      {isExpanded && subSkill.criteria[0] && (
                        <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                          <p className="text-verbo-dark">
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

      {showNewCategoryInput && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="flex-1"
            />
            <Button
              onClick={handleAddCategory}
              className="bg-verbo-green text-white hover:bg-verbo-green/90"
            >
              Add
            </Button>
            <Button
              onClick={() => setShowNewCategoryInput(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
