import {
    Blocks,
    Brain,
    Briefcase,
    Cloud,
    Code2,
    Cpu,
    Database,
    LineChart,
    Palette,
    Shield,
    Smartphone,
    Users,
} from "lucide-react";

// New flexible types for database-sourced data
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

export const iconMap = {
  Code2,
  Palette,
  Database,
  Cloud,
  Brain,
  Briefcase,
  LineChart,
  Smartphone,
  Shield,
  Cpu,
  Users,
  Blocks,
} as const;

export type IconName = keyof typeof iconMap;

export interface CommonPosition {
  id: string;
  title: string;
  icon: IconName;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export type JobTitle = string;

export const steps = [
  {
    title: "Job Description",
    description: "Enter or upload the job description",
  },
  { title: "Skills", description: "Review and edit required skills" },
  {
    title: "Assessment",
    description: "Review and customize the technical case",
  },
];