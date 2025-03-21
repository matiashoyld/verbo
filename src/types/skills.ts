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
  competencies: CompetencyModel[];
}

export interface CompetencyModel {
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
  numId?: number | null;
}

export interface CategoryGroup {
  category: CategoryName;
  categoryNumId?: number | null;
  skills: Array<{
    name: SkillName;
    numId?: number | null;
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