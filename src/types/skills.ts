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