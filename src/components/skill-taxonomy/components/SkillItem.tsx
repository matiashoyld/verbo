import { ChevronRight, Edit3, Trash2 } from "lucide-react";
import React from "react";
import { Input } from "~/components/ui/input";
import type { Skill } from "~/types/skills";

interface SkillItemProps {
  skill: Skill;
  isSelected: boolean;
  isEditing: boolean;
  editName: string;
  editInputRef: React.RefObject<HTMLInputElement>;
  onSkillSelect: (skill: Skill) => void;
  onStartEditing: (e: React.MouseEvent, skill: Skill) => void;
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

export function SkillItem({
  skill,
  isSelected,
  isEditing,
  editName,
  editInputRef,
  onSkillSelect,
  onStartEditing,
  onOpenDeleteDialog,
  onEditSave,
  onEditInputChange,
  onEditInputKeyDown,
  onEditInputBlur,
}: SkillItemProps) {
  return (
    <button
      onClick={() => onSkillSelect(skill)}
      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${
        isSelected ? "bg-gray-100 text-gray-900" : "text-gray-700"
      }`}
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
          className="w-full border-none bg-transparent p-0 font-medium text-gray-900 shadow-none outline-none hover:cursor-text focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      ) : (
        <span className="font-medium">{skill.name}</span>
      )}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
            onClick={(e) => onStartEditing(e, skill)}
            className="p-0.5 text-gray-500 hover:text-gray-700"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            onOpenDeleteDialog(e, skill.id, skill.name, "skill");
          }}
          className="p-0.5 text-gray-500 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
      </div>
    </button>
  );
}
