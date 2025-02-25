import { IconName } from "./icons";

// Database model interfaces
export interface Category {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  subSkills: SubSkill[];
}

export interface SubSkill {
  id: string;
  name: string;
  criteria: Criterion[];
}

export interface Criterion {
  id: string;
  description: string;
}

// Position-related types
export type SkillName = string;
export type CategoryName = string;
export type CompetencyName = string;

export interface Competency {
  name: CompetencyName;
  selected: boolean;
}

export interface CategoryGroup {
  category: CategoryName;
  skills: Array<{
    name: SkillName;
    competencies: Competency[];
  }>;
}

// Interface for CommonPosition from the database
export interface CommonPosition {
  id: string;
  title: string;
  icon: IconName;
  description: string;
  created_at: Date;
  updated_at: Date;
} 