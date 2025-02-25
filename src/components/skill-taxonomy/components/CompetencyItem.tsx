import { ChevronDown, ChevronUp, Edit3, Trash2 } from "lucide-react";
import React from "react";
import { Input } from "~/components/ui/input";
import type { SubSkill } from "~/types/skills";

interface CompetencyItemProps {
  subSkill: SubSkill;
  skillId: string;
  isExpanded: boolean;
  isEditing: boolean;
  editName: string;
  editInputRef: React.RefObject<HTMLInputElement>;
  onToggleCriterion: (criterionId: string) => void;
  onStartEditing: (e: React.MouseEvent, subSkill: SubSkill) => void;
  onOpenDeleteDialog: (
    e: React.MouseEvent,
    id: string,
    name: string,
    type: "category" | "skill" | "competency",
  ) => void;
  onEditSave: () => void;
  onEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditInputKeyDown: (e: React.KeyboardEvent) => void;
  onEditInputBlur: () => void;
}

export function CompetencyItem({
  subSkill,
  skillId,
  isExpanded,
  isEditing,
  editName,
  editInputRef,
  onToggleCriterion,
  onStartEditing,
  onOpenDeleteDialog,
  onEditSave,
  onEditInputChange,
  onEditInputKeyDown,
  onEditInputBlur,
}: CompetencyItemProps) {
  const criterionId = `${skillId}-${subSkill.id}`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className="flex cursor-pointer items-center justify-between p-2.5"
        onClick={() => onToggleCriterion(criterionId)}
      >
        {isEditing ? (
          <Input
            ref={editInputRef}
            value={editName}
            onChange={onEditInputChange}
            onKeyDown={onEditInputKeyDown}
            onBlur={onEditInputBlur}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: "inherit",
              lineHeight: "inherit",
              height: "auto",
              minHeight: "unset",
              padding: 0,
            }}
            className="w-full border-none bg-transparent p-0 text-sm font-semibold text-gray-900 shadow-none outline-none hover:cursor-text focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        ) : (
          <h3 className="text-sm font-semibold text-gray-900">
            {subSkill.name}
          </h3>
        )}
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSave();
              }}
              className="p-0.5 text-gray-500 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check h-3.5 w-3.5"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          ) : (
            <button
              className="p-0.5 text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing(e, subSkill);
              }}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDeleteDialog(e, subSkill.id, subSkill.name, "competency");
            }}
            className="p-0.5 text-gray-500 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </div>
      </div>
      {isExpanded && subSkill.criteria[0] && (
        <div className="border-t border-gray-100 px-3 pb-2.5 pt-1.5">
          <p className="text-xs text-gray-700">
            {subSkill.criteria[0].description}
          </p>
        </div>
      )}
    </div>
  );
}
